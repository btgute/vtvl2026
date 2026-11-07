'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, ArrowUpRight, FileSpreadsheet } from 'lucide-react';
import { HcmuteUnit, ProposedVtvlRow } from '@/types/vtvl';

export interface Step1ValidationError {
  id: string;
  stage: 1 | 2 | 3 | 4;
  targetId: string;
  label: string;
  message: string;
}

export function validateStep1Data(
  unit: HcmuteUnit,
  actorEmail: string,
  actorTitle: string,
  positions: ProposedVtvlRow[]
): Step1ValidationError[] {
  const errors: Step1ValidationError[] = [];
  if (!unit.code) {
    errors.push({
      id: 'err-unit',
      stage: 1,
      targetId: 'task-1-unit',
      label: 'Chặng 1 — Đơn vị thực hiện',
      message: 'Chưa chọn đơn vị thực hiện.'
    });
  }
  if (!actorEmail.trim() || !actorEmail.includes('@')) {
    errors.push({
      id: 'err-email',
      stage: 2,
      targetId: 'task-1-actor',
      label: 'Chặng 2 — Email người thực hiện',
      message: 'Chưa nhập Email công vụ hợp lệ (VD: ten@hcmute.edu.vn).'
    });
  }
  if (!actorTitle.trim()) {
    errors.push({
      id: 'err-role',
      stage: 2,
      targetId: 'task-1-role',
      label: 'Chặng 2 — Chức vụ người thực hiện',
      message: 'Chưa nhập chức vụ hoặc vai trò người đang thực hiện.'
    });
  }
  positions.forEach((pos, idx) => {
    if (!pos.specificName.trim()) {
      errors.push({
        id: `err-name-${pos.id}`,
        stage: 4,
        targetId: `mob-name-${pos.id}`,
        label: `Chặng 4 — Vị trí số ${idx + 1} (${unit.code}-${pos.vtvlSuffix})`,
        message: 'Chưa nhập tên vị trí việc làm cụ thể tại đơn vị.'
      });
    }
    if (!pos.vtvlSuffix.trim()) {
      errors.push({
        id: `err-code-${pos.id}`,
        stage: 4,
        targetId: `mob-code-${pos.id}`,
        label: `Chặng 4 — Vị trí số ${idx + 1}`,
        message: 'Chưa nhập mã hậu tố vị trí việc làm.'
      });
    }
    if (pos.proposedFte <= 0) {
      errors.push({
        id: `err-fte-${pos.id}`,
        stage: 4,
        targetId: `mob-fte-${pos.id}`,
        label: `Chặng 4 — Vị trí ${pos.specificName || idx + 1}`,
        message: 'Nhân sự đề xuất (FTE) phải lớn hơn 0.'
      });
    }
  });
  return errors;
}

interface Step1ReviewConfirmProps {
  unit: HcmuteUnit;
  actorEmail: string;
  actorTitle: string;
  customDate: string;
  positions: ProposedVtvlRow[];
  loading: boolean;
  onJumpToError: (err: Step1ValidationError) => void;
  onConfirmExport: () => void;
}

