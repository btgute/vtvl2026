'use client';

import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { UploadCloud, Sparkles, Search, Download, AlertOctagon, FileWarning, Eye } from 'lucide-react';
import { MilestonesBar } from '@/components/layout/MilestonesBar';
import { AuditReportResult, AuditSeverity } from '@/types/vtvl';
import { auditUnitWorkbooks } from '@/services/excel-audit/audit-engine';
import { generateUnitFiles } from '@/services/excel-split/workbook-builder';
import { HD07_CONSTANTS } from '@/configs/hcmute-hd07-catalog';
import { recordActivity } from '@/services/telemetry/activity-log';

const SEVERITY_META: Record<
  AuditSeverity,
  { label: string; badgeClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  fix: { label: 'Yêu cầu chỉnh sửa bắt buộc', badgeClass: 'bg-[var(--fix-soft)] text-[var(--fix)] border-[var(--fix)]/30', icon: AlertOctagon },
  evidence: { label: 'Yêu cầu bổ sung căn cứ xác thực', badgeClass: 'bg-[var(--warn-soft)] text-[var(--warn)] border-[var(--warn)]/30', icon: FileWarning },
  review: { label: 'Khuyến nghị rà soát nghiệp vụ', badgeClass: 'bg-sky-50 text-[var(--primary)] border-sky-200 dark:bg-sky-950/50', icon: Eye }
};

