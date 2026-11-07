'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Check, ChevronDown, ChevronUp, FileSpreadsheet, Building2, Layers, Timer, GitMerge, ShieldCheck, RefreshCw, UserCheck, Info, AlertTriangle } from 'lucide-react';
import { VTVL_MILESTONES } from '@/configs/milestones';
import { getActiveUnitDefinition, getActiveUnitSession } from '@/services/telemetry/activity-log';

export interface InfoTipProps {
  title?: string;
  children: React.ReactNode;
  align?: 'left' | 'right';
}

export function InfoTip({ title, children, align = 'left' }: InfoTipProps) {
  const [pinned, setPinned] = useState(false);
  return (
    <span className="relative inline-flex items-center group align-middle shrink-0" onKeyDown={(e) => { if (e.key === 'Escape') setPinned(false); }}>
      <button type="button" aria-expanded={pinned} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPinned((p) => !p); }} aria-label={title || 'Xem thông tin giải thích'} title="Bấm hoặc nhấn Enter để xem hướng dẫn" className="w-11 h-11 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-xl cursor-pointer">
        <span className={`w-6 h-6 rounded-full text-xs font-extrabold inline-flex items-center justify-center transition-colors border ${pinned ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-[var(--primary)]/12 text-[var(--primary)] border-[var(--primary)]/35 group-hover:bg-[var(--primary)] group-hover:text-white'}`}>
          <Info className="w-3.5 h-3.5" />
        </span>
      </button>
      <div role="tooltip" className={`${pinned ? 'block' : 'hidden group-hover:block group-focus-within:block'} absolute z-40 top-full mt-1 w-[min(20rem,calc(100vw-2rem))] sm:w-80 rounded-2xl border border-[var(--border)] bg-[var(--sheet)] p-4 text-sm font-normal text-[var(--foreground)] shadow-xl leading-relaxed ${align === 'right' ? 'right-0' : 'left-0'}`}>
        {title && <div className="font-extrabold text-[var(--primary)] mb-1.5 border-b border-[var(--border-subtle)] pb-1.5 text-sm">{title}</div>}
        <div className="text-[var(--ink-muted)] space-y-1.5 text-sm">{children}</div>
      </div>
    </span>
  );
}

export interface StepSubTask { id: string; label: string; }
export interface SidebarStepItem { num: number; shortTitle: string; title: string; href: string; subTasks: StepSubTask[]; }

export const SIDEBAR_FIVE_STEPS: SidebarStepItem[] = [
  {
    num: 1, shortTitle: 'Đề xuất vị trí việc làm', title: 'Bước 1: Đề xuất vị trí việc làm', href: '/tao-tep?step=1',
    subTasks: [
      { id: 'task-1-unit', label: '1. Chọn đơn vị thực hiện' },
      { id: 'task-1-actor', label: '2. Thông tin người thực hiện' },
      { id: 'task-1-add', label: '3. Chọn VTVL từ Khung Trường' },
      { id: 'task-1-name', label: '4. Khai báo chi tiết từng VTVL' },
      { id: 'task-1-staff', label: '5. Kiểm tra và xác nhận' }
    ]
  },
  {
    num: 2, shortTitle: 'Xuất bộ biểu gốc', title: 'Bước 2: Xuất bộ biểu gốc', href: '/tao-tep?step=2',
    subTasks: [
      { id: 'task-2-zip', label: 'Tùy chọn gói phiếu khảo sát (.zip)' },
      { id: 'task-2-export', label: 'Khởi tạo & tải bộ biểu đơn vị' }
    ]
  },
  {
    num: 3, shortTitle: 'Đo định mức thời gian', title: 'Bước 3: Đo định mức thời gian', href: '/bam-gio',
    subTasks: [
      { id: 'task-3-vtvl', label: 'Chọn vị trí việc làm cần đo' },
      { id: 'task-3-timer', label: 'Bấm giờ đo trực tiếp' },
      { id: 'task-3-manual', label: 'Nhập khung giờ thực tế' },
      { id: 'task-3-export', label: 'Xuất phiếu định mức (.xlsx)' }
    ]
  },
  {
    num: 4, shortTitle: 'Gộp phiếu khảo sát', title: 'Bước 4: Gộp phiếu khảo sát', href: '/tao-tep?step=4',
    subTasks: [
      { id: 'task-4-root', label: 'Tệp đơn vị gốc' },
      { id: 'task-4-forms', label: 'Tải lên các phiếu khảo sát' },
      { id: 'task-4-merge', label: 'Tổng hợp phiếu vào tệp đơn vị' }
    ]
  },
  {
    num: 5, shortTitle: 'Thẩm định hồ sơ', title: 'Bước 5: Thẩm định hồ sơ', href: '/ra-soat',
    subTasks: [
      { id: 'task-5-run', label: 'Kiểm tra chéo hồ sơ đơn vị' },
      { id: 'task-5-filter', label: 'Tra cứu & lọc mục cảnh báo' },
      { id: 'task-5-export', label: 'Xuất báo cáo thẩm định (.xlsx)' }
    ]
  }
];

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