export function Step1ReviewConfirm({
  unit,
  actorEmail,
  actorTitle,
  customDate,
  positions,
  loading,
  onJumpToError,
  onConfirmExport
}: Step1ReviewConfirmProps) {
  const errors = validateStep1Data(unit, actorEmail, actorTitle, positions);
  const totalStaffD1 = positions.reduce((s, p) => s + p.staffCount, 0);
  const totalFteC3 = Number(positions.reduce((s, p) => s + p.proposedFte, 0).toFixed(2));
  const diffFte = Number((totalFteC3 - totalStaffD1).toFixed(2));

  return (
    <div id="task-1-staff" className="space-y-4">
      <div>
        <h3 className="text-base font-extrabold text-[var(--foreground)]">
          Kiểm tra tổng hợp trước khi xuất bộ biểu đơn vị
        </h3>
        <p className="text-xs sm:text-sm text-[var(--ink-muted)]">
          Rà soát số liệu tổng hợp của <strong>[{unit.code}] {unit.nameVi}</strong> và các mục còn thiếu trước khi chuyển sang Bước 2.
        </p>
      </div>

      {/* 4 chỉ số tổng hợp: Tổng VTVL, Nhân sự hiện có, Nhân sự đề xuất, Chênh lệch */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-3.5">
          <span className="text-xs font-bold text-[var(--ink-muted)] block">Tổng số VTVL (Biểu C1)</span>
          <strong className="text-2xl font-extrabold text-[var(--foreground)] tabular-nums">{positions.length} vị trí</strong>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-3.5">
          <span className="text-xs font-bold text-[var(--ink-muted)] block">Nhân sự hiện có (Biểu D1)</span>
          <strong className="text-2xl font-extrabold text-[var(--foreground)] tabular-nums">{totalStaffD1} người</strong>
        </div>
        <div className="rounded-2xl border border-[var(--primary)]/35 bg-[var(--primary)]/[0.06] p-3.5">
          <span className="text-xs font-bold text-[var(--ink-muted)] block">Nhân sự đề xuất (Biểu C3)</span>
          <strong className="text-2xl font-extrabold text-[var(--primary)] tabular-nums">{totalFteC3} FTE</strong>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-3.5">
          <span className="text-xs font-bold text-[var(--ink-muted)] block">Chênh lệch (Đề xuất − Hiện có)</span>
          <strong className={`text-2xl font-extrabold tabular-nums ${diffFte > 0 ? 'text-[var(--primary)]' : diffFte < 0 ? 'text-[var(--warn)]' : 'text-[var(--ok)]'}`}>
            {diffFte > 0 ? `+${diffFte}` : diffFte} FTE
          </strong>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm space-y-1.5">
        <div><strong>Đơn vị lập hồ sơ:</strong> [{unit.code}] {unit.nameVi} ({unit.nameEn})</div>
        <div>
          <strong>Người thực hiện:</strong>{' '}
          {actorTitle && actorEmail ? `${actorTitle} — ${actorEmail}` : <span className="text-[var(--fix)] font-bold">Chưa nhập đầy đủ thông tin người thực hiện</span>}
        </div>
        <div><strong>Ngày lập hồ sơ:</strong> {customDate}</div>
      </div>

      {/* Bảng tổng hợp lỗi hoặc trạng thái hợp lệ */}
      {errors.length > 0 ? (
        <div role="alert" className="rounded-2xl border border-[var(--fix)] bg-[var(--fix-soft)] p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[var(--fix)]">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Phát hiện {errors.length} mục còn thiếu cần bổ sung (Bấm vào từng mục để chuyển đến đúng ô nhập):</span>
          </div>
          <ul className="space-y-2">
            {errors.map((err) => (
              <li key={err.id}>
                <button
                  type="button"
                  onClick={() => onJumpToError(err)}
                  className="w-full flex items-center justify-between gap-3 rounded-xl border border-[var(--fix)]/30 bg-[var(--sheet)] px-3.5 py-2.5 text-left text-sm hover:border-[var(--fix)] cursor-pointer"
                >
                  <div>
                    <strong className="text-[var(--fix)] block">{err.label}</strong>
                    <span className="text-[var(--foreground)]">{err.message}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--primary)] shrink-0">
                    <span>Sửa ngay</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div role="status" className="rounded-2xl border border-[var(--ok)]/40 bg-[var(--ok-soft)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-sm font-bold text-[var(--ok)]">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Tất cả thông tin đơn vị, người thực hiện và {positions.length} vị trí việc làm đều hợp lệ, sẵn sàng xuất bộ biểu!</span>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirmExport}
            className="w-full sm:w-auto justify-center inline-flex items-center gap-2 min-h-[48px] px-5 rounded-xl bg-[var(--primary)] text-white text-sm font-extrabold shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>{loading ? 'Đang khởi tạo bộ biểu…' : 'Xác nhận & Xuất bộ biểu (Sang Bước 2)'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

