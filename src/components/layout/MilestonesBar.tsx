'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { VTVL_MILESTONES } from '@/configs/milestones';

const WORKFLOW_STEPS = [
  { step: 'Bước 1', label: 'Khởi tạo tệp đơn vị (21 biểu)', href: '/tao-tep', match: '/tao-tep' },
  { step: 'Bước 2', label: 'Phân phối phiếu khảo sát (.zip)', href: '/tao-tep#buoc-3', match: '/tao-tep' },
  { step: 'Bước 3', label: 'Đo định mức thời gian (phút/SP)', href: '/bam-gio', match: '/bam-gio' },
  { step: 'Bước 4', label: 'Tổng hợp phiếu và xuất Tờ trình', href: '/tao-tep#buoc-4', match: '/tao-tep' },
  { step: 'Bước 5', label: 'Thẩm định chéo và trình ký hồ sơ', href: '/ra-soat', match: '/ra-soat' }
];

export function MilestonesBar() {
  const pathname = usePathname();

  return (
    <div className="space-y-3 my-3">
      {/* Thanh trình tự 5 bước nghiệp vụ đồng bộ toàn hệ thống */}
      <div
        aria-label="Trình tự 5 bước thực hiện đề án vị trí việc làm"
        className="grid grid-cols-1 sm:grid-cols-5 gap-2"
      >
        {WORKFLOW_STEPS.map((item) => {
          const active = pathname === item.match;
          return (
            <Link
              key={item.step}
              href={item.href}
              className={`rounded-xl border px-3 py-2.5 transition-all flex flex-col justify-between gap-0.5 ${
                active
                  ? 'border-[var(--primary)] bg-[var(--primary)]/[0.06] ring-1 ring-[var(--primary)]/20'
                  : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/50'
              }`}
            >
              <span className="text-[11px] font-mono font-bold text-[var(--primary)]">
                {item.step}
              </span>
              <span className="text-xs font-bold text-[var(--foreground)] leading-snug">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Ba mốc tiến độ kế hoạch của Nhà trường */}
      <div
        aria-label="Kế hoạch tiến độ triển khai tại HCM-UTE"
        className="grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        {VTVL_MILESTONES.map((ms) => {
          const isCompleted = ms.status === 'completed';
          const isActive = ms.status === 'active';
          return (
            <div
              key={ms.id}
              className={`rounded-xl border p-3 transition-all grid grid-cols-[48px_1fr] gap-3 items-start ${
                isActive
                  ? 'border-[var(--primary)] bg-[var(--sheet)] shadow-2xs'
                  : isCompleted
                  ? 'border-[var(--border)] bg-[var(--muted)]/50 opacity-90'
                  : 'border-[var(--border)] bg-[var(--sheet)]'
              }`}
            >
              <div
                className={`rounded-lg py-1.5 px-1 text-center flex flex-col items-center justify-center border ${
                  isActive
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                    : 'bg-[var(--muted)] text-[var(--foreground)] border-[var(--border)]'
                }`}
              >
                <span className="text-lg font-extrabold leading-none tabular-nums">
                  {ms.day}
                </span>
                <span className="text-[10px] font-medium mt-0.5 opacity-90">
                  {ms.month}
                </span>
              </div>

              <div className="min-w-0 space-y-0.5">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <strong className="text-xs font-bold text-[var(--foreground)]">
                    {ms.title}
                  </strong>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-[#ED1C24]/10 text-[#ED1C24]'
                        : isCompleted
                        ? 'bg-[var(--ok-soft)] text-[var(--ok)]'
                        : 'bg-[var(--muted)] text-[var(--ink-muted)]'
                    }`}
                  >
                    {ms.badgeText}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--ink-muted)] leading-relaxed">
                  {ms.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
