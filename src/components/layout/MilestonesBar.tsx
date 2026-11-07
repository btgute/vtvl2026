'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Check, ChevronDown, ChevronRight, FileSpreadsheet, Building2, Layers, Timer, GitMerge, ShieldCheck, RefreshCw, UserCheck } from 'lucide-react';
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
    <span className="relative inline-flex items-center group align-middle ml-1.5">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPinned((prev) => !prev); }}
        aria-label={title || 'Xem thông tin giải thích'}
        title="Rê chuột hoặc bấm để xem chi tiết"
        className={`w-4.5 h-4.5 rounded-full text-[10px] font-extrabold inline-flex items-center justify-center transition-colors cursor-pointer border ${
          pinned ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30 hover:bg-[var(--primary)] hover:text-white'
        }`}
      >
        !
      </button>
      <div className={`${pinned ? 'block' : 'hidden group-hover:block'} absolute z-40 top-full mt-1.5 w-72 sm:w-80 rounded-xl border border-[var(--border)] bg-[var(--sheet)] p-3 text-xs font-normal text-[var(--foreground)] shadow-lg leading-relaxed ${align === 'right' ? 'right-0' : 'left-0'}`}>
        {title && <div className="font-extrabold text-[var(--primary)] mb-1 border-b border-[var(--border-subtle)] pb-1">{title}</div>}
        <div className="text-[var(--ink-muted)] space-y-1">{children}</div>
      </div>
    </span>
  );
}

export interface StepSubTask {
  id: string;
  label: string;
  statusTag: string;
}

export interface SidebarStepItem {
  num: number;
  title: string;
  href: string;
  badge: string;
  subTasks: StepSubTask[];
}

