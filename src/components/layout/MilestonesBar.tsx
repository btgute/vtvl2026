'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check, PanelLeftClose, PanelLeftOpen, FileSpreadsheet, Building2, Layers, Timer, GitMerge, ShieldCheck, RefreshCw, UserCheck, Info, AlertTriangle, X } from 'lucide-react';
import { getActiveUnitDefinition, getActiveUnitSession } from '@/services/telemetry/activity-log';
import { findHcmuteUnit } from '@/configs/hcmute-units';
import { getCurrentOperatorSession } from '@/services/telemetry/operator-session';

export interface InfoTipProps { title?: string; children: React.ReactNode; align?: 'left' | 'right'; }

export function InfoTip({ title, children, align = 'left' }: InfoTipProps) {
  const [pinned, setPinned] = useState(false);
  return (
    <span className="relative inline-flex items-center group align-middle shrink-0" onKeyDown={(e) => { if (e.key === 'Escape') setPinned(false); }}>
      <button type="button" aria-expanded={pinned} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPinned((p) => !p); }} aria-label={title || 'Xem thông tin giải thích'} title="Bấm hoặc nhấn Enter để xem hướng dẫn" className="w-11 h-11 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-xl cursor-pointer">
        <span className={`w-6 h-6 rounded-full text-xs font-bold inline-flex items-center justify-center transition-colors border ${pinned ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-[var(--primary)]/12 text-[var(--primary)] border-[var(--primary)]/35 group-hover:bg-[var(--primary)] group-hover:text-white'}`}>
          <Info className="w-3.5 h-3.5" />
        </span>
      </button>
      <div role="tooltip" className={`${pinned ? 'block' : 'hidden group-hover:block group-focus-within:block'} absolute z-40 top-full mt-1 w-[min(20rem,calc(100vw-2rem))] sm:w-80 rounded-xl border border-[var(--border)] bg-[var(--sheet)] p-4 text-sm font-normal text-[var(--foreground)] shadow-lg leading-relaxed ${align === 'right' ? 'right-0' : 'left-0'}`}>
        {title && <div className="font-bold text-[var(--primary)] mb-1.5 border-b border-[var(--border-subtle)] pb-1.5 text-sm">{title}</div>}
        <div className="text-[var(--ink-muted)] space-y-1.5 text-sm">{children}</div>
      </div>
    </span>
  );
}

import { VTVL_MILESTONES, SIDEBAR_EIGHT_STEPS, SIDEBAR_FIVE_STEPS, SidebarStepItem, StepSubTask } from '@/configs/milestones';
export { SIDEBAR_EIGHT_STEPS, SIDEBAR_FIVE_STEPS };
export type { SidebarStepItem, StepSubTask };

export function focusTaskTarget(taskId: string) {
  if (typeof window === 'undefined') return;
  setTimeout(() => {
    const el = (document.getElementById(taskId) as HTMLElement | null) || (document.querySelector(`[data-task="${taskId}"]`) as HTMLElement | null);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const focusable = el.matches('input, select, textarea, button') ? el : (el.querySelector('input, select, textarea, button') as HTMLElement | null) || el;
    focusable.focus({ preventScroll: true });
    if (focusable instanceof HTMLInputElement && focusable.type === 'text') focusable.select();
    focusable.classList.add('ring-2', 'ring-[var(--primary)]');
    setTimeout(() => focusable.classList.remove('ring-2', 'ring-[var(--primary)]'), 1600);
  }, 80);
}

