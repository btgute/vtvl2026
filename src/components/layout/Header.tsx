'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileSpreadsheet,
  CheckCircle2,
  Timer,
  Home,
  Menu,
  X,
  BookOpenCheck
} from 'lucide-react';
import { InfoTip } from './MilestonesBar';

const NAV_ITEMS = [
  { href: '/', label: 'Tổng quan (08 bước)', icon: Home },
  { href: '/bang-tinh', label: 'Bảng tính Excel 15 sheet', icon: FileSpreadsheet },
  { href: '/bam-gio', label: 'Bước 3·4: Khối lượng B1 & Tác động B2', icon: Timer },
  { href: '/ra-soat', label: 'Bước 8: Kiểm tra & Xác nhận (K–T–S)', icon: CheckCircle2 },
  { href: '/huong-dan', label: 'Phụ lục HD 07', icon: BookOpenCheck }
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[var(--sheet)] border-b border-[var(--border-subtle)] shadow-2xs">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-10 flex h-16 items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 min-w-0 shrink-0">
          <Link
            href="/"
            aria-label="Trang chủ Tổng quan 08 bước Vị trí việc làm HCM-UTE"
            className="flex items-center gap-2.5 py-1 min-h-[44px] min-w-0"
          >
            <img
              src="/ute_logo.png"
              alt="HCM-UTE Logo"
              className="block h-8 w-auto md:hidden object-contain shrink-0"
            />
            <span className="md:hidden text-sm font-bold text-[var(--foreground)] truncate">
              Vị trí việc làm
            </span>
            <img
              src="/horizontal-ute-logo.png"
              alt="HCM-UTE Logo"
              className="hidden h-10 w-auto md:block object-contain shrink-0"
            />
          </Link>
          <InfoTip title="Căn cứ pháp lý & Cơ quan thường trực">
            <p><strong>Đơn vị chủ trì:</strong> Phòng Tổ chức - Nhân sự (TCNS) — Trường Đại học Công nghệ Kỹ thuật TP.HCM (HCM-UTE).</p>
            <p><strong>Căn cứ:</strong> Hướng dẫn số 07-HD/BTCTW; Nghị định số 232/2026/NĐ-CP; Thông tư số 31/2026/TT-BGDĐT; Hướng dẫn số 02 (1907/HD-ĐHCNKT ngày 17/6/2026).</p>
          </InfoTip>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <nav aria-label="Điều hướng quy trình nghiệp vụ" className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`inline-flex items-center gap-1.5 px-3.5 min-h-[44px] rounded-xl text-sm font-semibold transition-colors border ${
                    active
                      ? 'bg-[var(--surface-tint)] text-[var(--primary)] border-[var(--primary)]/30 font-bold'
                      : 'text-[var(--foreground)] border-transparent hover:bg-[var(--surface-secondary)]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Đóng danh mục điều hướng' : 'Mở danh mục điều hướng'}
            className="lg:hidden h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl border border-[var(--border)] bg-[var(--sheet)] flex items-center justify-center cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-[var(--border-subtle)] bg-[var(--sheet)] px-4 py-3 space-y-1.5 shadow-lg">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 min-h-[48px] rounded-xl text-base font-semibold ${
                  active ? 'bg-[var(--primary)] text-white' : 'text-[var(--foreground)] hover:bg-[var(--surface-secondary)]'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