export const SIDEBAR_FIVE_STEPS: SidebarStepItem[] = [
  {
    num: 1, title: 'Bước 1: Đề xuất VTVL đơn vị', href: '/tao-tep?step=1', badge: 'Đề xuất',
    subTasks: [
      { id: 'task-1-unit', label: 'Chọn đơn vị', statusTag: 'ĐV' },
      { id: 'task-1-actor', label: 'Email & Chức vụ thực hiện', statusTag: 'USER' },
      { id: 'task-1-add', label: 'Thêm vị trí việc làm', statusTag: '+' },
      { id: 'task-1-name', label: 'Tên VTVL cụ thể', statusTag: 'C1' },
      { id: 'task-1-level', label: 'Bậc nghề nghiệp', statusTag: 'BẬC' },
      { id: 'task-1-params', label: 'Phương pháp & Giờ', statusTag: 'PP' },
      { id: 'task-1-staff', label: 'Nhân sự & Biên chế', statusTag: 'C3' }
    ]
  },
  {
    num: 2, title: 'Bước 2: Xuất bộ biểu gốc', href: '/tao-tep?step=2', badge: 'v1',
    subTasks: [
      { id: 'task-2-zip', label: 'Tùy chọn gói phiếu .zip', statusTag: 'ZIP' },
      { id: 'task-2-export', label: 'Khởi tạo & Tải bộ biểu', statusTag: 'XLSX' }
    ]
  },
  {
    num: 3, title: 'Bước 3: Đo định mức B1', href: '/bam-gio', badge: 'B1',
    subTasks: [
      { id: 'task-3-vtvl', label: 'Chọn vị trí việc làm', statusTag: 'C1' },
      { id: 'task-3-timer', label: 'Bấm giờ trực tiếp', statusTag: 'ĐO' },
      { id: 'task-3-manual', label: 'Nhập khung giờ thực tế', statusTag: 'M' },
      { id: 'task-3-export', label: 'Xuất phiếu định mức', statusTag: 'XLSX' }
    ]
  },
  {
    num: 4, title: 'Bước 4: Gộp phiếu khảo sát', href: '/tao-tep?step=4', badge: 'v2',
    subTasks: [
      { id: 'task-4-root', label: 'Tệp đơn vị gốc v1', statusTag: 'v1' },
      { id: 'task-4-forms', label: 'Chọn phiếu khảo sát', statusTag: 'B1' },
      { id: 'task-4-merge', label: 'Tổng hợp phiếu v1 → v2', statusTag: 'v2' }
    ]
  },
  {
    num: 5, title: 'Bước 5: Thẩm định chéo', href: '/ra-soat', badge: '6/6',
    subTasks: [
      { id: 'task-5-run', label: 'Kiểm tra hồ sơ đơn vị', statusTag: 'K' },
      { id: 'task-5-filter', label: 'Tra cứu & lọc cảnh báo', statusTag: 'LỌC' },
      { id: 'task-5-export', label: 'Xuất báo cáo thẩm định', statusTag: 'XLSX' }
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

interface WorkflowSidebarProps {
  activeStep?: number;
  onSelectStep?: (step: number) => void;
  unitCode?: string;
}

export function WorkflowSidebar({ activeStep, onSelectStep, unitCode }: WorkflowSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeUnit, setActiveUnit] = useState(() => getActiveUnitDefinition(unitCode));
  const [actorInfo, setActorInfo] = useState(() => ({ email: '', title: '' }));
  const [collapsed, setCollapsed] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string>('');

  useEffect(() => {
    const sync = () => {
      setActiveUnit(getActiveUnitDefinition(unitCode));
      const s = getActiveUnitSession();
      setActorInfo({ email: s.actorEmail, title: s.actorTitle });
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

  const stepIcon = (num: number) => {
    if (num === 1) return <Layers className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />;
    if (num === 2) return <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />;
    if (num === 3) return <Timer className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />;
    if (num === 4) return <GitMerge className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />;
    return <ShieldCheck className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />;
  };

  const handleSubTaskClick = (step: SidebarStepItem, sub: StepSubTask) => {
    setActiveTaskId(sub.id);
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
    <aside className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] overflow-hidden shadow-2xs lg:sticky lg:top-20 select-none">
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--background)]/70">
        <button type="button" onClick={() => setCollapsed((p) => !p)} className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[var(--foreground)] cursor-pointer">
          {collapsed ? <ChevronRight className="w-3.5 h-3.5 text-[var(--primary)]" /> : <ChevronDown className="w-3.5 h-3.5 text-[var(--primary)]" />}
          <span>Tiến trình 5 bước</span>
        </button>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[var(--primary)]/12 text-[var(--primary)] border border-[var(--primary)]/30">
            {activeUnit.code}
          </span>
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

      <div className="px-3.5 py-2 border-b border-[var(--border-subtle)] bg-[var(--primary)]/[0.04] space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Building2 className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
            <span className="text-xs font-bold text-[var(--foreground)] truncate" title={activeUnit.nameVi}>{activeUnit.nameVi}</span>
          </div>
          {currentStep > 1 && (
            onSelectStep ? (
              <button type="button" onClick={() => { onSelectStep(1); focusTaskTarget('task-1-unit'); }} className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--primary)] hover:underline shrink-0 cursor-pointer">
                <RefreshCw className="w-2.5 h-2.5" /><span>Đổi ĐV</span>
              </button>
            ) : (
              <Link href="/tao-tep?step=1&task=task-1-unit" className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--primary)] hover:underline shrink-0">
                <RefreshCw className="w-2.5 h-2.5" /><span>Đổi ĐV</span>
              </Link>
            )
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--ink-muted)] truncate">
          <UserCheck className="w-3 h-3 text-[var(--primary)] shrink-0" />
          {actorInfo.email && actorInfo.title ? (
            <span className="truncate" title={`${actorInfo.title} — ${actorInfo.email}`}>
              <strong>{actorInfo.title}</strong> · {actorInfo.email}
            </span>
          ) : (
            <span className="text-[#B45309] font-semibold">Bắt buộc nhập Email &amp; Chức vụ</span>
          )}
        </div>
      </div>

      {!collapsed && (
        <div className="py-2 px-2">
          {SIDEBAR_FIVE_STEPS.map((s, idx) => {
            const isCurrent = currentStep === s.num;
            const isDone = currentStep > s.num;
            const isLastStep = idx === SIDEBAR_FIVE_STEPS.length - 1;
            const handleInternal = onSelectStep && (s.num === 1 || s.num === 2 || s.num === 4);

            const stepHeaderRow = (
              <div className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all ${isCurrent ? 'bg-[var(--primary)]/[0.10] ring-1 ring-[var(--primary)]/50' : 'hover:bg-[var(--background)]'}`}>
                <span className="relative flex items-center justify-center w-4 h-4 shrink-0">
                  {isCurrent ? (
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-[var(--primary)] bg-[var(--sheet)] flex items-center justify-center shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                    </span>
                  ) : isDone ? (
                    <span className="w-3.5 h-3.5 rounded-full bg-[var(--primary)] text-white flex items-center justify-center"><Check className="w-2.5 h-2.5 stroke-[3]" /></span>
                  ) : (
                    <span className="w-3 h-3 rounded-full border-2 border-[var(--border)] bg-[var(--sheet)] group-hover:border-[var(--primary)]" />
                  )}
                </span>
                <span className={`text-xs flex-1 ${isCurrent ? 'font-extrabold text-[var(--primary)]' : isDone ? 'font-bold text-[var(--foreground)]' : 'font-semibold text-[var(--ink-muted)]'}`}>
                  {s.title}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${isCurrent ? 'bg-[var(--primary)] text-white' : isDone ? 'bg-[var(--ok-soft)] text-[var(--ok)]' : 'bg-[var(--background)] text-[var(--ink-subtle)] border border-[var(--border-subtle)]'}`}>
                  {isDone ? '✓' : s.badge}
                </span>
              </div>
            );

            return (
              <div key={s.num} className="relative">
                {handleInternal ? (
                  <button type="button" onClick={() => { onSelectStep(s.num); if (s.subTasks[0]) handleSubTaskClick(s, s.subTasks[0]); }} className="w-full text-left cursor-pointer">
                    {stepHeaderRow}
                  </button>
                ) : (
                  <Link href={s.href} className="block">{stepHeaderRow}</Link>
                )}

                {(!isLastStep || isCurrent) && (
                  <div className="ml-[17px] pl-3 border-l-2 border-[var(--primary)]/40 py-1 space-y-0.5">
                    {isCurrent && s.subTasks.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleSubTaskClick(s, sub)}
                        className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer text-left ${
                          activeTaskId === sub.id ? 'bg-[var(--primary)]/12 font-extrabold text-[var(--primary)]' : 'hover:bg-[var(--background)] font-semibold text-[var(--foreground)]'
                        }`}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          {stepIcon(s.num)}
                          <span>{sub.label}</span>
                        </span>
                        <span className="font-mono text-[10px] font-extrabold text-[var(--primary)] shrink-0">{sub.statusTag}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}

export function MilestonesBar() {
  return null;
}
