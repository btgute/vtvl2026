'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { UploadCloud, Sparkles, Search, Download, AlertOctagon, FileWarning, Eye, Building2 } from 'lucide-react';
import { WorkflowSidebar, InfoTip } from '@/components/layout/MilestonesBar';
import { AuditReportResult, AuditSeverity, HcmuteUnit } from '@/types/vtvl';
import { auditUnitWorkbooks } from '@/services/excel-audit/audit-engine';
import { generateUnitFiles } from '@/services/excel-split/workbook-builder';
import { HD07_CONSTANTS } from '@/configs/hcmute-hd07-catalog';
import {
  getActiveUnitDefinition,
  getActiveUnitSession,
  getSessionFilesForUnit,
  recordActivity,
  setSessionRootWorkbook
} from '@/services/telemetry/activity-log';

const SEVERITY_META: Record<
  AuditSeverity,
  { label: string; badgeClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  fix: { label: 'Chỉnh sửa bắt buộc', badgeClass: 'bg-[var(--fix-soft)] text-[var(--fix)] border-[var(--fix)]/30', icon: AlertOctagon },
  evidence: { label: 'Bổ sung căn cứ', badgeClass: 'bg-[var(--warn-soft)] text-[var(--warn)] border-[var(--warn)]/30', icon: FileWarning },
  review: { label: 'Khuyến nghị rà soát', badgeClass: 'bg-sky-50 text-[var(--primary)] border-sky-200 dark:bg-sky-950/50', icon: Eye }
};