interface WorkflowSidebarProps {
  activeStep?: number;
  onSelectStep?: (step: number) => void;
  unitCode?: string;
  errorStep?: number | null;
  alwaysExpanded?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

export function WorkflowSidebar({
  activeStep, onSelectStep, unitCode, errorStep,
  alwaysExpanded = false, isCollapsed: isCollapsedProp, onToggleCollapse
}: WorkflowSidebarProps) {
  const pathname = usePathname();
  const [activeUnit, setActiveUnit] = useState(() => findHcmuteUnit(unitCode));
  const [actorInfo, setActorInfo] = useState(() => {
    const s = getActiveUnitSession();
    const op = getCurrentOperatorSession();
    return {
      email: s.actorEmail || op?.email || '', title: s.actorTitle || op?.title || '',
      lastSavedAt: s.lastSavedAt, wizardStage: s.wizardStage || 1, posCount: s.proposedPositions?.length || 0,
      exportedFile: s.lastExportedFileName || '', timerCount: s.timeSessions?.length || 0,
      mergedVer: s.lastMergedVersion ? `v${s.lastMergedVersion}` : '',
      auditFixCount: typeof s.lastAuditFixCount === 'number' ? s.lastAuditFixCount : null
    };
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = !alwaysExpanded && (typeof isCollapsedProp === 'boolean' ? isCollapsedProp : internalCollapsed);
  const setCollapsed = (val: boolean) => {
    setInternalCollapsed(val);
    onToggleCollapse?.(val);
  };
  const triggerBtnRef = useRef<HTMLButtonElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const sync = () => {
      setActiveUnit(findHcmuteUnit(unitCode));
      const s = getActiveUnitSession();
      const op = getCurrentOperatorSession();
      setActorInfo({
        email: s.actorEmail || op?.email || '', title: s.actorTitle || op?.title || '',
        lastSavedAt: s.lastSavedAt, wizardStage: s.wizardStage || 1,
        posCount: s.proposedPositions?.length || 0, exportedFile: s.lastExportedFileName || '',
        timerCount: s.timeSessions?.length || 0, mergedVer: s.lastMergedVersion ? `v${s.lastMergedVersion}` : '',
        auditFixCount: typeof s.lastAuditFixCount === 'number' ? s.lastAuditFixCount : null
      });
    };
    sync();
    window.addEventListener('vtvl-unit-session-updated', sync);
    window.addEventListener('vtvl-operator-changed', sync);
    window.addEventListener('storage', sync);
    let bc: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) { bc = new BroadcastChannel('hcmute_vtvl_realtime'); bc.onmessage = sync; }
    return () => {
      window.removeEventListener('vtvl-unit-session-updated', sync);
      window.removeEventListener('vtvl-operator-changed', sync);
      window.removeEventListener('storage', sync);
      bc?.close();
    };
  }, [unitCode]);

  useEffect(() => { if (drawerOpen) closeBtnRef.current?.focus(); }, [drawerOpen]);
  const closeDrawer = () => { setDrawerOpen(false); setTimeout(() => triggerBtnRef.current?.focus(), 40); };

  const currentStep = activeStep ?? (pathname === '/bam-gio' ? 3 : pathname === '/ra-soat' ? 8 : 1);
  const activeStepObj = SIDEBAR_EIGHT_STEPS.find((s) => s.num === currentStep) || SIDEBAR_EIGHT_STEPS[0];
  const hasStep1Done = Boolean(actorInfo.email && actorInfo.title && actorInfo.posCount > 0);
  const stageDoneFlags = [
    hasStep1Done, Boolean(actorInfo.posCount > 0 && (actorInfo.wizardStage >= 2 || currentStep > 2)),
    Boolean(actorInfo.timerCount > 0 || currentStep > 3), Boolean(actorInfo.timerCount > 0 || actorInfo.mergedVer || currentStep > 4),
    Boolean(hasStep1Done && (actorInfo.wizardStage >= 4 || Boolean(actorInfo.exportedFile))),
    Boolean(actorInfo.exportedFile || currentStep > 6), Boolean(actorInfo.mergedVer || currentStep > 7),
    actorInfo.auditFixCount === 0
  ];
  const completedStagesCount = stageDoneFlags.filter(Boolean).length;
  const progressPercent = Math.min(100, Math.max(Math.round((completedStagesCount / 8) * 100), Math.round((currentStep / 8) * 100)));

  const stepIcon = (num: number) => {
    if (num === 1 || num === 2 || num === 5) return <Layers className="w-3.5 h-3.5 shrink-0" />;
    if (num === 3 || num === 4) return <Timer className="w-3.5 h-3.5 shrink-0" />;
    return num === 6 ? <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" /> : num === 7 ? <GitMerge className="w-3.5 h-3.5 shrink-0" /> : <ShieldCheck className="w-3.5 h-3.5 shrink-0" />;
  };

