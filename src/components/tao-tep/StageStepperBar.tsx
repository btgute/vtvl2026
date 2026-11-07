'use client';

import React from 'react';
import { Check, AlertTriangle, Clock, CircleDot, Circle, ArrowLeft, ArrowRight, Save, Loader2 } from 'lucide-react';
import { ProposedVtvlRow } from '@/types/vtvl';
import { isPositionRowValid } from './Step1PositionList';
import { Step1ValidationError } from './Step1ReviewConfirm';
import { SaveLifecycleState, SaveStatus } from '@/components/ui/FormFeedbackPrimitives';

export type WorkflowStatusKind = 'completed' | 'in_progress' | 'needs_supplement' | 'error' | 'not_started';

export interface StageMetaItem {
  num: 1 | 2 | 3 | 4 | 5;
  shortLabel: string;
  fullTitle: string;
  status: WorkflowStatusKind;
}

const STATUS_META: Record<
  WorkflowStatusKind,
  { label: string; badgeClass: string; circleClass: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  completed: {
    label: 'Hoàn thành',
    badgeClass: 'bg-[var(--ok-soft)] text-[var(--ok)] border-[var(--ok)]/30',
    circleClass: 'bg-[var(--ok)] text-white border-[var(--ok)]',
    Icon: Check
  },
  in_progress: {
    label: 'Đang thực hiện',
    badgeClass: 'bg-[var(--primary)]/12 text-[var(--primary)] border-[var(--primary)]/35',
    circleClass: 'bg-[var(--primary)] text-white border-[var(--primary)] ring-4 ring-[var(--primary)]/15',
    Icon: CircleDot
  },
  needs_supplement: {
    label: 'Cần bổ sung',
    badgeClass: 'bg-[var(--warn-soft)] text-[var(--warn)] border-[var(--warn)]/35',
    circleClass: 'bg-[var(--warn-soft)] text-[var(--warn)] border-[var(--warn)]',
    Icon: Clock
  },
  error: {
    label: 'Có lỗi',
    badgeClass: 'bg-[var(--fix-soft)] text-[var(--fix)] border-[var(--fix)]/35',
    circleClass: 'bg-[var(--fix)] text-white border-[var(--fix)]',
    Icon: AlertTriangle
  },
  not_started: {
    label: 'Chưa thực hiện',
    badgeClass: 'bg-[var(--muted)] text-[var(--ink-subtle)] border-[var(--border)]',
    circleClass: 'bg-[var(--sheet)] text-[var(--ink-subtle)] border-[var(--border)]',
    Icon: Circle
  }
};

export function StatusBadge({ status, compact = false }: { status: WorkflowStatusKind; compact?: boolean }) {
  const meta = STATUS_META[status];
  const Icon = meta.Icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-semibold ${compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs'} ${meta.badgeClass}`}>
      <Icon className="w-3 h-3 shrink-0" />
      <span>{meta.label}</span>
    </span>
  );
}

/**
 * Hàm duy nhất xác định trạng thái của 5 Chặng trong Giai đoạn 1.
 * Chỉ duy nhất 1 chặng (currentStage) mang trạng thái "Đang thực hiện".
 * Không báo lỗi đỏ cho các chặng người dùng chưa truy cập trừ khi đã sang Chặng 5 hoặc bấm Kiểm tra toàn hồ sơ.
 */
