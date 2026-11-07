'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { UploadCloud, Sparkles, Download, Building2, FlaskConical } from 'lucide-react';
import { WorkflowSidebar, InfoTip } from '@/components/layout/MilestonesBar';
import { AuditReportResult, HcmuteUnit } from '@/types/vtvl';
import { auditUnitWorkbooks, exportAuditReportToExcel } from '@/services/excel-audit/audit-engine';
import { generateUnitFiles } from '@/services/excel-split/workbook-builder';
import { HD07_CONSTANTS } from '@/configs/hcmute-hd07-catalog';
import { AuditResultTabs } from '@/components/ra-soat/AuditResultTabs';
import {
  getActiveUnitDefinition,
  getActiveUnitSession,
  getSessionFilesForUnit,
  recordActivity,
  setSessionRootWorkbook
} from '@/services/telemetry/activity-log';

export default function RaSoatPage() {
  const [activeUnit, setActiveUnit] = useState<HcmuteUnit>(() => getActiveUnitDefinition());
  const [auditing, setAuditing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [report, setReport] = useState<AuditReportResult | null>(null);

  const handleAuditActiveUnit = useCallback(async (unitToAudit: HcmuteUnit, asSampleDemo = false) => {
    setAuditing(true);
    try {
      const session = getActiveUnitSession();
      const cached = getSessionFilesForUnit(unitToAudit.code);
      let fileToAudit = !asSampleDemo ? cached.mergedFile || cached.rootFile : null;

      if (!fileToAudit) {
        const split = await generateUnitFiles({
          kind: unitToAudit.group,
          unitCode: asSampleDemo ? 'X99' : unitToAudit.code,
          unitNameVi: asSampleDemo ? 'Đơn vị giả định minh họa (X99)' : unitToAudit.nameVi,
          unitNameEn: unitToAudit.nameEn,
          period: HD07_CONSTANTS.STATISTICAL_PERIOD,
          exportDate: session.customDate || '2026-11-07',
          includeZipPerPosition: false,
          scaleMetrics: session.scaleMetrics,
          ngachAllocations: session.ngachAllocations,
          ngachOverrides: session.ngachOverrides,
          customPositionNames: session.customPositionNames,
          customCareerLevels: session.customCareerLevels,
          proposedPositions: session.proposedPositions
        });
        fileToAudit = new File([split.unitBlob], split.unitFileName, {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        if (!asSampleDemo) {
          setSessionRootWorkbook(unitToAudit.code, split.unitBlob, split.unitFileName);
        }
      }

      const res = await auditUnitWorkbooks([fileToAudit], asSampleDemo);
      if (asSampleDemo) {
        res.issues.unshift(
          {
            id: 'demo-fix-1',
            ruleId: 'R-TT31-40',
            fileName: fileToAudit.name,
            unitCode: 'X99',
            sheet: 'A2',
            cellRef: 'A2_CongViec!H5',
            severity: 'fix',
            title: '[Ví dụ minh họa] Căn cứ pháp lý còn dẫn chiếu Thông tư 40/2020/TT-BGDĐT đã hết hiệu lực theo khoản 2 Điều 17 TT 31/2026/TT-BGDĐT',
            currentValue: 'Thông tư 40/2020/TT-BGDĐT',
            suggestion: 'Thay bằng: Nghị định số 232/2026/NĐ-CP & Thông tư số 31/2026/TT-BGDĐT ngày 14/4/2026.'
          },
          {
            id: 'demo-fix-2',
            ruleId: 'R-D1-VUOTGIO',
            fileName: fileToAudit.name,
            unitCode: 'X99',
            sheet: 'D1',
            cellRef: 'D1_NhanLuc!E4',
            severity: 'fix',
            title: '[Ví dụ minh họa] VƯỢT QUỸ GIỜ: Tổng giờ phân bổ (2.120h) vượt quỹ giờ chuẩn năm (1.760h)',
            currentValue: '2.120h > 1.760h',
            suggestion: 'Điều chỉnh lại phân bổ giờ thực tế không vượt quá quỹ giờ chuẩn.'
          }
        );
        res.countsBySeverity.fix += 2;
        res.totalIssues += 2;
        if (res.unitSummaries[0]) res.unitSummaries[0].fixCount += 2;
      }
      setReport(res);
      recordActivity(
        unitToAudit.code,
        unitToAudit.nameVi,
        'RA_SOAT',
        `Thẩm định tự động bộ biểu của đơn vị ${asSampleDemo ? 'X99 (Ví dụ minh họa)' : unitToAudit.code} (${res.countsBySeverity.fix} mục phải sửa)`
      );
    } finally {
      setAuditing(false);
    }
  }, []);

  useEffect(() => {
    const u = getActiveUnitDefinition();
    setActiveUnit(u);
    void handleAuditActiveUnit(u, false);
  }, [handleAuditActiveUnit]);

  const handleFilesSelected = async (fileList: FileList | File[] | null) => {
    const files = Array.from(fileList || []).filter((f) => f.name.endsWith('.xlsx') || f.name.endsWith('.xlsm'));
    if (files.length === 0) return;
    setAuditing(true);
    try {
      const res = await auditUnitWorkbooks(files, false);
      setReport(res);
      recordActivity(
        res.unitSummaries[0]?.unitCode || activeUnit.code,
        res.unitSummaries[0]?.unitName || activeUnit.nameVi,
        'RA_SOAT',
        `Thẩm định gộp ${res.filesCount} tệp Excel (${res.countsBySeverity.fix} mục phải sửa)`
      );
    } finally {
      setAuditing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void handleFilesSelected(e.dataTransfer.files);
    }
  };

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-3">
          <WorkflowSidebar activeStep={5} unitCode={activeUnit.code} />
        </div>

        <div className="lg:col-span-9 space-y-5 min-w-0">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] p-4 sm:p-5 space-y-4 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center">
                <span className="w-7 h-7 rounded-full bg-[var(--primary)] text-white font-extrabold text-sm flex items-center justify-center mr-2 shrink-0">5</span>
                <h1 className="text-base sm:text-xl font-extrabold text-[var(--foreground)]">
                  Bước 5: Rà soát 9 biểu &amp; Thẩm định chéo [{activeUnit.code}]
                </h1>
                <InfoTip title="Tự tính lại từ các cột nhập liệu & 5 thẻ kết quả">
                  <p>Công cụ tự đọc các cột nhập liệu từ một hoặc nhiều tệp .xlsx để tự tính lại Giờ B1, đối chiếu Người quy đổi PP2 — Người C3 — Nhân sự D1, và xuất tệp Excel kết quả gồm cả trang <strong>Chua_du_can_cu</strong> và <strong>Gop_y_bieu_mau</strong>.</p>
                </InfoTip>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleAuditActiveUnit(activeUnit, true)}
                  disabled={auditing}
                  className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] text-xs sm:text-sm font-bold text-[var(--foreground)] cursor-pointer"
                >
                  <FlaskConical className="w-4 h-4 text-[var(--primary)]" />
                  <span>Xem ví dụ minh họa (X99)</span>
                </button>
                <button
                  id="task-5-run"
                  type="button"
                  onClick={() => void handleAuditActiveUnit(activeUnit, false)}
                  disabled={auditing}
                  className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-xl bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30 font-bold text-xs sm:text-sm cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Kiểm tra hồ sơ [{activeUnit.code}]</span>
                </button>
              </div>
            </div>

            {/* KHAY KÉO THẢ NHIỀU TỆP CÙNG LÚC */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`rounded-2xl border-2 border-dashed p-4 sm:p-5 transition-colors flex flex-col sm:flex-row items-center justify-between gap-4 ${
                dragOver ? 'border-[var(--primary)] bg-[var(--primary)]/10' : 'border-[var(--primary)]/40 bg-[var(--background)]'
              }`}
            >
              <div className="flex items-start gap-3 text-xs sm:text-sm">
                <UploadCloud className="w-8 h-8 text-[var(--primary)] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="text-sm sm:text-base font-extrabold text-[var(--foreground)] block">
                    Kéo thả một hoặc nhiều tệp .xlsx của đơn vị vào đây để kiểm tra cùng lúc
                  </strong>
                  <p className="text-[var(--ink-muted)]">
                    Chọn được nhiều tệp cùng lúc (ví dụ tệp của nhiều Khoa/Phòng hoặc các phiên bản v1, v2). Tệp được đọc ngay trên máy, không gửi đi đâu.
                  </p>
                </div>
              </div>
              <label className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl bg-[var(--primary)] text-white text-xs sm:text-sm font-extrabold cursor-pointer shrink-0 shadow-2xs">
                <input type="file" multiple accept=".xlsx,.xlsm,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(e) => void handleFilesSelected(e.target.files)} className="hidden" />
                <UploadCloud className="w-4 h-4" />
                <span>Chọn tệp Excel (.xlsx)</span>
              </label>
            </div>
          </div>

          {report && (
            <div className="space-y-4">
              {report.isSampleDemo && (
                <div role="status" className="rounded-2xl border-2 border-[var(--primary)] bg-[var(--primary)]/10 p-3.5 text-xs sm:text-sm text-[var(--foreground)] flex flex-wrap items-center justify-between gap-2">
                  <span>
                    Đang xem <strong>ví dụ minh họa</strong>: tệp của một đơn vị giả định (<strong>X99</strong>) có cài sẵn các lỗi điển hình để tham khảo. Kéo tệp thật của đơn vị vào khay phía trên hoặc bấm <strong>Kiểm tra hồ sơ [{activeUnit.code}]</strong> để kiểm tra thật.
                  </span>
                  <button type="button" onClick={() => void handleAuditActiveUnit(activeUnit, false)} className="min-h-[38px] px-3 rounded-lg bg-[var(--primary)] text-white text-xs font-bold cursor-pointer">
                    Quay về hồ sơ [{activeUnit.code}]
                  </button>
                </div>
              )}

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] p-4 sm:p-5 space-y-3 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[var(--primary)]" />
                    <h2 className="text-sm sm:text-base font-extrabold text-[var(--foreground)]">
                      Tổng quan {report.filesCount} tệp đã kiểm tra ({report.unitSummaries.map((u) => u.unitCode).join(', ')})
                    </h2>
                  </div>
                  <button
                    id="task-5-export"
                    type="button"
                    onClick={() => exportAuditReportToExcel(report, report.unitSummaries[0]?.unitCode || activeUnit.code)}
                    className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl bg-[var(--primary)] text-white font-extrabold text-xs sm:text-sm cursor-pointer shadow-2xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Xuất Excel kết quả (có Chua_du_can_cu &amp; Gop_y_bieu_mau)</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div className="rounded-xl border border-[var(--fix)]/40 bg-[var(--fix-soft)] p-3">
                    <div className="text-xs font-bold text-[var(--fix)]">Phải sửa</div>
                    <div className="text-2xl font-extrabold text-[var(--fix)] tabular-nums">{report.countsBySeverity.fix}</div>
                  </div>
                  <div className="rounded-xl border border-[var(--warn)]/40 bg-[var(--warn-soft)] p-3">
                    <div className="text-xs font-bold text-[var(--warn)]">Chưa đủ căn cứ</div>
                    <div className="text-2xl font-extrabold text-[var(--warn)] tabular-nums">{report.countsBySeverity.evidence}</div>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
                    <div className="text-xs font-bold text-[var(--primary)]">Nên xem lại</div>
                    <div className="text-2xl font-extrabold text-[var(--primary)] tabular-nums">{report.countsBySeverity.review}</div>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
                    <div className="text-xs text-[var(--ink-muted)]">Tổng VTVL (C1)</div>
                    <div className="text-2xl font-extrabold text-[var(--foreground)] tabular-nums">{report.vtvlRecalcRows.length}</div>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
                    <div className="text-xs text-[var(--ink-muted)]">Lỗi biểu mẫu gốc</div>
                    <div className="text-2xl font-extrabold text-[var(--foreground)] tabular-nums">{report.templateFeedbackItems.length}</div>
                  </div>
                </div>
              </div>

              <AuditResultTabs report={report} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