export default function RaSoatPage() {
  const [activeUnit, setActiveUnit] = useState<HcmuteUnit>(() => getActiveUnitDefinition());
  const [auditing, setAuditing] = useState(false);
  const [report, setReport] = useState<AuditReportResult | null>(null);
  const [severityFilter, setSeverityFilter] = useState<'all' | AuditSeverity>('all');
  const [sheetFilter, setSheetFilter] = useState<string>('all');
  const [query, setQuery] = useState<string>('');

  const handleAuditActiveUnit = useCallback(async (unitToAudit: HcmuteUnit) => {
    setAuditing(true);
    try {
      const session = getActiveUnitSession();
      const cached = getSessionFilesForUnit(unitToAudit.code);
      let fileToAudit = cached.mergedFile || cached.rootFile;

      if (!fileToAudit) {
        const split = await generateUnitFiles({
          kind: unitToAudit.group,
          unitCode: unitToAudit.code,
          unitNameVi: unitToAudit.nameVi,
          unitNameEn: unitToAudit.nameEn,
          period: HD07_CONSTANTS.STATISTICAL_PERIOD,
          exportDate: session.customDate || '2026-11-07',
          includeZipPerPosition: false,
          ngachOverrides: session.ngachOverrides,
          customPositionNames: session.customPositionNames,
          customCareerLevels: session.customCareerLevels
        });
        fileToAudit = setSessionRootWorkbook(unitToAudit.code, split.unitBlob, split.unitFileName);
      }

      const res = await auditUnitWorkbooks([fileToAudit]);
      setReport(res);
      recordActivity(
        unitToAudit.code,
        unitToAudit.nameVi,
        'RA_SOAT',
        `Thẩm định tự động bộ biểu của đơn vị ${unitToAudit.code} (${res.countsBySeverity.fix} mục chỉnh sửa)`
      );
    } finally {
      setAuditing(false);
    }
  }, []);

  useEffect(() => {
    const u = getActiveUnitDefinition();
    setActiveUnit(u);
    void handleAuditActiveUnit(u);
  }, [handleAuditActiveUnit]);

  const handleFilesSelected = async (fileList: FileList | null) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setAuditing(true);
    try {
      const res = await auditUnitWorkbooks(files);
      setReport(res);
      recordActivity(
        res.unitSummaries[0]?.unitCode || activeUnit.code,
        res.unitSummaries[0]?.unitName || activeUnit.nameVi,
        'RA_SOAT',
        `Thẩm định ${res.filesCount} tệp đơn vị (${res.countsBySeverity.fix} mục yêu cầu chỉnh sửa)`
      );
    } finally {
      setAuditing(false);
    }
  };

  const filteredIssues = useMemo(() => {
    if (!report) return [];
    return report.issues.filter((item) => {
      if (severityFilter !== 'all' && item.severity !== severityFilter) return false;
      if (sheetFilter !== 'all' && item.sheet !== sheetFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const hay = `${item.unitCode} ${item.ruleId} ${item.cellRef} ${item.title} ${item.suggestion}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [report, severityFilter, sheetFilter, query]);

  const handleExportAuditExcel = () => {
    if (!report) return;
    const wb = XLSX.utils.book_new();
    const wsIssues = XLSX.utils.aoa_to_sheet([
      [`BÁO CÁO THẨM ĐỊNH BỘ BIỂU VỊ TRÍ VIỆC LÀM — ĐƠN VỊ: [${activeUnit.code}] ${activeUnit.nameVi.toUpperCase()}`],
      ['Mã đơn vị', 'Tên tệp', 'Mã quy tắc', 'Biểu', 'Tọa độ ô', 'Phân loại mức độ', 'Nội dung phát hiện', 'Giá trị hiện tại', 'Hướng dẫn hoàn thiện'],
      ...report.issues.map((i) => [
        i.unitCode, i.fileName, i.ruleId, i.sheet, i.cellRef,
        SEVERITY_META[i.severity].label, i.title, i.currentValue, i.suggestion
      ])
    ]);
    XLSX.utils.book_append_sheet(wb, wsIssues, 'Ket_Qua_Tham_Dinh_VTVL');
    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao_Cao_Tham_Dinh_VTVL_${activeUnit.code}_20261107.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-3">
          <WorkflowSidebar activeStep={5} unitCode={activeUnit.code} />
        </div>

        <div className="lg:col-span-9 space-y-5">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] p-5 space-y-4 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-white font-extrabold text-xs flex items-center justify-center mr-2">5</span>
                <h1 className="text-base sm:text-lg font-extrabold text-[var(--foreground)]">
                  Bước 5: Thẩm định chéo 6 chỉ tiêu của [{activeUnit.code}] {activeUnit.nameVi}
                </h1>
                <InfoTip title="6 chỉ tiêu kiểm tra chéo tự động">
                  <p>Hệ thống tự động nạp hồ sơ của đơn vị <strong>[{activeUnit.code}] {activeUnit.nameVi}</strong> đã thiết lập từ Bước 1–4 để đối soát 6 chỉ tiêu (A2↔A1, B1↔C1/C2, Cột R B1, B2_CT↔B1, D1↔C1, C3↔D2).</p>
                </InfoTip>
              </div>
              <button type="button" onClick={() => void handleAuditActiveUnit(activeUnit)} disabled={auditing} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30 font-bold text-xs cursor-pointer transition-colors">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Kiểm tra lại hồ sơ [{activeUnit.code}]</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3.5">
              <div className="flex items-center gap-2.5 text-xs">
                <Building2 className="w-4 h-4 text-[var(--primary)] shrink-0" />
                <span>
                  Đang thẩm định tự động hồ sơ của đơn vị đã chọn tại Bước 1: <strong>[{activeUnit.code}] {activeUnit.nameVi}</strong>
                </span>
              </div>
              <label className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[var(--primary)]/40 bg-[var(--sheet)] hover:border-[var(--primary)] text-xs font-bold text-[var(--primary)] cursor-pointer shrink-0">
                <input type="file" multiple accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(e) => handleFilesSelected(e.target.files)} className="hidden" />
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Tải tệp .xlsx khác để kiểm tra</span>
              </label>
            </div>
          </div>

          {report && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] p-4 sm:p-5 space-y-3 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-extrabold text-[var(--foreground)]">Tổng hợp kết quả thẩm định [{activeUnit.code}]</h3>
                  <button type="button" onClick={handleExportAuditExcel} className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl bg-[var(--primary)] text-white font-semibold text-xs cursor-pointer">
                    <Download className="w-3.5 h-3.5" />
                    <span>Xuất báo cáo thẩm định [{activeUnit.code}] (.xlsx)</span>
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-[var(--background)] border-b border-[var(--border)]">
                        <th className="py-2 px-2.5 text-left">Mã ĐV</th>
                        <th className="py-2 px-2.5 text-left">Tên đơn vị</th>
                        <th className="py-2 px-2.5 text-right">VTVL (C1)</th>
                        <th className="py-2 px-2.5 text-right">Đầu việc (B1)</th>
                        <th className="py-2 px-2.5 text-right">Nhân sự (D1)</th>
                        <th className="py-2 px-2.5 text-right">FTE (C3)</th>
                        <th className="py-2 px-2.5 text-right">Bắt buộc sửa</th>
                        <th className="py-2 px-2.5 text-right">Bổ sung căn cứ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.unitSummaries.map((u) => (
                        <tr key={u.fileName} className="border-b border-[var(--border-subtle)]">
                          <td className="py-2 px-2.5 font-mono font-bold text-[var(--primary)]">{u.unitCode}</td>
                          <td className="py-2 px-2.5 font-semibold">{u.unitName}</td>
                          <td className="py-2 px-2.5 text-right tabular-nums">{u.vtvlCount}</td>
                          <td className="py-2 px-2.5 text-right tabular-nums">{u.taskCount}</td>
                          <td className="py-2 px-2.5 text-right tabular-nums">{u.staffCount}</td>
                          <td className="py-2 px-2.5 text-right font-bold tabular-nums">{u.proposedFte}</td>
                          <td className="py-2 px-2.5 text-right font-extrabold text-[var(--fix)] tabular-nums">{u.fixCount}</td>
                          <td className="py-2 px-2.5 text-right font-extrabold text-[var(--warn)] tabular-nums">{u.evidenceCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] p-4 sm:p-5 space-y-3 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button type="button" onClick={() => setSeverityFilter('all')} className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${severityFilter === 'all' ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-[var(--background)] border-[var(--border)]'}`}>
                      Tất cả ({report.totalIssues})
                    </button>
                    {(['fix', 'evidence', 'review'] as AuditSeverity[]).map((sev) => (
                      <button key={sev} type="button" onClick={() => setSeverityFilter(sev)} className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${severityFilter === sev ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : SEVERITY_META[sev].badgeClass}`}>
                        {SEVERITY_META[sev].label} ({report.countsBySeverity[sev]})
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={sheetFilter} onChange={(e) => setSheetFilter(e.target.value)} className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 text-xs font-semibold">
                      <option value="all">Mọi biểu (A1–D2)</option>
                      {Object.keys(report.countsBySheet).map((sh) => (
                        <option key={sh} value={sh}>Biểu {sh} ({report.countsBySheet[sh]})</option>
                      ))}
                    </select>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-subtle)]" />
                      <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm mã, ô…" className="rounded-lg border border-[var(--border)] bg-[var(--background)] pl-7 pr-2.5 py-1 text-xs w-36 sm:w-44" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {filteredIssues.map((issue) => {
                    const meta = SEVERITY_META[issue.severity];
                    const Icon = meta.icon;
                    return (
                      <div key={issue.id} className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${meta.badgeClass}`}>
                              <Icon className="w-3 h-3" />
                              <span>{meta.label}</span>
                            </span>
                            <span className="font-mono text-xs font-bold text-[var(--primary)] bg-[var(--sheet)] px-2 py-0.5 rounded border border-[var(--border)]">
                              {issue.unitCode} · {issue.cellRef}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-[var(--foreground)]">{issue.title}</h4>
                          <p className="text-xs text-[var(--ink-muted)]"><strong>Hướng dẫn:</strong> {issue.suggestion}</p>
                        </div>
                        <code className="font-mono text-[11px] bg-[var(--sheet)] px-2 py-1 rounded border border-[var(--border)] shrink-0 max-w-[200px] truncate">{issue.currentValue}</code>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