export function computeStageStatuses(
  currentStage: 1 | 2 | 3 | 4 | 5,
  unitCode: string,
  actorEmail: string,
  actorTitle: string,
  positions: ProposedVtvlRow[],
  validationErrors: Step1ValidationError[],
  visitedStages: number[] = [1]
): StageMetaItem[] {
  const emailTrim = actorEmail.trim();
  const titleTrim = actorTitle.trim();
  const inspectAll = currentStage === 5 || visitedStages.includes(5);

  const evalRawStatus = (num: 1 | 2 | 3 | 4 | 5): WorkflowStatusKind => {
    const isVisited = inspectAll || visitedStages.includes(num);
    if (num === 1) return unitCode.trim() ? 'completed' : 'needs_supplement';
    if (num === 2) {
      if (!emailTrim && !titleTrim) return isVisited ? 'needs_supplement' : 'not_started';
      if (emailTrim && (!emailTrim.includes('@') || !emailTrim.includes('.'))) return isVisited ? 'error' : 'needs_supplement';
      if (!emailTrim || !titleTrim) return 'needs_supplement';
      return 'completed';
    }
    if (num === 3) return positions.length > 0 ? 'completed' : 'needs_supplement';
    if (num === 4) {
      if (positions.length === 0) return 'not_started';
      if (positions.some((p) => !isPositionRowValid(p).valid)) return isVisited ? 'error' : 'needs_supplement';
      const totalStaff = positions.reduce((s, p) => s + Number(p.staffCount || 0), 0);
      return totalStaff === 0 ? 'needs_supplement' : 'completed';
    }
    if (!isVisited) return 'not_started';
    if (validationErrors.length > 0) return 'needs_supplement';
    return 'completed';
  };

  const labels: { num: 1 | 2 | 3 | 4 | 5; shortLabel: string; fullTitle: string }[] = [
    { num: 1, shortLabel: 'Đơn vị', fullTitle: 'Chặng 1/5 — Chọn đơn vị' },
    { num: 2, shortLabel: 'Người thực hiện', fullTitle: 'Chặng 2/5 — Người thực hiện' },
    { num: 3, shortLabel: 'Chọn VTVL', fullTitle: 'Chặng 3/5 — Chọn VTVL' },
    { num: 4, shortLabel: 'Chi tiết', fullTitle: 'Chặng 4/5 — Chi tiết VTVL' },
    { num: 5, shortLabel: 'Xác nhận', fullTitle: 'Chặng 5/5 — Kiểm tra & xác nhận' }
  ];

  return labels.map((item) => {
    const raw = evalRawStatus(item.num);
    const status: WorkflowStatusKind = item.num === currentStage ? (raw === 'error' ? 'error' : 'in_progress') : raw;
    return { ...item, status };
  });
}

