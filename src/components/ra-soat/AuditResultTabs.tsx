'use client';

import React, { useState, useMemo } from 'react';
import { Search, AlertOctagon, AlertCircle, Eye, ExternalLink } from 'lucide-react';
import { AuditReportResult, AuditSeverity } from '@/types/vtvl';
import { AUDIT_RULES_CATALOG } from '@/services/excel-audit/audit-engine';

export type AuditTabKey = 'issues' | 'vtvl' | 'evidence' | 'template' | 'rules';

export const SEVERITY_META: Record<
  AuditSeverity,
  { label: string; badgeClass: string; chipClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  fix: {
    label: 'Phải sửa',
    badgeClass: 'bg-[var(--fix-soft)] text-[var(--fix)] border-[var(--fix)]/25',
    chipClass: 'bg-[var(--fix-soft)] text-[var(--fix)] border-[var(--fix)]/20',
    icon: AlertOctagon
  },
  evidence: {
    label: 'Cần bổ sung căn cứ',
    badgeClass: 'bg-[var(--warn-soft)] text-[var(--warn)] border-[var(--warn)]/25',
    chipClass: 'bg-[var(--warn-soft)] text-[var(--warn)] border-[var(--warn)]/20',
    icon: AlertCircle
  },
  review: {
    label: 'Nên xem lại',
    badgeClass: 'bg-[var(--surface-tint)] text-[var(--primary)] border-[var(--primary)]/20',
    chipClass: 'bg-[var(--surface-tint)] text-[var(--primary)] border-[var(--primary)]/20',
    icon: Eye
  }
};

interface Props {
  report: AuditReportResult;
}

