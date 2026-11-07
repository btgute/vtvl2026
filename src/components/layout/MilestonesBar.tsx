'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Check,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  Building2,
  Layers,
  Timer,
  GitMerge,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { VTVL_MILESTONES } from '@/configs/milestones';
import { getActiveUnitDefinition } from '@/services/telemetry/activity-log';

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
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setPinned((prev) => !prev);
        }}
        aria-label={title || 'Xem thông tin giải thích'}
        title="Rê chuột hoặc bấm để xem chi tiết"
        className={`w-4.5 h-4.5 rounded-full text-[10px] font-extrabold inline-flex items-center justify-center transition-colors cursor-pointer border ${
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

export interface StepSubTask {
  label: string;
  sheetHint: string;
  statusTag: string;
}

export interface SidebarStepItem {
  num: number;
  title: string;
  shortDesc: string;
  href: string;
  badge: string;
  subTasks: StepSubTask[];
}

export const SIDEBAR_FIVE_STEPS: SidebarStepItem[] = [
  {
    num: 1,
    title: 'Bước 1: Chọn đơn vị & Đặt tên VTVL',
    shortDesc: 'Chọn đơn vị, đặt Tên VTVL cụ thể, chọn Bậc nghề nghiệp & nhân sự D1.',
    href: '/tao-tep?step=1',
    badge: 'Cấu hình',
    subTasks: [
      { label: 'Chọn đơn vị', sheetHint: '51 đơn vị HCM-UTE', statusTag: 'ĐV' },
      { label: 'Tên VTVL cụ thể', sheetHint: '6. C1_VTVL (Mục 4)', statusTag: 'M' },
      { label: 'Bậc nghề nghiệp', sheetHint: 'Phụ lục I (Bậc 1–5)', statusTag: 'M' },
      { label: 'Nhân sự hiện có', sheetHint: '9. D1_NhanLuc', statusTag: 'D1' }
    ]
  },
  {
    num: 2,
    title: 'Bước 2: Xuất bộ biểu gốc & Gói .zip',
    shortDesc: 'Tải tệp gốc 21 biểu (v1) và gói phiếu khảo sát (.zip) từng vị trí.',
    href: '/tao-tep?step=2',
    badge: 'v1 · 21 biểu',
    subTasks: [
      { label: 'Tệp đơn vị gốc v1', sheetHint: 'A1..D2, K, T, S', statusTag: 'XLSX' },
      { label: 'Phiếu khảo sát B1', sheetHint: '3. B1_KhoiLuong', statusTag: 'ZIP' },
      { label: 'Đồng bộ cơ sở dữ liệu', sheetHint: 'Supabase 18 bảng', statusTag: 'DB' }
    ]
  },
  {
    num: 3,
    title: 'Bước 3: Đo định mức thời gian',
    shortDesc: 'Bấm giờ hoặc nhập thời gian thực hiện sản phẩm chuẩn (Biểu B1).',
    href: '/bam-gio',
    badge: 'B1 · Phút/SP',
    subTasks: [
      { label: 'Chọn VTVL của đơn vị', sheetHint: '6. C1_VTVL', statusTag: 'C1' },
      { label: 'Bấm giờ / Nhập phiên đo', sheetHint: 'Phien_Do', statusTag: 'M' },
      { label: 'Xuất phiếu định mức', sheetHint: '3. B1_KhoiLuong', statusTag: 'XLSX' }
    ]
  },
  {
    num: 4,
    title: 'Bước 4: Gộp phiếu & Xuất Tờ trình',
    shortDesc: 'Tích hợp các phiếu khảo sát vào tệp gốc (v1 → v2) & tải Tờ trình.',
    href: '/tao-tep?step=4',
    badge: 'v1 → v2',
    subTasks: [
      { label: 'Nạp tệp gốc đơn vị', sheetHint: 'Tự động từ Bước 2', statusTag: 'v1' },
      { label: 'Gộp phiếu khảo sát B1', sheetHint: '3. B1 & 8. C3_NhuCau', statusTag: 'v2' },
      { label: 'Ghi lịch sử phiên bản', sheetHint: '15. S_NhatKy', statusTag: 'LOG' }
    ]
  },
  {
    num: 5,
    title: 'Bước 5: Thẩm định chéo 6 chỉ tiêu',
    shortDesc: 'Kiểm tra tự động biểu 13. K_KiemTra đạt 6/6 trước khi trình ký.',
    href: '/ra-soat',
    badge: 'K_KiemTra',
    subTasks: [
      { label: 'Đối soát A1 ↔ A2 ↔ B1', sheetHint: 'Chỉ tiêu 1, 2, 3', statusTag: 'K1-3' },
      { label: 'Đối soát B2 ↔ C1 ↔ D1', sheetHint: 'Chỉ tiêu 4, 5', statusTag: 'K4-5' },
      { label: 'Phương án C3 ↔ D2', sheetHint: 'Chỉ tiêu 6 (FTE)', statusTag: 'K6' }
    ]
  }
];

interface WorkflowSidebarProps {
  activeStep?: number;
  onSelectStep?: (step: number) => void;
  unitCode?: string;
}

export function WorkflowSidebar({ activeStep, onSelectStep, unitCode }: WorkflowSidebarProps) {
  const pathname = usePathname();
  const [activeUnit, setActiveUnit] = useState(() => getActiveUnitDefinition(unitCode));
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setActiveUnit(getActiveUnitDefinition(unitCode));
    const sync = () => setActiveUnit(getActiveUnitDefinition(unitCode));
    window.addEventListener('vtvl-unit-session-updated', sync);
    return () => window.removeEventListener('vtvl-unit-session-updated', sync);
  }, [unitCode]);

  const currentStep =
    activeStep ??
    (pathname === '/bam-gio' ? 3 : pathname === '/ra-soat' ? 5 : 1);

  const stepIcon = (num: number) => {
    if (num === 1) return <Layers className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />;
    if (num === 2) return <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />;
    if (num === 3) return <Timer className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />;
    if (num === 4) return <GitMerge className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />;
    return <ShieldCheck className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />;
  };

  return (
    <aside className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] overflow-hidden shadow-2xs lg:sticky lg:top-20 select-none">
      {/* Thanh tiêu đề kiểu Graph Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--background)]/70">
        <button
          type="button"
          onClick={() => setCollapsed((p) => !p)}
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[var(--foreground)] cursor-pointer"
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-[var(--primary)]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[var(--primary)]" />
          )}
          <span>Tiến trình 5 bước</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-[var(--ink-muted)]">Auto</span>
          <span className="font-mono text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[var(--primary)]/12 text-[var(--primary)] border border-[var(--primary)]/30">
            {activeUnit.code}
          </span>
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
      </div>

      {/* Thanh hiển thị Đơn vị đang cố định xuyên suốt Bước 1 -> 5 */}
      <div className="px-3.5 py-2 border-b border-[var(--border-subtle)] bg-[var(--primary)]/[0.04] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Building2 className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
          <span className="text-xs font-bold text-[var(--foreground)] truncate" title={activeUnit.nameVi}>
            {activeUnit.nameVi}
          </span>
        </div>
        {currentStep > 1 && (
          onSelectStep ? (
            <button
              type="button"
              onClick={() => onSelectStep(1)}
              title="Đổi đơn vị tại Bước 1"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--primary)] hover:underline shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>Đổi ĐV</span>
            </button>
          ) : (
            <Link
              href="/tao-tep?step=1"
              title="Đổi đơn vị tại Bước 1"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--primary)] hover:underline shrink-0"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>Đổi ĐV</span>
            </Link>
          )
        )}
      </div>

      {/* Cây tiến trình dọc kiểu Git Graph (Nút tròn + Đường thẳng nối liền + Nhánh con) */}
      {!collapsed && (
        <div className="py-2 px-2">
          {SIDEBAR_FIVE_STEPS.map((s, idx) => {
            const isCurrent = currentStep === s.num;
            const isDone = currentStep > s.num;
            const isLastStep = idx === SIDEBAR_FIVE_STEPS.length - 1;
            const handleInternal =
              onSelectStep && (s.num === 1 || s.num === 2 || s.num === 4);

            const stepHeaderRow = (
              <div
                className={`group flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all ${
                  isCurrent
                    ? 'bg-[var(--primary)]/[0.10] ring-1 ring-[var(--primary)]/50'
                    : 'hover:bg-[var(--background)]'
                }`}
              >
                {/* Nút tròn trên trục Graph */}
                <span className="relative flex items-center justify-center w-4 h-4 shrink-0">
                  {isCurrent ? (
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-[var(--primary)] bg-[var(--sheet)] flex items-center justify-center shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                    </span>
                  ) : isDone ? (
                    <span className="w-3.5 h-3.5 rounded-full bg-[var(--primary)] text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="w-3 h-3 rounded-full border-2 border-[var(--border)] bg-[var(--sheet)] group-hover:border-[var(--primary)]" />
                  )}
                </span>

                {/* Tên bước */}
                <span
                  className={`text-xs truncate flex-1 ${
                    isCurrent
                      ? 'font-extrabold text-[var(--primary)]'
                      : isDone
                      ? 'font-bold text-[var(--foreground)]'
                      : 'font-semibold text-[var(--ink-muted)]'
                  }`}
                >
                  {s.title}
                </span>

                {/* Nhãn pill bên phải giống badge "main" trên Git Graph */}
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                    isCurrent
                      ? 'bg-[var(--primary)] text-white'
                      : isDone
                      ? 'bg-[var(--ok-soft)] text-[var(--ok)]'
                      : 'bg-[var(--background)] text-[var(--ink-subtle)] border border-[var(--border-subtle)]'
                  }`}
                >
                  {isDone ? 'ĐẠT' : s.badge}
                </span>
              </div>
            );

            return (
              <div key={s.num} className="relative">
                {/* Dòng tiêu đề bước */}
                {handleInternal ? (
                  <button
                    type="button"
                    onClick={() => onSelectStep(s.num)}
                    className="w-full text-left cursor-pointer"
                  >
                    {stepHeaderRow}
                  </button>
                ) : (
                  <Link href={s.href} className="block">
                    {stepHeaderRow}
                  </Link>
                )}

                {/* Trục thẳng nối xuống bước tiếp theo + Danh sách mục con khi bước đang mở */}
                {(!isLastStep || isCurrent) && (
                  <div className="ml-[17px] pl-3.5 border-l-2 border-[var(--primary)]/40 py-1 space-y-0.5">
                    {isCurrent &&
                      s.subTasks.map((sub, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center justify-between gap-2 px-2 py-1 rounded-md hover:bg-[var(--background)]/80 text-[11px]"
                        >
                          <div className="flex items-center gap-1.5 min-w-0 truncate">
                            {stepIcon(s.num)}
                            <span className="font-bold text-[var(--foreground)] truncate">
                              {sub.label}
                            </span>
                            <span className="text-[10px] text-[var(--ink-muted)] truncate">
                              {sub.sheetHint}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] font-extrabold text-[#B45309] shrink-0">
                            {sub.statusTag}
                          </span>
                        </div>
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