export function StageStepperBar({
  stages,
  currentStage,
  onSelectStage
}: {
  stages: StageMetaItem[];
  currentStage: 1 | 2 | 3 | 4 | 5;
  onSelectStage: (stage: 1 | 2 | 3 | 4 | 5) => void;
}) {
  return (
    <nav aria-label="Các chặng trong Giai đoạn 1" className="border-b border-[var(--border-subtle)] pb-3.5">
      <ol className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto py-1">
        {stages.map((st, idx) => {
          const isCurrent = st.num === currentStage;
          const meta = STATUS_META[st.status];
          const isLast = idx === stages.length - 1;
          return (
            <li key={st.num} className="flex items-center flex-1 min-w-0">
              <button
                type="button"
                aria-current={isCurrent ? 'step' : undefined}
                aria-selected={isCurrent}
                onClick={() => onSelectStage(st.num)}
                className={`group flex items-center gap-2 px-2.5 py-2 min-h-[44px] rounded-xl border transition-all duration-150 cursor-pointer text-left w-full ${
                  isCurrent
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] shadow-2xs'
                    : 'border-transparent hover:bg-[var(--background)] hover:border-[var(--border)] text-[var(--foreground)]'
                }`}
              >
                <span className={`w-6 h-6 rounded-full border text-xs font-bold flex items-center justify-center shrink-0 transition-transform ${meta.circleClass}`}>
                  {st.status === 'completed' ? <Check className="w-3.5 h-3.5" /> : st.status === 'error' ? <AlertTriangle className="w-3.5 h-3.5" /> : st.num}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs sm:text-sm font-bold leading-tight truncate">{st.shortLabel}</span>
                  <span className="hidden md:block text-[11px] text-[var(--ink-muted)] truncate">{meta.label}</span>
                </span>
              </button>
              {!isLast && <span aria-hidden="true" className={`hidden sm:block h-[2px] w-4 lg:w-8 shrink-0 mx-0.5 rounded-full ${st.status === 'completed' ? 'bg-[var(--ok)]/50' : 'bg-[var(--border)]'}`} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function StickyActionBar({
  activeStep,
  wizardStage,
  lastSavedAt,
  unitCode,
  vtvlCount,
  errorCount,
  saveLifecycle = 'idle',
  isCheckingContinue = false,
  continueCheckedOk = false,
  onPrevStage,
  onSaveNow,
  onInspectErrors,
  onContinue
}: {
  activeStep: number;
  wizardStage: 1 | 2 | 3 | 4 | 5;
  lastSavedAt: string;
  unitCode: string;
  vtvlCount: number;
  errorCount: number;
  saveLifecycle?: SaveLifecycleState;
  isCheckingContinue?: boolean;
  continueCheckedOk?: boolean;
  onPrevStage: () => void;
  onSaveNow: () => void;
  onInspectErrors: () => void;
  onContinue: () => void;
}) {
  const isFinalExportBlocked = (activeStep !== 1 || wizardStage === 5) && errorCount > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--sheet)]/95 backdrop-blur-xs pb-[env(safe-area-inset-bottom)]">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-10 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center justify-between sm:justify-start gap-3 text-xs text-[var(--ink-muted)]">
          <SaveStatus lifecycle={saveLifecycle} lastSavedAt={lastSavedAt} errorCount={errorCount} onRetrySave={onSaveNow} />
          <span className="hidden md:inline text-[var(--ink-subtle)]">· [{unitCode}] {vtvlCount} vị trí việc làm</span>
          <button
            type="button"
            disabled={saveLifecycle === 'saving'}
            onClick={onSaveNow}
            className={`inline-flex items-center gap-1 min-h-[36px] px-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50 ${
              saveLifecycle === 'dirty'
                ? 'border border-[var(--warn)] bg-[var(--warn-soft)] text-[var(--warn)] font-bold'
                : 'text-[var(--primary)] hover:bg-[var(--primary)]/10'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saveLifecycle === 'saved' ? 'Đã lưu' : 'Lưu ngay'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {activeStep === 1 && wizardStage > 1 && (
            <button type="button" onClick={onPrevStage} className="inline-flex items-center justify-center gap-1 min-h-[44px] px-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs sm:text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted)] cursor-pointer">
              <ArrowLeft className="w-4 h-4" /><span className="hidden sm:inline">Quay lại</span>
            </button>
          )}
          <button
            type="button"
            onClick={onInspectErrors}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 rounded-xl border text-xs sm:text-sm font-bold cursor-pointer transition-colors ${
              errorCount > 0 ? 'border-[var(--fix)]/50 bg-[var(--fix-soft)] text-[var(--fix)]' : 'border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]'
            }`}
          >
            {errorCount > 0 ? <><AlertTriangle className="w-4 h-4 shrink-0" /><span>{errorCount} lỗi cần xử lý</span></> : <><Check className="w-4 h-4 text-[var(--ok)] shrink-0" /><span>Kiểm tra dữ liệu</span></>}
          </button>
          <button
            type="button"
            disabled={isCheckingContinue || saveLifecycle === 'saving' || isFinalExportBlocked}
            title={isFinalExportBlocked ? `Vui lòng bổ sung ${errorCount} mục còn thiếu trước khi xuất 4 tệp` : undefined}
            onClick={onContinue}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 min-h-[44px] px-5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-deep)] text-white text-xs sm:text-sm font-bold cursor-pointer shadow-2xs transition-colors disabled:opacity-55 disabled:cursor-not-allowed"
          >
            {isCheckingContinue ? (
              <><Loader2 className="w-4 h-4 animate-spin shrink-0" /><span>Đang kiểm tra…</span></>
            ) : continueCheckedOk ? (
              <><Check className="w-4 h-4 shrink-0" /><span>Hợp lệ</span></>
            ) : (
              <><span>{activeStep === 1 && wizardStage < 5 ? 'Tiếp tục' : isFinalExportBlocked ? `Còn ${errorCount} mục cần xử lý` : 'Xuất 4 tệp'}</span><ArrowRight className="w-4 h-4 shrink-0" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
