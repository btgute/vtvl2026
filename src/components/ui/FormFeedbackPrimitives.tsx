'use client';

import React from 'react';
import { Check, CheckCircle2, AlertTriangle, Loader2, Lock, RotateCcw, X } from 'lucide-react';

export type FormFieldState = 'default' | 'focused' | 'dirty' | 'saving' | 'saved' | 'error' | 'disabled' | 'readOnly';
export type SaveLifecycleState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

export interface ToastNotice {
  id: string;
  kind: 'success' | 'error' | 'info';
  message: string;
  onRetry?: () => void;
}

export function InlineStatus({ state, savedLabel = 'Đã lưu', onRetry }: { state: FormFieldState | SaveLifecycleState; savedLabel?: string; onRetry?: () => void }) {
  if (state === 'dirty') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--warn)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--warn)] shrink-0" aria-hidden="true" />
        <span>Chưa lưu</span>
      </span>
    );
  }
  if (state === 'saving') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--primary)]">
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" aria-hidden="true" />
        <span>Đang lưu…</span>
      </span>
    );
  }
  if (state === 'saved') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--ok)] transition-opacity duration-200">
        <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{savedLabel}</span>
      </span>
    );
  }
  if (state === 'error') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--fix)]">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>Chưa thể lưu</span>
        {onRetry && (
          <button type="button" onClick={onRetry} className="inline-flex items-center gap-1 underline hover:no-underline ml-1 cursor-pointer min-h-[28px] px-1">
            <RotateCcw className="w-3 h-3" /><span>Thử lại</span>
          </button>
        )}
      </span>
    );
  }
  if (state === 'readOnly') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-normal text-[var(--ink-subtle)]">
        <Lock className="w-3 h-3 shrink-0" aria-hidden="true" /><span>Hệ thống tự tạo</span>
      </span>
    );
  }
  return null;
}

export function ValidationMessage({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 flex items-start gap-1.5 text-xs font-medium text-[var(--fix)] leading-snug">
      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}

export function SaveStatus({ lifecycle, lastSavedAt, errorCount, onRetrySave }: { lifecycle: SaveLifecycleState; lastSavedAt: string; errorCount: number; onRetrySave?: () => void }) {
  if (lifecycle === 'saving') {
    return (
      <span role="status" aria-live="polite" className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--primary)]">
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" aria-hidden="true" /><span>Đang lưu…</span>
      </span>
    );
  }
  if (lifecycle === 'error') {
    return (
      <span role="alert" className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--fix)]">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /><span>Lưu thất bại —</span>
        {onRetrySave && (
          <button type="button" onClick={onRetrySave} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-[var(--fix)] bg-[var(--fix-soft)] text-[var(--fix)] font-medium cursor-pointer min-h-[28px]">
            <RotateCcw className="w-3 h-3" /><span>Thử lại</span>
          </button>
        )}
      </span>
    );
  }
  if (lifecycle === 'dirty') {
    return (
      <span role="status" aria-live="polite" className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--warn)]">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--warn)] shrink-0" aria-hidden="true" /><span>Đang lưu…</span>
      </span>
    );
  }
  if (errorCount > 0) {
    return (
      <span role="status" aria-live="polite" className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--fix)]">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /><span>Còn <strong className="font-semibold">{errorCount}</strong> mục cần xử lý · Đã lưu lúc <strong className="font-semibold">{lastSavedAt}</strong></span>
      </span>
    );
  }
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center gap-1.5 text-xs text-[var(--ink-muted)]">
      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--ok)] shrink-0" aria-hidden="true" /><span>Đã lưu lúc <strong className="font-medium text-[var(--foreground)]">{lastSavedAt}</strong></span>
    </span>
  );
}