export default function RaSoatPage() {
  const [auditing, setAuditing] = useState(false);
  const [report, setReport] = useState<AuditReportResult | null>(null);
  const [severityFilter, setSeverityFilter] = useState<'all' | AuditSeverity>('all');
  const [sheetFilter, setSheetFilter] = useState<string>('all');
  const [query, setQuery] = useState<string>('');

  const handleFilesSelected = async (fileList: FileList | null) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setAuditing(true);
    try {
      const res = await auditUnitWorkbooks(files);
      setReport(res);
      recordActivity(
        res.unitSummaries[0]?.unitCode || 'MULTI',
        res.unitSummaries[0]?.unitName || 'Nhiều đơn vị',
        'RA_SOAT',
        `Thẩm định ${res.filesCount} tệp đơn vị (${res.countsBySeverity.fix} mục yêu cầu chỉnh sửa)`
      );
    } finally {
      setAuditing(false);
    }
  };

  const handleLoadSampleDemo = async () => {
    setAuditing(true);
    try {
      const fmeSplit = await generateUnitFiles({
        kind: 'khoa-vien', unitCode: 'FME', unitNameVi: 'Khoa Cơ khí Chế tạo máy',
        unitNameEn: 'Faculty of Mechanical Engineering', period: HD07_CONSTANTS.STATISTICAL_PERIOD,
        exportDate: '2026-11-07', includeZipPerPosition: false, ngachOverrides: {}
      });
      const bmcSplit = await generateUnitFiles({
        kind: 'phong-ban', unitCode: 'BMC', unitNameVi: 'Phòng Quản trị thương hiệu và Truyền thông',
        unitNameEn: 'Office of Brand Management and Communications', period: HD07_CONSTANTS.STATISTICAL_PERIOD,
        exportDate: '2026-11-07', includeZipPerPosition: false, ngachOverrides: {}
      });
      const file1 = new File([fmeSplit.unitBlob], fmeSplit.unitFileName, { type: fmeSplit.unitBlob.type });
      const file2 = new File([bmcSplit.unitBlob], bmcSplit.unitFileName, { type: bmcSplit.unitBlob.type });
      const res = await auditUnitWorkbooks([file1, file2]);
      setReport(res);
      recordActivity('FME, BMC', 'Khoa Cơ khí Chế tạo máy & Phòng QTTH&TT', 'RA_SOAT', 'Thực hiện đối soát mẫu đối với 2 đơn vị (FME, BMC)');
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
      ['BÁO CÁO THẨM ĐỊNH VÀ KIỂM TRA CHÉO BỘ BIỂU VỊ TRÍ VIỆC LÀM — TRƯỜNG ĐẠI HỌC CÔNG NGHỆ KỸ THUẬT TP.HCM (HCM-UTE)'],
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
    a.download = `Bao_Cao_Tham_Dinh_VTVL_HCM-UTE_20261107.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--sheet)] p-5 sm:p-7 space-y-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
              PHÂN HỆ THẨM ĐỊNH VÀ KIỂM TRA CHÉO BỘ BIỂU ĐƠN VỊ (BƯỚC 5 — BIỂU 13. K_KIEMTRA)
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] mt-1">
              Thẩm định và kiểm tra chéo bộ biểu vị trí việc làm
            </h1>
            <p className="text-xs sm:text-sm text-[var(--ink-muted)] mt-1 max-w-3xl leading-relaxed">
              Thực hiện đối soát tự động tính toàn vẹn dữ liệu giữa các biểu (<code className="font-mono">A1, A2, B1, B2_CT, B2, C1, C2, C3, D1, D2</code>), kiểm tra bậc nghề nghiệp (Bậc 1–5) theo <strong>Nghị định số 232/2026/NĐ-CP</strong> và mã chức danh nhà giáo theo <strong>Thông tư số 31/2026/TT-BGDĐT</strong>.
            </p>
          </div>
          <button type="button" onClick={handleLoadSampleDemo} disabled={auditing} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30 font-bold text-xs cursor-pointer shrink-0 transition-colors">
            <Sparkles className="w-4 h-4" />
            <span>Nạp hồ sơ mẫu đối chiếu (FME &amp; BMC)</span>
          </button>
        </div>
        <MilestonesBar />
      </div>

      <label className="block rounded-3xl border-2 border-dashed border-[var(--primary)]/40 hover:border-[var(--primary)] bg-[var(--sheet)] p-7 text-center cursor-pointer transition-all shadow-2xs">
        <input type="file" multiple accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(e) => handleFilesSelected(e.target.files)} className="hidden" />
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-2.5">
          <UploadCloud className="w-7 h-7" />
        </div>
        <h2 className="text-sm sm:text-base font-extrabold text-[var(--foreground)]">
          {auditing ? 'Hệ thống đang thực hiện đối soát dữ liệu các biểu…' : 'Tải lên tệp dữ liệu đơn vị (.xlsx) để thực hiện kiểm tra chéo'}
        </h2>
        <p className="text-xs text-[var(--ink-muted)] mt-1">
          Có thể chọn đồng thời một hoặc nhiều tệp đơn vị (.xlsx). Toàn bộ quá trình thẩm định được thực hiện bảo mật cục bộ trên trình duyệt.
        </p>
      </label>

      {report && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--sheet)] p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-extrabold text-[var(--foreground)]">I. Bảng tổng hợp kết quả thẩm định ({report.filesCount} đơn vị)</h3>
              <button type="button" onClick={handleExportAuditExcel} className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-[var(--primary)] text-white font-semibold text-xs cursor-pointer">
                <Download className="w-4 h-4" />
                <span>Kết xuất báo cáo thẩm định (.xlsx)</span>
              </button>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--background)] border-b border-[var(--border)]">
                    <th className="py-2.5 px-3 text-left">Mã ĐV</th>
                    <th className="py-2.5 px-3 text-left">Tên đơn vị</th>
                    <th className="py-2.5 px-3 text-left">Tên tệp dữ liệu</th>
                    <th className="py-2.5 px-3 text-right">Số VTVL (C1)</th>
                    <th className="py-2.5 px-3 text-right">Công việc (B1)</th>
                    <th className="py-2.5 px-3 text-right">Nhân sự (D1)</th>
                    <th className="py-2.5 px-3 text-right">Nhu cầu (C3)</th>
                    <th className="py-2.5 px-3 text-right">Chỉnh sửa bắt buộc</th>
                    <th className="py-2.5 px-3 text-right">Bổ sung căn cứ</th>
                    <th className="py-2.5 px-3 text-right">Khuyến nghị rà soát</th>
                  </tr>
                </thead>
                <tbody>
                  {report.unitSummaries.map((u) => (
                    <tr key={u.fileName} className="border-b border-[var(--border-subtle)]">
                      <td className="py-2.5 px-3 font-mono font-bold text-[var(--primary)]">{u.unitCode}</td>
                      <td className="py-2.5 px-3 font-semibold">{u.unitName}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">{u.fileName}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{u.vtvlCount}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{u.taskCount}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{u.staffCount}</td>
                      <td className="py-2.5 px-3 text-right font-bold tabular-nums">{u.proposedFte}</td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-[var(--fix)] tabular-nums">{u.fixCount}</td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-[var(--warn)] tabular-nums">{u.evidenceCount}</td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-[var(--primary)] tabular-nums">{u.reviewCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--sheet)] p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => setSeverityFilter('all')} className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${severityFilter === 'all' ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-[var(--background)] border-[var(--border)]'}`}>
                  Tất cả hạng mục ({report.totalIssues})
                </button>
                {(['fix', 'evidence', 'review'] as AuditSeverity[]).map((sev) => (
                  <button key={sev} type="button" onClick={() => setSeverityFilter(sev)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${severityFilter === sev ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : SEVERITY_META[sev].badgeClass}`}>
                    {SEVERITY_META[sev].label} ({report.countsBySeverity[sev]})
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <select value={sheetFilter} onChange={(e) => setSheetFilter(e.target.value)} className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-semibold">
                  <option value="all">Toàn bộ các biểu (A1–D2)</option>
                  {Object.keys(report.countsBySheet).map((sh) => (
                    <option key={sh} value={sh}>Biểu {sh} ({report.countsBySheet[sh]})</option>
                  ))}
                </select>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-subtle)]" />
                  <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tra cứu mã công việc, tọa độ ô…" className="rounded-xl border border-[var(--border)] bg-[var(--background)] pl-8 pr-3 py-1.5 text-xs" />
                </div>
              </div>
            </div>
            <div className="space-y-2.5">
              {filteredIssues.map((issue) => {
                const meta = SEVERITY_META[issue.severity];
                const Icon = meta.icon;
                return (
                  <div key={issue.id} className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${meta.badgeClass}`}>
                          <Icon className="w-3 h-3" />
                          <span>{meta.label}</span>
                        </span>
                        <span className="font-mono text-xs font-bold text-[var(--primary)] bg-[var(--sheet)] px-2 py-0.5 rounded border border-[var(--border)]">
                          {issue.unitCode} · {issue.cellRef}
                        </span>
                        <span className="font-mono text-[11px] text-[var(--ink-subtle)]">[{issue.ruleId}]</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)] pt-0.5">{issue.title}</h4>
                      <p className="text-xs text-[var(--ink-muted)]"><strong>Hướng dẫn hoàn thiện:</strong> {issue.suggestion}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-[var(--ink-subtle)] block">Giá trị hiện tại:</span>
                      <code className="font-mono text-xs bg-[var(--sheet)] px-2 py-1 rounded border border-[var(--border)] inline-block mt-0.5 max-w-[220px] truncate">{issue.currentValue}</code>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
