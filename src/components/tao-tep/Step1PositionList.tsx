'use client';

import React, { useState } from 'react';
import { Copy, Trash2, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, Edit3 } from 'lucide-react';
import { ProposedVtvlRow, WorkforceMethod } from '@/types/vtvl';
import { InfoTip } from '@/components/layout/MilestonesBar';

const METHODS: { value: WorkforceMethod; label: string }[] = [
  { value: 'PP1', label: 'PP1 (Định biên theo chức danh)' },
  { value: 'PP2', label: 'PP2 (Tính theo khối lượng giờ)' },
  { value: 'PP3', label: 'PP3 (Định mức kiêm nhiệm)' },
  { value: 'PP1+PP2', label: 'PP1+PP2 (Kết hợp chức danh & giờ)' },
  { value: 'PP2+PP3', label: 'PP2+PP3 (Kết hợp giờ & kiêm nhiệm)' }
];

export const SUGGESTED_NGACH_OPTIONS: { code: string; label: string }[] = [
  { code: 'V.07.01.01', label: 'V.07.01.01 — Giảng viên cao cấp (Hạng I)' },
  { code: 'V.07.01.02', label: 'V.07.01.02 — Giảng viên chính (Hạng II)' },
  { code: 'V.07.01.03', label: 'V.07.01.03 — Giảng viên (Hạng III)' },
  { code: 'V.07.01.23', label: 'V.07.01.23 — Trợ giảng (Hạng III)' },
  { code: '01.002 / V.07.01.02', label: '01.002 / V.07.01.02 — Quản lý giữ ngạch CV chính / GV chính' },
  { code: '01.003 / V.07.01.03', label: '01.003 / V.07.01.03 — Quản lý giữ ngạch Chuyên viên / Giảng viên' },
  { code: '01.001', label: '01.001 — Chuyên viên cao cấp' },
  { code: '01.002', label: '01.002 — Chuyên viên chính' },
  { code: '01.003', label: '01.003 — Chuyên viên' },
  { code: '01.004', label: '01.004 — Cán sự' },
  { code: '01.005', label: '01.005 — Nhân viên (Hành chính / Văn thư / Thủ quỹ)' },
  { code: '06.030', label: '06.030 — Kế toán viên chính' },
  { code: '06.031', label: '06.031 — Kế toán viên' },
  { code: 'V.05.01.02', label: 'V.05.01.02 — Nghiên cứu viên chính (Hạng II)' },
  { code: 'V.05.01.03', label: 'V.05.01.03 — Nghiên cứu viên (Hạng III)' },
  { code: 'V.05.02.06', label: 'V.05.02.06 — Kỹ sư chính (Hạng II)' },
  { code: 'V.05.02.07', label: 'V.05.02.07 — Kỹ sư / Kỹ thuật viên (Hạng III)' },
  { code: 'V.10.02.06', label: 'V.10.02.06 — Thư viện viên (Hạng III)' },
  { code: 'V.08.01.03', label: 'V.08.01.03 — Bác sĩ (Hạng III)' },
  { code: 'HĐLĐ-NĐ111', label: 'HĐLĐ-NĐ111 — Hợp đồng lao động phục vụ (NĐ 111/2022)' }
];

interface Step1PositionListProps {
  unitCode: string;
  positions: ProposedVtvlRow[];
  onUpdateRow: (id: string, patch: Partial<ProposedVtvlRow>) => void;
  onDuplicateRow: (row: ProposedVtvlRow) => void;
  onRequestRemoveRow: (row: ProposedVtvlRow) => void;
}

export function isPositionRowValid(pos: ProposedVtvlRow): { valid: boolean; reason?: string } {
  if (!pos.specificName.trim()) return { valid: false, reason: 'Chưa nhập tên vị trí việc làm cụ thể' };
  if (!pos.vtvlSuffix.trim()) return { valid: false, reason: 'Chưa nhập mã hậu tố vị trí việc làm' };
  if (pos.proposedFte <= 0) return { valid: false, reason: 'Nhân sự đề xuất phải lớn hơn 0' };
  return { valid: true };
}

