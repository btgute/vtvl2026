'use client';

import React, { useState, useRef } from 'react';
import { Copy, Trash2, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, Edit3 } from 'lucide-react';
import { ProposedVtvlRow, WorkforceMethod } from '@/types/vtvl';
import { InfoTip } from '@/components/layout/MilestonesBar';
import { InlineStatus, SaveLifecycleState, ValidationMessage } from '@/components/ui/FormFeedbackPrimitives';
import { TextInput, NumberInput, Select, SearchableSelect } from '@/components/ui/FormInputs';

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
  forceShowErrors?: boolean;
  onUpdateRow: (id: string, patch: Partial<ProposedVtvlRow>) => void;
  onDuplicateRow: (row: ProposedVtvlRow) => void;
  onRequestRemoveRow: (row: ProposedVtvlRow) => void;
}

export function isPositionRowValid(pos: ProposedVtvlRow): { valid: boolean; reason?: string } {
  if (!pos.specificName.trim()) return { valid: false, reason: 'Vui lòng nhập tên vị trí việc làm cụ thể tại đơn vị (theo Biểu C1).' };
  if (!pos.vtvlSuffix.trim()) return { valid: false, reason: 'Vui lòng bổ sung mã hậu tố vị trí việc làm (ví dụ: GV-01, CV-01).' };
  if (pos.proposedFte <= 0 || Number.isNaN(pos.proposedFte)) return { valid: false, reason: 'Biên chế đề xuất (FTE tại Biểu C3) phải lớn hơn 0 (tối thiểu 0.5 FTE).' };
  return { valid: true };
}

