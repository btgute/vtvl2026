'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check, ChevronRight, CalendarClock } from 'lucide-react';
import { VTVL_MILESTONES } from '@/configs/milestones';

export interface InfoTipProps {
  title?: string;
  children: React.ReactNode;
  align?: 'left' | 'right';
}

/**
 * Nút "!" nhỏ gọn: rê chuột vào (hover) hoặc bấm vào (click) để xem diễn giải chi tiết,
 * giúp giao diện chính luôn gọn gàng, không hiển thị tràn lan văn bản.
 */
export function InfoTip({ title, children, align = 'left' }: InfoTipProps) {
  const [pinned, setPinned] = useState(false);

  return (
    <span className="relative inline-flex items-center group align-middle ml-1.5">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setPinned((prev) => !prev);
        }}
        aria-label={title || 'Xem thông tin giải thích'}
        title="Rê chuột hoặc bấm để xem chi tiết"
        className={`w-5 h-5 rounded-full text-[11px] font-extrabold inline-flex items-center justify-center transition-colors cursor-pointer border ${
          pinned
            ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
            : 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30 hover:bg-[var(--primary)] hover:text-white'
        }`}
      >
        !
      </button>
      <div
        className={`${
          pinned ? 'block' : 'hidden group-hover:block'
        } absolute z-40 top-full mt-1.5 w-72 sm:w-80 rounded-xl border border-[var(--border)] bg-[var(--sheet)] p-3 text-xs font-normal text-[var(--foreground)] shadow-lg leading-relaxed ${
          align === 'right' ? 'right-0' : 'left-0'
        }`}
      >
        {title && (
          <div className="font-extrabold text-[var(--primary)] mb-1 border-b border-[var(--border-subtle)] pb-1">
            {title}
          </div>
        )}
        <div className="text-[var(--ink-muted)] space-y-1">{children}</div>
      </div>
    </span>
  );
}

export interface SidebarStepItem {
  num: number;
  title: string;
  shortDesc: string;
  href: string;
  badge?: string;
}

export const SIDEBAR_FIVE_STEPS: SidebarStepItem[] = [
  {
    num: 1,
    title: 'Bước 1: Chọn đơn vị & Đặt tên VTVL',
    shortDesc: 'Chọn đơn vị, đặt Tên VTVL cụ thể, chọn Bậc nghề nghiệp & số nhân sự D1.',
    href: '/tao-tep?step=1',
    badge: 'Khởi tạo'
  },
  {
    num: 2,
    title: 'Bước 2: Xuất bộ biểu gốc & Gói .zip',
    shortDesc: 'Tải tệp gốc 21 biểu (v1) và gói phiếu khảo sát (.zip) từng vị trí.',
    href: '/tao-tep?step=2',
    badge: 'Phát phiếu'
  },
  {
    num: 3,
    title: 'Bước 3: Đo định mức thời gian',
    shortDesc: 'Bấm giờ hoặc nhập thời gian thực hiện sản phẩm chuẩn (Biểu B1).',
    href: '/bam-gio',
    badge: 'Khảo sát'
  },
  {
    num: 4,
    title: 'Bước 4: Gộp phiếu & Xuất Tờ trình',
    shortDesc: 'Tích hợp các phiếu khảo sát vào tệp đơn vị (v1 → v2) & tải Tờ trình.',
    href: '/tao-tep?step=4',
    badge: 'Tổng hợp'
  },
  {
    num: 5,
    title: 'Bước 5: Thẩm định chéo 6 chỉ tiêu',
    shortDesc: 'Kiểm tra tự động biểu 13. K_KiemTra đạt 6/6 trước khi trình ký TCNS.',
    href: '/ra-soat',
    badge: 'Hoàn tất'
  }
];

interface WorkflowSidebarProps {
  activeStep?: number;
  onSelectStep?: (step: number) => void;
  unitCode?: string;
}

export function WorkflowSidebar({ activeStep, onSelectStep, unitCode }: WorkflowSidebarProps) {
  const pathname = usePathname();
  const currentStep =
    activeStep ??
    (pathname === '/bam-gio' ? 3 : pathname === '/ra-soat' ? 5 : 1);

  return (
    <aside className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] p-4 space-y-3 shadow-2xs lg:sticky lg:top-20">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
        <div className="flex items-center">
          <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[var(--primary)]">
            Tiến trình 5 bước thực hiện
          </h2>
          <InfoTip title="Mốc tiến độ triển khai toàn Trường" align="right">
            {VTVL_MILESTONES.map((ms) => (
              <div key={ms.id} className="py-1 border-b border-[var(--border-subtle)] last:border-0">
                <strong className="text-[var(--foreground)] block">
                  {ms.day} {ms.month}: {ms.title} ({ms.badgeText})
                </strong>
                <span>{ms.description}</span>
              </div>
            ))}
          </InfoTip>
        </div>
        {unitCode && (
          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)]">
            {unitCode}
          </span>
        )}
      </div>

      <ol className="relative space-y-2">
        {SIDEBAR_FIVE_STEPS.map((s) => {
          const isCurrent = currentStep === s.num;
          const isDone = currentStep > s.num;
          const handleInternal =
            onSelectStep && (s.num === 1 || s.num === 2 || s.num === 4);

          const inner = (
            <div
              className={`rounded-xl border p-3 transition-all flex items-start gap-3 ${
                isCurrent
                  ? 'border-[var(--primary)] bg-[var(--primary)]/[0.06] ring-1 ring-[var(--primary)]/20 shadow-2xs'
                  : isDone
                  ? 'border-[var(--ok)]/40 bg-[var(--ok-soft)]/25 hover:border-[var(--primary)]/50'
                  : 'border-[var(--border-subtle)] bg-[var(--background)] hover:border-[var(--primary)]/40'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5 tabular-nums ${
                  isCurrent
                    ? 'bg-[var(--primary)] text-white'
                    : isDone
                    ? 'bg-[var(--ok)] text-white'
                    : 'bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)]'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : s.num}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <strong className="text-xs font-extrabold text-[var(--foreground)] leading-snug">
                    {s.title}
                  </strong>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-[var(--primary)]' : 'text-[var(--ink-subtle)]'}`} />
                </div>
                {isCurrent && (
                  <p className="text-[11px] text-[var(--ink-muted)] mt-1 leading-relaxed">
                    {s.shortDesc}
                  </p>
                )}
              </div>
            </div>
          );

          return (
            <li key={s.num}>
              {handleInternal ? (
                <button
                  type="button"
                  onClick={() => onSelectStep(s.num)}
                  className="w-full text-left cursor-pointer"
                >
                  {inner}
                </button>
              ) : (
                <Link href={s.href} className="block">
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--ink-muted)]">
        <span className="inline-flex items-center gap-1">
          <CalendarClock className="w-3.5 h-3.5 text-[var(--primary)]" />
          <span>Kỳ số liệu: 01/10/2025–30/9/2026</span>
        </span>
        <Link href="/huong-dan" className="font-bold text-[var(--primary)] hover:underline">
          Xem hướng dẫn
        </Link>
      </div>
    </aside>
  );
}

export function MilestonesBar() {
  return null;
}