export function AuditResultTabs({ report }: Props) {
  const [activeTab, setActiveTab] = useState<AuditTabKey>('issues');
  const [severityFilter, setSeverityFilter] = useState<'all' | AuditSeverity>('all');
  const [sheetFilter, setSheetFilter] = useState<string>('all');
  const [fileFilter, setFileFilter] = useState<string>('all');
  const [query, setQuery] = useState<string>('');
  const [vtvlOnlyWithData, setVtvlOnlyWithData] = useState<boolean>(true);
  const [vtvlQuery, setVtvlQuery] = useState<string>('');

  const filteredIssues = useMemo(() => {
    return report.issues.filter((item) => {
      if (severityFilter !== 'all' && item.severity !== severityFilter) return false;
      if (sheetFilter !== 'all' && item.sheet !== sheetFilter) return false;
      if (fileFilter !== 'all' && item.fileName !== fileFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const hay = `${item.unitCode} ${item.ruleId} ${item.cellRef} ${item.title} ${item.suggestion}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [report.issues, severityFilter, sheetFilter, fileFilter, query]);

  const filteredVtvlRows = useMemo(() => {
    return report.vtvlRecalcRows.filter((r) => {
      if (vtvlOnlyWithData && !r.hasData) return false;
      if (vtvlQuery.trim()) {
        const q = vtvlQuery.toLowerCase();
        if (!`${r.vtvlCode} ${r.vtvlName} ${r.careerLevel}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [report.vtvlRecalcRows, vtvlOnlyWithData, vtvlQuery]);

  const tabs: { key: AuditTabKey; label: string; count?: number }[] = [
    { key: 'issues', label: '1. Cần xử lý', count: report.totalIssues },
    { key: 'vtvl', label: '2. Tổng hợp VTVL', count: report.vtvlRecalcRows.length },
    { key: 'evidence', label: '3. Chưa đủ căn cứ', count: report.evidenceItems.length },
    { key: 'template', label: '4. Lỗi của biểu mẫu', count: report.templateFeedbackItems.length },
    { key: 'rules', label: '5. Công cụ kiểm tra gì', count: AUDIT_RULES_CATALOG.length }
  ];

  return (
    <div className="space-y-4">
      {/* THANH 5 THẺ (TABS) CHUYÊN SÂU */}
      <nav role="tablist" aria-label="Sổ kết quả rà soát 5 thẻ" className="flex gap-1.5 border-b border-[var(--border-subtle)] overflow-x-auto">
        {tabs.map((t) => {
          const isSelected = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setActiveTab(t.key)}
              className={`inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                isSelected ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--surface-tint)]/70' : 'border-transparent text-[var(--foreground)] hover:bg-[var(--surface-secondary)]'
              }`}
            >
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-xs tabular-nums ${isSelected ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-secondary)] text-[var(--ink-muted)]'}`}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* TAB 1: CẦN XỬ LÝ */}
      {activeTab === 'issues' && (
        <div role="tabpanel" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setSeverityFilter('all')} className={`inline-flex items-center gap-1.5 min-h-[36px] px-3.5 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${severityFilter === 'all' ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-[var(--surface-secondary)] text-[var(--foreground)] border-[var(--border-subtle)]'}`}>
                <span>Tất cả</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[11px] tabular-nums ${severityFilter === 'all' ? 'bg-white/20 text-white' : 'bg-[var(--sheet)]'}`}>{report.totalIssues}</span>
              </button>
              {(['fix', 'evidence', 'review'] as AuditSeverity[]).map((sev) => (
                <button key={sev} type="button" onClick={() => setSeverityFilter(sev)} className={`inline-flex items-center gap-1.5 min-h-[36px] px-3.5 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${severityFilter === sev ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : SEVERITY_META[sev].chipClass}`}>
                  <span>{SEVERITY_META[sev].label}</span>
                  <span className="tabular-nums">{report.countsBySeverity[sev]}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {report.unitSummaries.length > 1 && (
                <select aria-label="Lọc theo tệp" value={fileFilter} onChange={(e) => setFileFilter(e.target.value)} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-2.5 py-1.5 text-xs font-semibold">
                  <option value="all">Mọi tệp ({report.unitSummaries.length})</option>
                  {report.unitSummaries.map((u) => <option key={u.fileName} value={u.fileName}>[{u.unitCode}] {u.fileName}</option>)}
                </select>
              )}
              <select aria-label="Lọc theo biểu" value={sheetFilter} onChange={(e) => setSheetFilter(e.target.value)} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-2.5 py-1.5 text-xs font-semibold">
                <option value="all">Mọi biểu (A1–D2)</option>
                {Object.keys(report.countsBySheet).map((sh) => <option key={sh} value={sh}>Biểu {sh} ({report.countsBySheet[sh]})</option>)}
              </select>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-subtle)]" />
                <input id="task-5-filter" type="search" aria-label="Tìm mã hoặc nội dung" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm mã hoặc nội dung…" className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] pl-7 pr-2.5 py-1.5 text-xs w-44 sm:w-52" />
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredIssues.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm font-bold text-[var(--ok)]">Không có cảnh báo nào khớp với bộ lọc hiện tại.</div>
            ) : (
              filteredIssues.map((issue) => {
                const meta = SEVERITY_META[issue.severity];
                const Icon = meta.icon;
                return (
                  <div key={issue.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--sheet)] hover:border-[var(--primary)]/35 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 min-w-0 flex-1">
                      <span className={`inline-flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border shrink-0 sm:min-w-[156px] ${meta.badgeClass}`}>
                        <Icon className="w-3.5 h-3.5 shrink-0" /><span>{meta.label}</span>
                      </span>
                      <div className="min-w-0 space-y-0.5">
                        <div className="font-mono text-xs sm:text-sm font-bold text-[var(--foreground)]">
                          {issue.unitCode} · Biểu {issue.sheet} · {issue.cellRef}
                        </div>
                        <p className="text-xs sm:text-sm text-[var(--foreground)]">{issue.title}</p>
                        <p className="text-xs text-[var(--ink-muted)]">Hướng dẫn: {issue.suggestion}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                      <code title={issue.currentValue} className="font-mono text-xs bg-[var(--surface-secondary)] px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] max-w-[190px] truncate">{issue.currentValue}</code>
                      <button
                        type="button"
                        onClick={() => setActiveTab(issue.severity === 'evidence' ? 'evidence' : 'rules')}
                        className="inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-xl border border-[var(--border)] bg-[var(--sheet)] hover:border-[var(--primary)] text-xs font-bold text-[var(--foreground)] cursor-pointer transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[var(--primary)]" />
                        <span>{issue.severity === 'evidence' ? 'Bổ sung căn cứ' : 'Xem quy tắc'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TỔNG HỢP VTVL (TỰ TÍNH LẠI TỪ CÁC CỘT NHẬP) */}
      {activeTab === 'vtvl' && (
        <div role="tabpanel" className="space-y-3">
          <div className="rounded-xl border border-[var(--primary)]/20 bg-[var(--surface-tint)] p-3 text-xs sm:text-sm text-[var(--foreground)]">
            Ba con số khác nhau cần đối chiếu: <strong>Người quy đổi PP2</strong> (giờ ròng ÷ quỹ giờ chuẩn) là căn cứ tính toán tự động từ B1 &amp; B2; <strong>Người cần bố trí</strong> là kết luận đề xuất ở Biểu C3; <strong>Nhân sự hiện có (D1)</strong> là số người thực tế chốt ngày 30/9/2026. Giờ B1 do công cụ tự tính lại từ các cột nhập liệu.
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[var(--foreground)] cursor-pointer">
              <input type="checkbox" checked={vtvlOnlyWithData} onChange={(e) => setVtvlOnlyWithData(e.target.checked)} className="w-4 h-4 accent-[var(--primary)]" />
              <span>Chỉ hiển thị VTVL đã có số liệu ({filteredVtvlRows.length})</span>
            </label>
            <input type="search" aria-label="Tìm mã hoặc tên VTVL" value={vtvlQuery} onChange={(e) => setVtvlQuery(e.target.value)} placeholder="Tìm mã hoặc tên VTVL…" className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-1.5 text-xs sm:text-sm w-56" />
          </div>
          <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
            <table className="w-full text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-[var(--surface-secondary)] border-b border-[var(--border-subtle)]">
                  <th className="py-2.5 px-3 text-left">Mã VTVL</th>
                  <th className="py-2.5 px-3 text-left">Tên VTVL cụ thể</th>
                  <th className="py-2.5 px-2 text-left">Bậc</th>
                  <th className="py-2.5 px-2 text-left">PP</th>
                  <th className="py-2.5 px-2 text-right">Giờ B1 (tự tính)</th>
                  <th className="py-2.5 px-2 text-right">Giờ ròng</th>
                  <th className="py-2.5 px-2.5 text-right">Quy đổi PP2</th>
                  <th className="py-2.5 px-2.5 text-right">Cần bố trí (C3)</th>
                  <th className="py-2.5 px-2.5 text-right">Hiện có (D1)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] bg-[var(--sheet)]">
                {filteredVtvlRows.map((r) => (
                  <tr key={`${r.unitCode}-${r.vtvlCode}`}>
                    <td className="py-2.5 px-3 font-mono font-bold text-[var(--primary)]">{r.vtvlCode}</td>
                    <td className="py-2.5 px-3 font-bold text-[var(--foreground)]">{r.vtvlName}</td>
                    <td className="py-2.5 px-2 text-[var(--fix)] font-semibold">{r.careerLevel}</td>
                    <td className="py-2.5 px-2 font-mono">{r.method}</td>
                    <td className="py-2.5 px-2 text-right tabular-nums">{r.recalcB1Hours}h</td>
                    <td className="py-2.5 px-2 text-right font-semibold tabular-nums">{r.recalcNetHours}h</td>
                    <td className="py-2.5 px-2.5 text-right font-extrabold text-[var(--primary)] tabular-nums">{r.recalcPp2Fte}</td>
                    <td className="py-2.5 px-2.5 text-right font-extrabold text-[var(--fix)] tabular-nums">{r.c3ProposedFte}</td>
                    <td className="py-2.5 px-2.5 text-right font-bold tabular-nums">{r.d1CurrentStaff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CHƯA ĐỦ CĂN CỨ */}
      {activeTab === 'evidence' && (
        <div role="tabpanel" className="space-y-3">
          <div className="rounded-xl border border-[var(--warn)]/35 bg-[var(--warn-soft)] p-3 text-xs sm:text-sm text-[var(--foreground)]">
            Quy định thẩm định yêu cầu nộp kèm <strong>danh sách nội dung chưa đủ căn cứ</strong>, ghi rõ nguyên nhân, thời hạn bổ sung và đầu mối phụ trách. Khi bấm <strong>Tải báo cáo kiểm tra</strong>, tệp xuất ra có sẵn trang <code>Chua_du_can_cu</code> với các cột trống để đơn vị điền.
          </div>
          <div className="space-y-2">
            {report.evidenceItems.map((ev, idx) => (
              <div key={idx} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--sheet)] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
                <div className="space-y-0.5">
                  <div className="font-bold text-[var(--foreground)]"><span className="font-mono text-[var(--primary)]">[{ev.unitCode}] {ev.cellRef}</span> · {ev.refCode} — {ev.taskOrPositionName}</div>
                  <p className="text-xs text-[var(--ink-muted)]">Gợi ý nguyên nhân: {ev.reasonHint}</p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-[var(--warn-soft)] text-[var(--warn)] font-bold text-xs shrink-0">{ev.currentSourceText}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LỖI CỦA BIỂU MẪU */}
      {activeTab === 'template' && (
        <div role="tabpanel" className="space-y-3">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-3 text-xs sm:text-sm text-[var(--foreground)]">
            Đây là những điểm cần lưu ý nằm trong chính cấu trúc biểu mẫu gốc, <strong>không tính là lỗi của đơn vị</strong>. Tệp xuất Excel có sẵn trang <code>Gop_y_bieu_mau</code> để đơn vị chép vào phần kiến nghị gửi Phòng Tổ chức – Nhân sự.
          </div>
          <div className="space-y-2">
            {report.templateFeedbackItems.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--sheet)] p-3.5 space-y-1 text-xs sm:text-sm">
                <div className="font-extrabold text-[var(--primary)]">[{item.unitCode}] {item.sheet} · {item.cellOrColumn}</div>
                <p className="font-semibold text-[var(--foreground)]">{item.templateIssue}</p>
                <p className="text-xs text-[var(--ink-muted)]"><strong>Kiến nghị gợi ý:</strong> {item.unitFeedbackSuggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CÔNG CỤ KIỂM TRA GÌ */}
      {activeTab === 'rules' && (
        <div role="tabpanel" className="space-y-3">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-3 text-xs sm:text-sm text-[var(--foreground)]">
            Công cụ đọc trực tiếp các cột nhập liệu và <strong>tự tính lại</strong>, không phụ thuộc vào kết quả công thức lưu sẵn trong tệp. Mức <strong>Phải sửa</strong>: sai cấu trúc, mã, danh mục hoặc thiếu số liệu. <strong>Cần bổ sung căn cứ</strong>: chưa truy được nguồn thực tế, kể cả khi Excel báo ĐẠT. <strong>Nên xem lại</strong>: nghi vấn nghiệp vụ, hợp lệ nếu có giải trình.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {AUDIT_RULES_CATALOG.map((r) => (
              <div key={r.code} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--sheet)] p-3.5 space-y-1 text-xs sm:text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-extrabold text-[var(--primary)]">{r.code} ({r.sheet})</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--surface-secondary)] border border-[var(--border-subtle)]">{r.level}</span>
                </div>
                <p className="text-[var(--foreground)]">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