export function Step1PositionList({ unitCode, positions, onUpdateRow, onDuplicateRow, onRequestRemoveRow }: Step1PositionListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(positions[0]?.id || null);

  return (
    <div id="task-1-name" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center">
          <h3 className="text-base font-extrabold text-[var(--foreground)]">Danh sách vị trí việc làm của đơn vị ({positions.length} vị trí)</h3>
          <InfoTip title="Giải thích các ký hiệu chuyên môn">
            <p><strong>Biểu C1 (Danh mục VTVL):</strong> Khai báo tên cụ thể, mã vị trí và bậc nghề nghiệp tại đơn vị.</p>
            <p><strong>Biểu D1 (Nhân sự hiện có):</strong> Số viên chức, người lao động thực tế đang làm việc tại vị trí này.</p>
            <p><strong>Biểu C3 (Nhu cầu nhân sự):</strong> Số biên chế định mức (FTE) đơn vị đề xuất bố trí.</p>
            <p><strong>Phương pháp PP1 / PP2 / PP3:</strong> PP1 tính theo chức danh quản lý; PP2 quy đổi từ tổng giờ công việc chia quỹ giờ chuẩn năm (1.904h hoặc 1.760h); PP3 tính theo định mức kiêm nhiệm.</p>
          </InfoTip>
        </div>
        <span className="text-xs sm:text-sm font-semibold text-[var(--ink-muted)]">Bấm vào từng vị trí để chỉnh sửa chi tiết hoặc sao chép vị trí tương tự</span>
      </div>

      <datalist id="step1-ngach-datalist">
        {SUGGESTED_NGACH_OPTIONS.map((opt) => (
          <option key={opt.code} value={opt.code}>{opt.label}</option>
        ))}
      </datalist>

      {/* GIAO DIỆN MOBILE (< md): Hiển thị từng Thẻ VTVL, không dùng bảng nhiều cột */}
      <div className="md:hidden space-y-3">
        {positions.map((pos, idx) => {
          const isExpanded = expandedId === pos.id;
          const check = isPositionRowValid(pos);
          const fullCode = `${unitCode}-${pos.vtvlSuffix}`;

          return (
            <div key={pos.id} id={`vtvl-card-${pos.id}`} className={`rounded-2xl border bg-[var(--sheet)] p-4 space-y-3 shadow-2xs transition-all ${!check.valid ? 'border-[var(--fix)]' : isExpanded ? 'border-[var(--primary)] ring-1 ring-[var(--primary)]/30' : 'border-[var(--border)]'}`}>
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)]">{fullCode}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[var(--muted)] text-[var(--foreground)]">{pos.careerLevel}</span>
                  {check.valid ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--ok)] bg-[var(--ok-soft)] px-2 py-0.5 rounded-md"><CheckCircle2 className="w-3.5 h-3.5" /><span>Hợp lệ</span></span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--fix)] bg-[var(--fix-soft)] px-2 py-0.5 rounded-md"><AlertTriangle className="w-3.5 h-3.5" /><span>Cần kiểm tra</span></span>
                  )}
                </div>
                <h4 className="text-base font-extrabold text-[var(--foreground)] leading-snug">{idx + 1}. {pos.specificName || '(Chưa đặt tên vị trí)'}</h4>
                <p className="text-xs text-[var(--ink-muted)]">Khung Trường: <strong>{pos.frameworkTitle}</strong> · Mã ngạch (gợi ý): <span className="font-mono font-bold text-[var(--primary)]">{pos.ngachCode}</span></p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-[var(--border-subtle)] text-sm">
                <div className="rounded-xl bg-[var(--background)] px-3 py-2">
                  <span className="text-xs text-[var(--ink-muted)] block">Nhân sự hiện có (D1)</span>
                  <strong className="text-base font-extrabold text-[var(--foreground)] tabular-nums">{pos.staffCount} người</strong>
                </div>
                <div className="rounded-xl bg-[var(--primary)]/[0.06] px-3 py-2">
                  <span className="text-xs text-[var(--ink-muted)] block">Nhân sự đề xuất (C3)</span>
                  <strong className="text-base font-extrabold text-[var(--primary)] tabular-nums">{pos.proposedFte} FTE</strong>
                </div>
              </div>

              {!check.valid && <p role="alert" className="text-xs font-bold text-[var(--fix)] flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 shrink-0" /><span>{check.reason}</span></p>}

              <div className="flex items-center gap-2 pt-1">
                <button type="button" aria-expanded={isExpanded} onClick={() => setExpandedId(isExpanded ? null : pos.id)} className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-xl border border-[var(--primary)]/40 bg-[var(--primary)]/10 text-sm font-bold text-[var(--primary)] cursor-pointer">
                  <Edit3 className="w-4 h-4" /><span>{isExpanded ? 'Thu gọn' : 'Chỉnh sửa'}</span>{isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button type="button" onClick={() => onDuplicateRow(pos)} aria-label={`Sao chép vị trí ${pos.specificName}`} title="Sao chép vị trí tương tự" className="inline-flex items-center justify-center gap-1 min-h-[44px] min-w-[44px] px-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm font-bold text-[var(--foreground)] cursor-pointer">
                  <Copy className="w-4 h-4 text-[var(--primary)]" /><span>Sao chép</span>
                </button>
                <button type="button" disabled={positions.length <= 1} onClick={() => onRequestRemoveRow(pos)} aria-label={`Xóa vị trí ${pos.specificName}`} title="Xóa vị trí này" className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--fix)] disabled:opacity-40 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {isExpanded && (
                <div className="pt-3 border-t border-[var(--border)] space-y-3">
                  <div>
                    <label htmlFor={`mob-name-${pos.id}`} className="block text-sm font-bold text-[var(--foreground)] mb-1">Tên vị trí việc làm cụ thể tại đơn vị <span className="text-[var(--fix)]">*</span></label>
                    <input id={`mob-name-${pos.id}`} type="text" value={pos.specificName} aria-invalid={!pos.specificName.trim()} onChange={(e) => onUpdateRow(pos.id, { specificName: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-base font-bold text-[var(--foreground)]" />
                  </div>
                  <div className="rounded-xl border border-[var(--review)]/40 bg-[var(--review-soft)]/50 p-2.5 space-y-2">
                    <label htmlFor={`mob-ngach-${pos.id}`} className="block text-xs font-extrabold text-[var(--foreground)]">
                      Mã ngạch chức danh <span className="text-[var(--review)] font-bold">(mã có sẵn chỉ là gợi ý — chọn hoặc tự gõ để đổi)</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        aria-label={`Chọn nhanh mã ngạch cho ${pos.specificName}`}
                        value={SUGGESTED_NGACH_OPTIONS.some((o) => o.code === pos.ngachCode) ? pos.ngachCode : ''}
                        onChange={(e) => { if (e.target.value) onUpdateRow(pos.id, { ngachCode: e.target.value }); }}
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--sheet)] px-3 py-2 text-sm font-semibold text-[var(--foreground)]"
                      >
                        <option value="">— Chọn từ danh mục mã ngạch —</option>
                        {SUGGESTED_NGACH_OPTIONS.map((opt) => <option key={opt.code} value={opt.code}>{opt.label}</option>)}
                      </select>
                      <input
                        id={`mob-ngach-${pos.id}`}
                        type="text"
                        list="step1-ngach-datalist"
                        value={pos.ngachCode}
                        onChange={(e) => onUpdateRow(pos.id, { ngachCode: e.target.value })}
                        placeholder="Nhập mã ngạch thực tế (VD: V.07.01.02, 01.003...)"
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--sheet)] px-3 py-2 text-sm font-mono font-bold text-[var(--primary)]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={`mob-code-${pos.id}`} className="block text-sm font-bold text-[var(--foreground)] mb-1">Mã hậu tố ({unitCode}-...) <span className="text-[var(--fix)]">*</span></label>
                      <input id={`mob-code-${pos.id}`} type="text" value={pos.vtvlSuffix} onChange={(e) => onUpdateRow(pos.id, { vtvlSuffix: e.target.value.toUpperCase() })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-base font-mono font-bold text-[var(--primary)]" />
                    </div>
                    <div>
                      <label htmlFor={`mob-lvl-${pos.id}`} className="block text-sm font-bold text-[var(--foreground)] mb-1">Bậc nghề nghiệp</label>
                      <select id={`mob-lvl-${pos.id}`} value={pos.careerLevel} disabled={pos.allowedLevels.length <= 1} onChange={(e) => onUpdateRow(pos.id, { careerLevel: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-base font-bold text-[var(--foreground)] disabled:opacity-70">
                        {pos.allowedLevels.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={`mob-method-${pos.id}`} className="block text-sm font-bold text-[var(--foreground)] mb-1">Phương pháp xác định biên chế</label>
                      <select id={`mob-method-${pos.id}`} value={pos.method} onChange={(e) => onUpdateRow(pos.id, { method: e.target.value as WorkforceMethod })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-base font-semibold text-[var(--foreground)]">
                        {METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`mob-hours-${pos.id}`} className="block text-sm font-bold text-[var(--foreground)] mb-1">Quỹ giờ chuẩn năm (Biểu C1)</label>
                      <select id={`mob-hours-${pos.id}`} value={pos.standardHoursYear} onChange={(e) => { const h = Number(e.target.value); onUpdateRow(pos.id, { standardHoursYear: h, workingRegime: h === 1760 ? 'Đặc thù' : 'Phổ biến (40 giờ/tuần)' }); }} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-base font-semibold text-[var(--foreground)]">
                        <option value={1904}>1.904 giờ/năm (Hành chính 40h/tuần)</option>
                        <option value={1760}>1.760 giờ/năm (Đặc thù Giảng viên)</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={`mob-staff-${pos.id}`} className="block text-sm font-bold text-[var(--foreground)] mb-1">Nhân sự hiện có (người)</label>
                      <input id={`mob-staff-${pos.id}`} type="number" min={0} max={200} value={pos.staffCount} onChange={(e) => onUpdateRow(pos.id, { staffCount: Math.max(0, parseInt(e.target.value || '0', 10)) })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-base font-bold tabular-nums" />
                    </div>
                    <div>
                      <label htmlFor={`mob-fte-${pos.id}`} className="block text-sm font-bold text-[var(--foreground)] mb-1">Nhân sự đề xuất (FTE) <span className="text-[var(--fix)]">*</span></label>
                      <input id={`mob-fte-${pos.id}`} type="number" min={0.5} max={200} step="0.5" value={pos.proposedFte} onChange={(e) => onUpdateRow(pos.id, { proposedFte: Math.max(0, parseFloat(e.target.value || '0')) })} className="w-full rounded-xl border border-[var(--primary)] bg-[var(--background)] px-3 py-2.5 text-base font-extrabold text-[var(--primary)] tabular-nums" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* GIAO DIỆN DESKTOP (>= md): Bố cục Thẻ ngang 2 tầng (2-Tier Row Card) — Không cuộn ngang, không che khuất chữ */}
      <div className="hidden md:block space-y-3">
        {positions.map((pos, idx) => {
          const check = isPositionRowValid(pos);
          return (
            <div key={pos.id} id={`vtvl-row-${pos.id}`} className={`rounded-2xl border p-4 space-y-3 transition-all shadow-2xs ${!check.valid ? 'border-[var(--fix)] bg-[var(--fix-soft)]/25' : 'border-[var(--border)] bg-[var(--sheet)] hover:border-[var(--primary)]/50'}`}>
              {/* Tầng 1: STT + Tên VTVL cụ thể (rộng rãi) + Mã vị trí + Khung Trường + Nút Sao chép / Xóa */}
              <div className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-6">
                  <label htmlFor={`desk-name-${pos.id}`} className="flex items-center justify-between text-xs font-bold text-[var(--ink-muted)] mb-1">
                    <span>{idx + 1}. Tên vị trí việc làm cụ thể tại đơn vị (Biểu C1) <span className="text-[var(--fix)]">*</span></span>
                    <span className="text-[var(--primary)]">Khung Trường: {pos.frameworkTitle} ({pos.vtvlGroup4.replace('. Nhóm VTVL ', '. ')})</span>
                  </label>
                  <input id={`desk-name-${pos.id}`} aria-label={`Tên vị trí việc làm cụ thể cho mã ${pos.vtvlSuffix}`} type="text" value={pos.specificName} onChange={(e) => onUpdateRow(pos.id, { specificName: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2 text-sm font-bold text-[var(--foreground)]" />
                </div>

                <div className="col-span-3">
                  <label htmlFor={`desk-code-${pos.id}`} className="block text-xs font-bold text-[var(--ink-muted)] mb-1">Mã vị trí đơn vị ({unitCode}-...) <span className="text-[var(--fix)]">*</span></label>
                  <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--background)] px-3">
                    <span className="text-xs font-mono font-bold text-[var(--ink-muted)] shrink-0">{unitCode}-</span>
                    <input id={`desk-code-${pos.id}`} aria-label={`Mã hậu tố vị trí ${pos.specificName}`} type="text" value={pos.vtvlSuffix} onChange={(e) => onUpdateRow(pos.id, { vtvlSuffix: e.target.value.toUpperCase() })} className="w-full bg-transparent py-2 pl-1 text-sm font-mono font-bold text-[var(--primary)] focus:outline-none" />
                  </div>
                </div>

                <div className="col-span-3 flex items-center justify-end gap-2">
                  <button type="button" title="Tạo thêm 1 dòng vị trí tương tự" aria-label={`Sao chép vị trí ${pos.specificName}`} onClick={() => onDuplicateRow(pos)} className="inline-flex items-center gap-1.5 min-h-[42px] px-3 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] text-xs font-bold text-[var(--primary)] cursor-pointer"><Copy className="w-3.5 h-3.5" /><span>Sao chép</span></button>
                  <button type="button" title="Xóa vị trí này" aria-label={`Xóa vị trí ${pos.specificName}`} disabled={positions.length <= 1} onClick={() => onRequestRemoveRow(pos)} className="inline-flex items-center gap-1 min-h-[42px] px-3 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--fix)] text-xs font-bold text-[var(--fix)] disabled:opacity-35 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /><span>Xóa</span></button>
                </div>
              </div>

              {!check.valid && <div role="alert" className="text-xs font-bold text-[var(--fix)] flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 shrink-0" /><span>{check.reason}</span></div>}

              {/* Tầng 2: Mã ngạch (gợi ý, chọn hoặc sửa) + Bậc nghề nghiệp + Phương pháp + Quỹ giờ + Hiện có (D1) + Đề xuất (C3) */}
              <div className="grid grid-cols-12 gap-3 pt-2.5 border-t border-[var(--border-subtle)] items-end">
                <div className="col-span-4">
                  <label htmlFor={`desk-ngach-${pos.id}`} className="block text-xs font-bold text-[var(--ink-muted)] mb-1">Mã ngạch <span className="text-[var(--review)]">(mã có sẵn là gợi ý — chọn hoặc tự gõ)</span></label>
                  <div className="grid grid-cols-12 gap-1.5">
                    <select aria-label={`Chọn mã ngạch cho vị trí ${pos.specificName}`} value={SUGGESTED_NGACH_OPTIONS.some((o) => o.code === pos.ngachCode) ? pos.ngachCode : ''} onChange={(e) => { if (e.target.value) onUpdateRow(pos.id, { ngachCode: e.target.value }); }} className="col-span-7 rounded-xl border border-[var(--border)] bg-[var(--background)] px-2.5 py-2 text-xs font-semibold text-[var(--foreground)]">
                      <option value="">— Chọn từ danh mục —</option>
                      {SUGGESTED_NGACH_OPTIONS.map((opt) => <option key={opt.code} value={opt.code}>{opt.label}</option>)}
                    </select>
                    <input id={`desk-ngach-${pos.id}`} aria-label={`Mã ngạch thực tế của vị trí ${pos.specificName}`} type="text" list="step1-ngach-datalist" value={pos.ngachCode} onChange={(e) => onUpdateRow(pos.id, { ngachCode: e.target.value })} placeholder="Gõ mã ngạch" className="col-span-5 rounded-xl border border-[var(--review)]/50 bg-[var(--review-soft)]/30 px-2.5 py-2 text-xs font-mono font-bold text-[var(--primary)]" />
                  </div>
                </div>

                <div className="col-span-3">
                  <label htmlFor={`desk-lvl-${pos.id}`} className="block text-xs font-bold text-[var(--ink-muted)] mb-1">Bậc nghề nghiệp (Phụ lục I)</label>
                  <select id={`desk-lvl-${pos.id}`} data-task="task-1-level" aria-label={`Bậc nghề nghiệp của ${pos.specificName}`} value={pos.careerLevel} disabled={pos.allowedLevels.length <= 1} onChange={(e) => onUpdateRow(pos.id, { careerLevel: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-2.5 py-2 text-xs font-bold text-[var(--primary)] disabled:opacity-75">
                    {pos.allowedLevels.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
                  </select>
                </div>

                <div className="col-span-3">
                  <label className="block text-xs font-bold text-[var(--ink-muted)] mb-1">Phương pháp (C3) &amp; Quỹ giờ năm</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <select data-task="task-1-params" aria-label={`Phương pháp định biên của ${pos.specificName}`} value={pos.method} onChange={(e) => onUpdateRow(pos.id, { method: e.target.value as WorkforceMethod })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-2 py-2 text-xs font-bold text-[var(--foreground)]">
                      {METHODS.map((m) => <option key={m.value} value={m.value}>{m.value}</option>)}
                    </select>
                    <select aria-label={`Quỹ giờ chuẩn năm của ${pos.specificName}`} value={pos.standardHoursYear} onChange={(e) => { const h = Number(e.target.value); onUpdateRow(pos.id, { standardHoursYear: h, workingRegime: h === 1760 ? 'Đặc thù' : 'Phổ biến (40 giờ/tuần)' }); }} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-2 py-2 text-xs font-semibold text-[var(--foreground)]">
                      <option value={1904}>1.904 giờ/năm</option><option value={1760}>1.760 giờ/năm (GV)</option>
                    </select>
                  </div>
                </div>

                <div className="col-span-1">
                  <label htmlFor={`desk-staff-${pos.id}`} className="block text-xs font-bold text-[var(--ink-muted)] mb-1 text-right">Hiện có (D1)</label>
                  <input id={`desk-staff-${pos.id}`} data-task="task-1-staff" aria-label={`Nhân sự hiện có của ${pos.specificName}`} type="number" min={0} max={200} value={pos.staffCount} onChange={(e) => onUpdateRow(pos.id, { staffCount: Math.max(0, parseInt(e.target.value || '0', 10)) })} className="w-full text-right rounded-xl border border-[var(--border)] bg-[var(--background)] px-2.5 py-2 text-sm font-bold tabular-nums" />
                </div>

                <div className="col-span-1">
                  <label htmlFor={`desk-fte-${pos.id}`} className="block text-xs font-bold text-[var(--primary)] mb-1 text-right">Đề xuất (C3)</label>
                  <input id={`desk-fte-${pos.id}`} aria-label={`Biên chế FTE đề xuất của ${pos.specificName}`} type="number" min={0.5} max={200} step="0.5" value={pos.proposedFte} onChange={(e) => onUpdateRow(pos.id, { proposedFte: Math.max(0, parseFloat(e.target.value || '0')) })} className="w-full text-right rounded-xl border border-[var(--primary)] bg-[var(--background)] px-2.5 py-2 text-sm font-extrabold text-[var(--primary)] tabular-nums" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