export function Step1PositionList({ unitCode, positions, forceShowErrors = false, onUpdateRow, onDuplicateRow, onRequestRemoveRow }: Step1PositionListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(positions[0]?.id || null);
  const [rowStatus, setRowStatus] = useState<Record<string, SaveLifecycleState>>({});
  const [touchedRows, setTouchedRows] = useState<Record<string, boolean>>({});
  const [lastPatchByRow, setLastPatchByRow] = useState<Record<string, Partial<ProposedVtvlRow>>>({});
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const triggerRowChange = (id: string, patch: Partial<ProposedVtvlRow>) => {
    setLastPatchByRow((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }));
    setRowStatus((prev) => ({ ...prev, [id]: 'dirty' }));
    if (timersRef.current[id]) clearTimeout(timersRef.current[id]);
    try {
      onUpdateRow(id, patch);
      timersRef.current[id] = setTimeout(() => {
        setRowStatus((prev) => ({ ...prev, [id]: 'saved' }));
        timersRef.current[`${id}-fade`] = setTimeout(() => setRowStatus((prev) => ({ ...prev, [id]: 'idle' })), 1600);
      }, 220);
    } catch {
      setRowStatus((prev) => ({ ...prev, [id]: 'error' }));
    }
  };

  const handleBlurRow = (id: string) => setTouchedRows((prev) => ({ ...prev, [id]: true }));
  const handleRetryRow = (id: string) => { const patch = lastPatchByRow[id]; if (patch) triggerRowChange(id, patch); };

  return (
    <div id="task-1-name" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center">
          <h3 className="text-base font-extrabold text-[var(--foreground)]">Danh sách vị trí việc làm của đơn vị ({positions.length} vị trí)</h3>
          <InfoTip title="Giải thích các ký hiệu chuyên môn">
            <p><strong>Biểu C1 (Danh mục VTVL):</strong> Khai báo tên cụ thể, mã vị trí và bậc nghề nghiệp tại đơn vị.</p>
            <p><strong>Biểu D1 (Nhân sự hiện có):</strong> Số viên chức, người lao động thực tế đang làm việc tại vị trí này.</p>
            <p><strong>Biểu C3 (Nhu cầu nhân sự):</strong> Số biên chế định mức (FTE) đơn vị đề xuất bố trí.</p>
          </InfoTip>
        </div>
        <span className="text-xs sm:text-sm font-semibold text-[var(--ink-muted)]">Mỗi thay đổi tự động kiểm tra và hiển thị trạng thái lưu trực tiếp trên dòng</span>
      </div>

      <datalist id="step1-ngach-datalist">
        {SUGGESTED_NGACH_OPTIONS.map((opt) => <option key={opt.code} value={opt.code}>{opt.label}</option>)}
      </datalist>

      {/* GIAO DIỆN MOBILE (< md) */}
      <div className="md:hidden space-y-3">
        {positions.map((pos, idx) => {
          const isExpanded = expandedId === pos.id;
          const check = isPositionRowValid(pos);
          const showErr = (touchedRows[pos.id] || forceShowErrors) && !check.valid;
          const st = rowStatus[pos.id] || 'idle';
          const fullCode = `${unitCode}-${pos.vtvlSuffix}`;
          return (
            <div key={pos.id} id={`vtvl-card-${pos.id}`} onBlur={() => handleBlurRow(pos.id)} className={`rounded-xl border bg-[var(--sheet)] p-4 space-y-3 shadow-2xs transition-colors duration-150 ${st === 'saved' ? 'vtvl-row-saved' : showErr ? 'border-[var(--fix)]' : isExpanded ? 'border-2 border-[var(--primary)] bg-[var(--primary)]/[0.03]' : 'border-[var(--border)]'}`}>
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)]">{fullCode}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[var(--muted)] text-[var(--foreground)]">{pos.careerLevel}</span>
                  </div>
                  {st !== 'idle' ? <InlineStatus state={st} savedLabel="Đã cập nhật" onRetry={() => handleRetryRow(pos.id)} /> : check.valid ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--ok)] bg-[var(--ok-soft)] px-2 py-0.5 rounded-md"><CheckCircle2 className="w-3.5 h-3.5" /><span>Hợp lệ</span></span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--fix)] bg-[var(--fix-soft)] px-2 py-0.5 rounded-md"><AlertTriangle className="w-3.5 h-3.5" /><span>Cần bổ sung</span></span>
                  )}
                </div>
                <h4 className="text-base font-extrabold text-[var(--foreground)] leading-snug">{idx + 1}. {pos.specificName || '(Chưa đặt tên vị trí)'}</h4>
                <p className="text-xs text-[var(--ink-muted)]">Khung Trường: <strong>{pos.frameworkTitle}</strong> · Mã ngạch: <span className="font-mono font-bold text-[var(--primary)]">{pos.ngachCode}</span></p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-[var(--border-subtle)] text-sm">
                <div className="rounded-xl bg-[var(--background)] px-3 py-2"><span className="text-xs text-[var(--ink-muted)] block">Nhân sự hiện có (D1)</span><strong className="text-base font-extrabold text-[var(--foreground)] tabular-nums">{pos.staffCount} người</strong></div>
                <div className="rounded-xl bg-[var(--primary)]/[0.06] px-3 py-2"><span className="text-xs text-[var(--ink-muted)] block">Nhân sự đề xuất (C3)</span><strong className="text-base font-extrabold text-[var(--primary)] tabular-nums">{pos.proposedFte} FTE</strong></div>
              </div>
              {showErr && <ValidationMessage id={`mob-err-${pos.id}`} message={check.reason} />}
              <div className="flex items-center gap-2 pt-1">
                <button type="button" aria-expanded={isExpanded} aria-pressed={isExpanded} onClick={() => setExpandedId(isExpanded ? null : pos.id)} className={`flex-1 inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-xl border text-sm font-bold cursor-pointer transition-colors ${isExpanded ? 'border-2 border-[var(--primary)] bg-[var(--primary)]/12 text-[var(--primary)]' : 'border-[var(--primary)]/40 bg-[var(--primary)]/10 text-[var(--primary)]'}`}>
                  <Edit3 className="w-4 h-4" /><span>{isExpanded ? 'Đang mở chỉnh sửa' : 'Chỉnh sửa'}</span>{isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button type="button" onClick={() => onDuplicateRow(pos)} aria-label={`Sao chép vị trí ${pos.specificName}`} className="inline-flex items-center justify-center gap-1 min-h-[44px] min-w-[44px] px-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm font-bold text-[var(--foreground)] cursor-pointer"><Copy className="w-4 h-4 text-[var(--primary)]" /><span>Sao chép</span></button>
                <button type="button" disabled={positions.length <= 1} onClick={() => onRequestRemoveRow(pos)} aria-label={`Xóa vị trí ${pos.specificName}`} className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--fix)] disabled:opacity-40 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
              </div>
              {isExpanded && (
                <div className="pt-3 border-t border-[var(--border)] space-y-3">
                  <div>
                    <label htmlFor={`mob-name-${pos.id}`} className="block text-sm font-bold text-[var(--foreground)] mb-1">Tên vị trí việc làm cụ thể tại đơn vị <span className="text-[var(--fix)]">*</span></label>
                    <TextInput id={`mob-name-${pos.id}`} value={pos.specificName} state={showErr && !pos.specificName.trim() ? 'error' : 'default'} onChange={(e) => triggerRowChange(pos.id, { specificName: e.target.value })} className="font-bold" />
                  </div>
                  <div>
                    <label htmlFor={`mob-ngach-${pos.id}`} className="block text-xs font-extrabold text-[var(--foreground)] mb-1">Mã ngạch chức danh <span className="text-[var(--warn)] font-bold">(mã có sẵn là gợi ý — chọn hoặc tự gõ)</span></label>
                    <SearchableSelect id={`mob-ngach-${pos.id}`} value={pos.ngachCode} options={SUGGESTED_NGACH_OPTIONS} datalistId="step1-ngach-datalist" ariaLabelSelect={`Chọn nhanh mã ngạch cho ${pos.specificName}`} ariaLabelInput={`Mã ngạch thực tế của ${pos.specificName}`} onChange={(val) => triggerRowChange(pos.id, { ngachCode: val })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label htmlFor={`mob-code-${pos.id}`} className="block text-sm font-bold text-[var(--foreground)] mb-1">Mã hậu tố ({unitCode}-...) <span className="text-[var(--fix)]">*</span></label><TextInput id={`mob-code-${pos.id}`} value={pos.vtvlSuffix} state={showErr && !pos.vtvlSuffix.trim() ? 'error' : 'default'} onChange={(e) => triggerRowChange(pos.id, { vtvlSuffix: e.target.value.toUpperCase() })} className="font-mono font-bold text-[var(--primary)]" /></div>
                    <div><label htmlFor={`mob-lvl-${pos.id}`} className="block text-sm font-bold text-[var(--foreground)] mb-1">Bậc nghề nghiệp</label><Select id={`mob-lvl-${pos.id}`} value={pos.careerLevel} disabled={pos.allowedLevels.length <= 1} onChange={(e) => triggerRowChange(pos.id, { careerLevel: e.target.value })}>{pos.allowedLevels.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}</Select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label htmlFor={`mob-staff-${pos.id}`} className="block text-sm font-bold text-[var(--foreground)] mb-1">Nhân sự hiện có (người)</label><NumberInput id={`mob-staff-${pos.id}`} min={0} max={200} value={pos.staffCount} onChange={(e) => triggerRowChange(pos.id, { staffCount: Math.max(0, parseInt(e.target.value || '0', 10)) })} className="font-bold" /></div>
                    <div><label htmlFor={`mob-fte-${pos.id}`} className="block text-sm font-bold text-[var(--foreground)] mb-1">Nhân sự đề xuất (FTE) <span className="text-[var(--fix)]">*</span></label><NumberInput id={`mob-fte-${pos.id}`} min={0.5} max={200} step="0.5" value={pos.proposedFte} state={showErr && pos.proposedFte <= 0 ? 'error' : 'default'} onChange={(e) => triggerRowChange(pos.id, { proposedFte: Math.max(0, parseFloat(e.target.value || '0')) })} className="font-extrabold text-[var(--primary)]" /></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* GIAO DIỆN DESKTOP (>= md) */}
      <div className="hidden md:block space-y-3">
        {positions.map((pos, idx) => {
          const check = isPositionRowValid(pos);
          const showErr = (touchedRows[pos.id] || forceShowErrors) && !check.valid;
          const st = rowStatus[pos.id] || 'idle';
          return (
            <div key={pos.id} id={`vtvl-row-${pos.id}`} onBlur={() => handleBlurRow(pos.id)} className={`rounded-xl border p-4 space-y-3 transition-colors duration-150 shadow-2xs ${st === 'saved' ? 'vtvl-row-saved' : showErr ? 'border-[var(--fix)] bg-[var(--fix-soft)]/25' : 'border-[var(--border)] bg-[var(--sheet)] hover:border-[var(--primary)]/50'}`}>
              <div className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-6">
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--ink-muted)] mb-1">
                    <label htmlFor={`desk-name-${pos.id}`}>{idx + 1}. Tên vị trí việc làm cụ thể tại đơn vị (Biểu C1) <span className="text-[var(--fix)]">*</span></label>
                    <span className="text-[var(--primary)]">Khung Trường: {pos.frameworkTitle}</span>
                  </div>
                  <TextInput id={`desk-name-${pos.id}`} aria-label={`Tên vị trí việc làm cụ thể cho mã ${pos.vtvlSuffix}`} state={showErr && !pos.specificName.trim() ? 'error' : 'default'} value={pos.specificName} onChange={(e) => triggerRowChange(pos.id, { specificName: e.target.value })} className="font-bold py-2" />
                </div>
                <div className="col-span-3">
                  <label htmlFor={`desk-code-${pos.id}`} className="block text-xs font-bold text-[var(--ink-muted)] mb-1">Mã vị trí đơn vị ({unitCode}-...) <span className="text-[var(--fix)]">*</span></label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-[var(--ink-muted)] shrink-0">{unitCode}-</span>
                    <div className="flex-1"><TextInput id={`desk-code-${pos.id}`} aria-label={`Mã hậu tố vị trí ${pos.specificName}`} state={showErr && !pos.vtvlSuffix.trim() ? 'error' : 'default'} value={pos.vtvlSuffix} onChange={(e) => triggerRowChange(pos.id, { vtvlSuffix: e.target.value.toUpperCase() })} className="font-mono font-bold text-[var(--primary)] py-2" /></div>
                  </div>
                </div>
                <div className="col-span-3 flex items-center justify-end gap-2">
                  <div className="min-w-[92px] flex justify-end">
                    {st !== 'idle' ? <InlineStatus state={st} savedLabel="Đã cập nhật" onRetry={() => handleRetryRow(pos.id)} /> : check.valid ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--ok)]"><CheckCircle2 className="w-3.5 h-3.5" /><span>Hợp lệ</span></span> : null}
                  </div>
                  <button type="button" title="Tạo thêm 1 dòng vị trí tương tự" aria-label={`Sao chép vị trí ${pos.specificName}`} onClick={() => onDuplicateRow(pos)} className="inline-flex items-center gap-1.5 min-h-[42px] px-3 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] text-xs font-bold text-[var(--primary)] cursor-pointer"><Copy className="w-3.5 h-3.5" /><span>Sao chép</span></button>
                  <button type="button" title="Xóa vị trí này" aria-label={`Xóa vị trí ${pos.specificName}`} disabled={positions.length <= 1} onClick={() => onRequestRemoveRow(pos)} className="inline-flex items-center gap-1 min-h-[42px] px-3 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--fix)] text-xs font-bold text-[var(--fix)] disabled:opacity-35 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /><span>Xóa</span></button>
                </div>
              </div>
              {showErr && <ValidationMessage id={`desk-err-${pos.id}`} message={check.reason} />}
              <div className="grid grid-cols-12 gap-3 pt-2.5 border-t border-[var(--border-subtle)] items-end">
                <div className="col-span-4">
                  <label htmlFor={`desk-ngach-${pos.id}`} className="block text-xs font-bold text-[var(--ink-muted)] mb-1">Mã ngạch <span className="text-[var(--warn)]">(mã có sẵn là gợi ý — chọn hoặc tự gõ)</span></label>
                  <SearchableSelect id={`desk-ngach-${pos.id}`} value={pos.ngachCode} options={SUGGESTED_NGACH_OPTIONS} datalistId="step1-ngach-datalist" ariaLabelSelect={`Chọn mã ngạch cho vị trí ${pos.specificName}`} ariaLabelInput={`Mã ngạch thực tế của vị trí ${pos.specificName}`} onChange={(val) => triggerRowChange(pos.id, { ngachCode: val })} />
                </div>
                <div className="col-span-3">
                  <label htmlFor={`desk-lvl-${pos.id}`} className="block text-xs font-bold text-[var(--ink-muted)] mb-1">Bậc nghề nghiệp (Phụ lục I)</label>
                  <Select id={`desk-lvl-${pos.id}`} data-task="task-1-level" aria-label={`Bậc nghề nghiệp của ${pos.specificName}`} value={pos.careerLevel} disabled={pos.allowedLevels.length <= 1} onChange={(e) => triggerRowChange(pos.id, { careerLevel: e.target.value })} className="text-xs font-bold text-[var(--primary)]">{pos.allowedLevels.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}</Select>
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-bold text-[var(--ink-muted)] mb-1">Phương pháp (C3) &amp; Quỹ giờ năm</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <Select id={`desk-method-${pos.id}`} data-task="task-1-params" aria-label={`Phương pháp định biên của ${pos.specificName}`} value={pos.method} onChange={(e) => triggerRowChange(pos.id, { method: e.target.value as WorkforceMethod })} className="text-xs font-bold">{METHODS.map((m) => <option key={m.value} value={m.value}>{m.value}</option>)}</Select>
                    <Select id={`desk-hours-${pos.id}`} aria-label={`Quỹ giờ chuẩn năm của ${pos.specificName}`} value={pos.standardHoursYear} onChange={(e) => { const h = Number(e.target.value); triggerRowChange(pos.id, { standardHoursYear: h, workingRegime: h === 1760 ? 'Đặc thù' : 'Phổ biến (40 giờ/tuần)' }); }} className="text-xs font-semibold"><option value={1904}>1.904 giờ/năm</option><option value={1760}>1.760 giờ/năm (GV)</option></Select>
                  </div>
                </div>
                <div className="col-span-1">
                  <label htmlFor={`desk-staff-${pos.id}`} className="block text-xs font-bold text-[var(--ink-muted)] mb-1 text-right">Hiện có (D1)</label>
                  <NumberInput id={`desk-staff-${pos.id}`} data-task="task-1-staff" aria-label={`Nhân sự hiện có của ${pos.specificName}`} min={0} max={200} value={pos.staffCount} onChange={(e) => triggerRowChange(pos.id, { staffCount: Math.max(0, parseInt(e.target.value || '0', 10)) })} className="text-right font-bold" />
                </div>
                <div className="col-span-1">
                  <label htmlFor={`desk-fte-${pos.id}`} className="block text-xs font-bold text-[var(--primary)] mb-1 text-right">Đề xuất (C3)</label>
                  <NumberInput id={`desk-fte-${pos.id}`} aria-label={`Biên chế FTE đề xuất của ${pos.specificName}`} min={0.5} max={200} step="0.5" state={showErr && pos.proposedFte <= 0 ? 'error' : 'default'} value={pos.proposedFte} onChange={(e) => triggerRowChange(pos.id, { proposedFte: Math.max(0, parseFloat(e.target.value || '0')) })} className="text-right font-extrabold text-[var(--primary)]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