export function FormField({
  htmlFor, label, required = false, state = 'default', errorMessage, errorId, hint, savedLabel, onRetrySave, children
}: {
  htmlFor: string; label: string; required?: boolean; state?: FormFieldState; errorMessage?: string; errorId?: string; hint?: string; savedLabel?: string; onRetrySave?: () => void; children: React.ReactNode;
}) {
  const effectiveState: FormFieldState = errorMessage ? 'error' : state;
  const resolvedErrorId = errorId || `${htmlFor}-error`;
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <label htmlFor={htmlFor} className={`text-[13.5px] font-medium transition-colors duration-150 ${effectiveState === 'focused' ? 'text-[var(--primary)] font-semibold' : effectiveState === 'error' ? 'text-[var(--fix)] font-semibold' : 'text-[var(--foreground)]'}`}>
          <span>{label}</span>{required && <span className="text-[var(--fix)] ml-0.5" aria-hidden="true">*</span>}
        </label>
        <InlineStatus state={effectiveState} savedLabel={savedLabel} onRetry={onRetrySave} />
      </div>
      {children}
      {hint && !errorMessage && <p className="text-xs text-[var(--ink-subtle)] leading-normal">{hint}</p>}
      <ValidationMessage id={resolvedErrorId} message={errorMessage} />
    </div>
  );
}

export function SegmentedControl<T extends string>({
  ariaLabel, options, value, onChange, columnsClass = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
}: {
  ariaLabel: string; options: { id: T; label: string; subLabel?: string; disabled?: boolean }[]; value: T; onChange: (next: T) => void; columnsClass?: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className={`grid ${columnsClass} gap-1 rounded-lg bg-[var(--muted)] p-1`}>
      {options.map((opt) => {
        const selected = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            disabled={opt.disabled}
            aria-pressed={selected}
            onClick={() => onChange(opt.id)}
            className={`relative flex items-center justify-center gap-1.5 rounded-md px-3 min-h-[40px] py-1.5 text-center transition-all duration-150 cursor-pointer ${
              selected
                ? 'bg-[var(--sheet)] border border-[var(--primary)]/35 font-semibold text-[var(--primary)] shadow-2xs'
                : 'border border-transparent bg-transparent font-medium text-[var(--foreground)] hover:bg-[var(--sheet)]/65 hover:text-[var(--primary)]'
            } disabled:opacity-45 disabled:cursor-not-allowed`}
          >
            {selected && <span className="w-3.5 h-3.5 rounded-full bg-[var(--primary)] text-white inline-flex items-center justify-center shrink-0" aria-hidden="true"><Check className="w-2.5 h-2.5" /></span>}
            <span className="text-[13px] sm:text-[13.5px] leading-snug">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ToastRegion({ toasts, onDismiss }: { toasts: ToastNotice[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div aria-live="polite" aria-atomic="false" className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} role={t.kind === 'error' ? 'alert' : 'status'} className={`pointer-events-auto flex items-center justify-between gap-2.5 rounded-lg border px-3.5 py-2.5 shadow-sm transition-all duration-150 ${t.kind === 'error' ? 'border-[var(--fix)] bg-[var(--fix-soft)] text-[var(--fix)]' : 'border-[var(--ok)]/40 bg-[var(--sheet)] text-[var(--foreground)]'}`}>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium min-w-0">
            {t.kind === 'error' ? <AlertTriangle className="w-4 h-4 text-[var(--fix)] shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-[var(--ok)] shrink-0" />}
            <span className="break-words">{t.message}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {t.onRetry && <button type="button" onClick={t.onRetry} className="px-2 py-1 rounded-md bg-[var(--fix)] text-white text-xs font-medium cursor-pointer min-h-[28px]">Thử lại</button>}
            <button type="button" aria-label="Đóng thông báo" onClick={() => onDismiss(t.id)} className="p-1.5 rounded-md hover:bg-[var(--muted)] text-[var(--ink-muted)] cursor-pointer min-h-[28px] min-w-[28px] inline-flex items-center justify-center"><X className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      ))}
    </div>
  );
}