interface WorkflowSidebarProps { activeStep?: number; onSelectStep?: (step: number) => void; unitCode?: string; errorStep?: number | null; }

export function WorkflowSidebar({ activeStep, onSelectStep, unitCode, errorStep }: WorkflowSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeUnit, setActiveUnit] = useState(() => getActiveUnitDefinition(unitCode));
  const [actorInfo, setActorInfo] = useState(() => ({ email: '', title: '', lastSavedAt: '' }));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string>('');

  useEffect(() => {
    const sync = () => {
      setActiveUnit(getActiveUnitDefinition(unitCode));
      const s = getActiveUnitSession();
      setActorInfo({ email: s.actorEmail, title: s.actorTitle, lastSavedAt: s.lastSavedAt });
    };
    sync();
    window.addEventListener('vtvl-unit-session-updated', sync);
    return () => window.removeEventListener('vtvl-unit-session-updated', sync);
  }, [unitCode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const taskParam = new URLSearchParams(window.location.search).get('task');
      if (taskParam) { setActiveTaskId(taskParam); focusTaskTarget(taskParam); }
    }
  }, [pathname]);

  const currentStep = activeStep ?? (pathname === '/bam-gio' ? 3 : pathname === '/ra-soat' ? 5 : 1);
  const activeStepObj = SIDEBAR_FIVE_STEPS.find((s) => s.num === currentStep) || SIDEBAR_FIVE_STEPS[0];

  const stepIcon = (num: number) => {
    if (num === 1) return <Layers className="w-4 h-4 text-[var(--primary)] shrink-0" />;
    if (num === 2) return <FileSpreadsheet className="w-4 h-4 text-[var(--primary)] shrink-0" />;
    if (num === 3) return <Timer className="w-4 h-4 text-[var(--primary)] shrink-0" />;
    if (num === 4) return <GitMerge className="w-4 h-4 text-[var(--primary)] shrink-0" />;
    return <ShieldCheck className="w-4 h-4 text-[var(--primary)] shrink-0" />;
  };

  const handleSubTaskClick = (step: SidebarStepItem, sub: StepSubTask) => {
    setActiveTaskId(sub.id);
    setMobileOpen(false);
    window.dispatchEvent(new CustomEvent('vtvl-focus-task', { detail: { step: step.num, taskId: sub.id } }));
    if (onSelectStep && (step.num === 1 || step.num === 2 || step.num === 4)) {
      onSelectStep(step.num); focusTaskTarget(sub.id);
    } else if ((step.num === 3 && pathname === '/bam-gio') || (step.num === 5 && pathname === '/ra-soat')) {
      focusTaskTarget(sub.id);
    } else {
      const sep = step.href.includes('?') ? '&' : '?';
      router.push(`${step.href}${sep}task=${sub.id}`);
    }
  };

  return (
    <aside aria-label="Tiến trình thực hiện 5 bước" className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] overflow-hidden shadow-2xs lg:sticky lg:top-20 select-none">
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-[var(--border-subtle)] bg-[var(--background)]/80 gap-2">
        <div className="min-w-0 flex-1">
          <div className="lg:hidden text-sm font-extrabold text-[var(--primary)] leading-snug">
            Bước {currentStep}/5 — {activeStepObj.shortTitle}
          </div>
          <button type="button" onClick={() => setDesktopCollapsed((p) => !p)} className="hidden lg:inline-flex items-center gap-2 min-h-[44px] text-sm font-extrabold text-[var(--foreground)] cursor-pointer">
            {desktopCollapsed ? <ChevronDown className="w-4 h-4 text-[var(--primary)]" /> : <ChevronUp className="w-4 h-4 text-[var(--primary)]" />}
            <span>Tiến trình 5 bước</span>
          </button>
          <div className="text-xs font-semibold text-[var(--ink-muted)] truncate lg:hidden">
            {activeUnit.nameVi} {actorInfo.lastSavedAt ? `· Đã lưu ${actorInfo.lastSavedAt}` : ''}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button type="button" aria-expanded={mobileOpen} onClick={() => setMobileOpen((p) => !p)} className="lg:hidden inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-xl border border-[var(--primary)]/40 bg-[var(--primary)]/10 text-xs sm:text-sm font-bold text-[var(--primary)] cursor-pointer">
            <span>{mobileOpen ? 'Thu gọn' : 'Xem toàn bộ tiến trình'}</span>
            {mobileOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
          </button>
          <InfoTip title="Mốc tiến độ triển khai toàn Trường" align="right">
            {VTVL_MILESTONES.map((ms) => (
              <div key={ms.id} className="py-1 border-b border-[var(--border-subtle)] last:border-0">
                <strong className="text-[var(--foreground)] block">{ms.day} {ms.month}: {ms.title} ({ms.badgeText})</strong>
                <span>{ms.description}</span>
              </div>
            ))}
          </InfoTip>
        </div>
      </div>

      <div className={`${mobileOpen ? 'block' : 'hidden lg:block'} px-3.5 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--primary)]/[0.04] space-y-1.5`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <Building2 className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
            <span className="text-sm font-bold text-[var(--foreground)] leading-snug break-words">{activeUnit.nameVi}</span>
          </div>
          {currentStep > 1 && (
            onSelectStep ? (
              <button type="button" onClick={() => { onSelectStep(1); setMobileOpen(false); focusTaskTarget('task-1-unit'); }} className="inline-flex items-center gap-1 min-h-[36px] px-2 text-xs font-bold text-[var(--primary)] hover:underline shrink-0 cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5" /><span>Đổi đơn vị</span>
              </button>
            ) : (
              <Link href="/tao-tep?step=1&task=task-1-unit" className="inline-flex items-center gap-1 min-h-[36px] px-2 text-xs font-bold text-[var(--primary)] hover:underline shrink-0">
                <RefreshCw className="w-3.5 h-3.5" /><span>Đổi đơn vị</span>
              </Link>
            )
          )}
        </div>
        <div className="flex items-start gap-2 text-xs text-[var(--ink-muted)] leading-snug break-words">
          <UserCheck className="w-3.5 h-3.5 text-[var(--primary)] shrink-0 mt-0.5" />
          {actorInfo.email && actorInfo.title ? (
            <span><strong>{actorInfo.title}</strong> · {actorInfo.email}</span>
          ) : (
            <span className="text-[var(--warn)] font-semibold">Chưa khai báo người thực hiện</span>
          )}
        </div>
      </div>

      <div className={`${mobileOpen ? 'block' : 'hidden'} ${desktopCollapsed ? 'lg:hidden' : 'lg:block'} p-2.5 space-y-1`}>
        {SIDEBAR_FIVE_STEPS.map((s, idx) => {
          const isCurrent = currentStep === s.num;
          const isDone = currentStep > s.num;
          const hasError = errorStep === s.num;
          const isLastStep = idx === SIDEBAR_FIVE_STEPS.length - 1;
          const handleInternal = onSelectStep && (s.num === 1 || s.num === 2 || s.num === 4);
          const statusText = hasError ? 'Cần sửa lỗi' : isCurrent ? 'Đang thực hiện' : isDone ? 'Đã hoàn thành' : 'Chưa thực hiện';

          const stepHeaderRow = (
            <div className={`group flex items-center gap-2.5 px-3 min-h-[44px] py-1.5 rounded-xl transition-all ${hasError ? 'bg-[var(--fix-soft)] ring-1 ring-[var(--fix)]' : isCurrent ? 'bg-[var(--primary)]/[0.10] ring-1 ring-[var(--primary)]/50' : 'hover:bg-[var(--background)]'}`}>
              <span className="relative flex items-center justify-center w-5 h-5 shrink-0">
                {hasError ? <AlertTriangle className="w-4 h-4 text-[var(--fix)]" /> : isCurrent ? (
                  <span className="w-4 h-4 rounded-full border-2 border-[var(--primary)] bg-[var(--sheet)] flex items-center justify-center"><span className="w-2 h-2 rounded-full bg-[var(--primary)]" /></span>
                ) : isDone ? (
                  <span className="w-4 h-4 rounded-full bg-[var(--ok)] text-white flex items-center justify-center"><Check className="w-3 h-3 stroke-[3]" /></span>
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-[var(--border)] bg-[var(--sheet)] group-hover:border-[var(--primary)]" />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <div className={`text-sm leading-snug ${hasError ? 'font-extrabold text-[var(--fix)]' : isCurrent ? 'font-extrabold text-[var(--primary)]' : isDone ? 'font-bold text-[var(--foreground)]' : 'font-semibold text-[var(--ink-muted)]'}`}>{s.title}</div>
                <div className={`text-xs ${hasError ? 'text-[var(--fix)] font-bold' : isDone ? 'text-[var(--ok)] font-semibold' : 'text-[var(--ink-subtle)]'}`}>{statusText}</div>
              </div>
            </div>
          );

          return (
            <div key={s.num} className="relative">
              {handleInternal ? (
                <button type="button" onClick={() => { onSelectStep(s.num); setMobileOpen(false); if (s.subTasks[0]) handleSubTaskClick(s, s.subTasks[0]); }} className="w-full text-left cursor-pointer">{stepHeaderRow}</button>
              ) : (
                <Link href={s.href} onClick={() => setMobileOpen(false)} className="block">{stepHeaderRow}</Link>
              )}
              {(!isLastStep || isCurrent) && (
                <div className="ml-[19px] pl-3 border-l-2 border-[var(--primary)]/40 py-1 space-y-1">
                  {isCurrent && s.subTasks.map((sub) => (
                    <button key={sub.id} type="button" onClick={() => handleSubTaskClick(s, sub)} className={`w-full flex items-center gap-2.5 px-3 min-h-[44px] rounded-xl text-sm transition-colors cursor-pointer text-left ${activeTaskId === sub.id ? 'bg-[var(--primary)]/12 font-extrabold text-[var(--primary)]' : 'hover:bg-[var(--background)] font-semibold text-[var(--foreground)]'}`}>
                      {stepIcon(s.num)}<span className="flex-1">{sub.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export function MilestonesBar() { return null; }