  const renderStagesList = (compactMode: boolean, inMobileDrawer = false) => (
    <ol className={compactMode ? 'flex flex-col items-center w-full' : 'space-y-0.5'}>
      {SIDEBAR_EIGHT_STEPS.map((s, idx) => {
        const isCurrent = currentStep === s.num;
        const isDone = !isCurrent && stageDoneFlags[s.num - 1];
        const hasError = errorStep === s.num || (s.num === 8 && (actorInfo.auditFixCount ?? 0) > 0);
        const needsSupplement = !isCurrent && !isDone && !hasError && s.num === 1 && (!actorInfo.email || !actorInfo.title);
        const handleInternal = Boolean(onSelectStep && (pathname === '/bang-tinh' || (pathname === '/tao-tep' && (s.num === 1 || s.num === 2 || s.num === 5 || s.num === 6 || s.num === 7)) || (pathname === '/bam-gio' && (s.num === 3 || s.num === 4))));
        const isLast = idx === SIDEBAR_EIGHT_STEPS.length - 1;
        const statusText = hasError ? (s.num === 8 && actorInfo.auditFixCount ? `${actorInfo.auditFixCount} mục phải sửa` : 'Có lỗi') : isCurrent ? `${s.sheets} · Đang thực hiện` : isDone ? `${s.sheets} · Hoàn thành` : needsSupplement ? `${s.sheets} · Cần bổ sung` : s.sheets;

        if (compactMode) {
          const railCircleClass = hasError
            ? 'bg-[var(--fix-soft)] text-[var(--fix)] border border-[var(--fix)]/45'
            : isCurrent
              ? 'bg-[var(--primary)] text-white border-2 border-[var(--primary)] shadow-xs'
              : isDone
                ? 'bg-[var(--ok-soft)] text-[var(--ok)] border border-[var(--ok)]/25'
                : needsSupplement
                  ? 'bg-[var(--warn-soft)] text-[var(--warn)] border border-[var(--warn)]/40'
                  : 'bg-[var(--sheet)] text-[var(--foreground)] border border-[var(--border)] group-hover:border-[var(--primary)]';

          const railNode = (
            <div className="group relative flex items-center justify-center w-full py-0.5">
              {(isCurrent || hasError) && <span aria-hidden="true" className={`absolute left-1.5 w-1 h-5 rounded-full ${hasError ? 'bg-[var(--fix)]' : 'bg-[var(--primary)]'}`} />}
              <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold transition-all ${railCircleClass}`}>
                {hasError ? <AlertTriangle className="w-4 h-4" /> : isDone ? <Check className="w-4 h-4 stroke-[2.4]" /> : <span className={isCurrent ? 'text-white' : ''}>{s.num}</span>}
              </span>
              <div role="tooltip" className="pointer-events-none invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity duration-150 absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 w-max max-w-[280px] rounded-xl border border-[var(--border)] bg-[var(--sheet)] px-3.5 py-2.5 text-left shadow-md">
                <span aria-hidden="true" className="absolute -left-[6px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 bg-[var(--sheet)] border-l border-b border-[var(--border)]" />
                <div className="text-xs sm:text-sm font-bold text-[var(--foreground)] leading-snug">{s.title}</div>
                <div className={`text-xs mt-0.5 ${hasError ? 'text-[var(--fix)] font-semibold' : isCurrent ? 'text-[var(--primary)] font-semibold' : isDone ? 'text-[var(--ok)] font-semibold' : needsSupplement ? 'text-[var(--warn)] font-semibold' : 'text-[var(--ink-subtle)]'}`}>{statusText}</div>
              </div>
            </div>
          );

          return (
            <li key={s.num} className="flex flex-col items-center w-full">
              {handleInternal ? (
                <button type="button" aria-label={`${s.title} (${statusText})`} aria-current={isCurrent ? 'step' : undefined} onClick={() => onSelectStep?.(s.num)} className="w-full cursor-pointer focus:outline-none">{railNode}</button>
              ) : (
                <Link href={s.href} aria-label={`${s.title} (${statusText})`} aria-current={isCurrent ? 'step' : undefined} className="w-full block focus:outline-none">{railNode}</Link>
              )}
              {!isLast && <span aria-hidden="true" className="w-[1.5px] h-3.5 bg-[var(--border)]" />}
            </li>
          );
        }

        const expandedRow = (
          <div className={`group flex items-start gap-2.5 px-3 py-2 min-h-[42px] rounded-r-lg transition-colors border-l-[3px] ${hasError ? 'border-[var(--fix)] bg-[var(--fix-soft)]' : isCurrent ? 'border-[var(--primary)] bg-[var(--surface-tint)]' : 'border-transparent hover:bg-[var(--sheet)]/70'}`}>
            <span className={`mt-0.5 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 ${hasError ? 'bg-[var(--fix)] text-white' : isCurrent ? 'bg-[var(--primary)] text-white' : isDone ? 'bg-[var(--ok-soft)] text-[var(--ok)]' : needsSupplement ? 'bg-[var(--warn-soft)] text-[var(--warn)]' : 'bg-[var(--muted)] text-[var(--ink-subtle)]'}`}>
              {hasError ? <AlertTriangle className="w-3.5 h-3.5" /> : isDone ? <Check className="w-3.5 h-3.5" /> : s.num}
            </span>
            <div className="flex-1 min-w-0">
              <div className={`text-xs sm:text-sm leading-snug ${hasError ? 'font-bold text-[var(--fix)]' : isCurrent ? 'font-bold text-[var(--primary)]' : isDone ? 'font-semibold text-[var(--foreground)]' : 'text-[var(--ink-muted)]'}`}>{s.title}</div>
              <div className={`text-[11px] mt-0.5 flex items-center gap-1 ${hasError ? 'text-[var(--fix)] font-semibold' : isDone ? 'text-[var(--ok)] font-semibold' : isCurrent ? 'text-[var(--primary)] font-semibold' : needsSupplement ? 'text-[var(--warn)] font-semibold' : 'text-[var(--ink-subtle)]'}`}>
                {stepIcon(s.num)}<span>{statusText}</span>
              </div>
            </div>
          </div>
        );

        return (
          <li key={s.num}>
            {handleInternal ? (
              <button type="button" aria-current={isCurrent ? 'step' : undefined} onClick={() => { onSelectStep?.(s.num); if (inMobileDrawer) closeDrawer(); }} className="w-full text-left cursor-pointer">{expandedRow}</button>
            ) : (
              <Link href={s.href} aria-current={isCurrent ? 'step' : undefined} onClick={() => { if (inMobileDrawer) closeDrawer(); }} className="block">{expandedRow}</Link>
            )}
          </li>
        );
      })}
    </ol>
  );

  return (
    <aside aria-label="Quy trình 08 bước HD 07" data-collapsed={isCollapsed ? 'true' : 'false'} className="workflow-sidebar w-full surface-secondary rounded-xl lg:rounded-2xl border border-[var(--border-subtle)] lg:sticky lg:top-20 select-none">
      {/* MOBILE BAR + BOTTOM SHEET DRAWER */}
      <div className="lg:hidden px-3.5 py-2.5 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--primary)]">
            <span>Bước {currentStep}/8 — {activeStepObj.shortTitle}</span>
            <span className="tabular-nums">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[var(--border)] overflow-hidden" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-[var(--primary)] rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        <button ref={triggerBtnRef} type="button" aria-expanded={drawerOpen} aria-haspopup="dialog" onClick={() => setDrawerOpen(true)} className="inline-flex items-center justify-center min-h-[44px] px-3 rounded-xl border border-[var(--primary)]/40 bg-[var(--primary)]/10 text-xs font-bold text-[var(--primary)] shrink-0 cursor-pointer">
          Xem 08 bước HD 07
        </button>
      </div>

      {drawerOpen && (
        <div role="dialog" aria-modal="true" aria-label="Quy trình 08 bước Hướng dẫn số 07-HD/BTCTW" onKeyDown={(e) => { if (e.key === 'Escape') closeDrawer(); }} className="lg:hidden fixed inset-0 z-50 bg-black/45 flex items-end justify-center" onClick={closeDrawer}>
          <div className="w-full max-h-[82vh] overflow-y-auto rounded-t-2xl bg-[var(--sheet)] border-t border-[var(--border)] p-4 space-y-3 shadow-xl pb-[calc(1rem+env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
              <div><div className="text-sm font-bold text-[var(--foreground)]">Quy trình 08 bước · 10 biểu HD 07 ({progressPercent}%)</div><div className="text-xs text-[var(--ink-muted)]">{activeUnit.nameVi}</div></div>
              <button ref={closeBtnRef} type="button" onClick={closeDrawer} aria-label="Đóng tiến trình" className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border border-[var(--border)]"><X className="w-5 h-5" /></button>
            </div>
            {renderStagesList(false, true)}
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR: Mở rộng hoặc Navigation Rail (76px) */}
      <div className="hidden lg:block">
        {isCollapsed ? (
          <div className="flex flex-col items-center py-3.5 w-full">
            <button type="button" onClick={() => setCollapsed(false)} aria-label="Mở rộng thanh tiến trình" title="Mở rộng thanh tiến trình (08 bước)" className="w-9 h-9 min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-xl border border-[var(--primary)]/50 bg-[var(--sheet)] hover:bg-[var(--surface-tint)] text-[var(--primary)] shadow-2xs cursor-pointer transition-colors mb-3">
              <PanelLeftOpen className="w-4 h-4" />
            </button>
            {renderStagesList(true, false)}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-subtle)]">
              <span className="text-xs font-bold text-[var(--ink-muted)]">Quy trình 08 bước · 10 biểu HD 07 ({progressPercent}%)</span>
              <div className="flex items-center gap-1 ml-auto">
                <InfoTip title="Mốc tiến độ triển khai toàn Trường" align="right">
                  {VTVL_MILESTONES.map((ms) => (
                    <div key={ms.id} className="py-1 border-b border-[var(--border-subtle)] last:border-0">
                      <strong className="text-[var(--foreground)] block">{ms.day} {ms.month}: {ms.title} ({ms.badgeText})</strong><span>{ms.description}</span>
                    </div>
                  ))}
                </InfoTip>
                {!alwaysExpanded && (
                  <button type="button" onClick={() => setCollapsed(true)} aria-label="Thu gọn thanh tiến trình" title="Thu gọn chỉ còn số bước 1–8 để phóng to bảng tính" className="w-9 h-9 min-h-[38px] min-w-[38px] inline-flex items-center justify-center rounded-xl hover:bg-[var(--background)] text-[var(--primary)] cursor-pointer">
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="px-3.5 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--background)]/50 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <Building2 className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
                  <span className="text-sm font-bold text-[var(--foreground)] leading-snug break-words">{activeUnit.nameVi}</span>
                </div>
                {currentStep > 1 && (
                  onSelectStep ? (
                    <button type="button" onClick={() => { onSelectStep(1); focusTaskTarget('task-1-unit'); }} className="inline-flex items-center gap-1 min-h-[36px] px-2 text-xs font-bold text-[var(--primary)] hover:underline shrink-0 cursor-pointer"><RefreshCw className="w-3.5 h-3.5" /><span>Đổi đơn vị</span></button>
                  ) : (
                    <Link href="/tao-tep?step=1&task=task-1-unit" className="inline-flex items-center gap-1 min-h-[36px] px-2 text-xs font-bold text-[var(--primary)] hover:underline shrink-0"><RefreshCw className="w-3.5 h-3.5" /><span>Đổi đơn vị</span></Link>
                  )
                )}
              </div>
              <div className="flex items-start gap-2 text-xs text-[var(--ink-muted)] leading-snug break-words">
                <UserCheck className="w-3.5 h-3.5 text-[var(--primary)] shrink-0 mt-0.5" />
                {actorInfo.email && actorInfo.title ? <span><strong>{actorInfo.title}</strong> · {actorInfo.email}</span> : <span className="text-[var(--warn)] font-semibold">Chưa khai báo người thực hiện</span>}
              </div>
            </div>

            <div className="p-2.5">{renderStagesList(false, false)}</div>
          </>
        )}
      </div>
    </aside>
  );
}

export function MilestonesBar() { return null; }
