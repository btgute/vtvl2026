'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileSpreadsheet,
  CheckCircle2,
  Timer,
  Home,
  Sun,
  Moon,
  Menu,
  X,
  BookOpenCheck
} from 'lucide-react';
import { InfoTip } from './MilestonesBar';

const NAV_ITEMS = [
  { href: '/', label: 'Tổng quan', icon: Home },
  { href: '/tao-tep', label: 'Bước 1·2·4: Tạo & gộp tệp', icon: FileSpreadsheet },
  { href: '/bam-gio', label: 'Bước 3: Đo định mức', icon: Timer },
  { href: '/ra-soat', label: 'Bước 5: Thẩm định', icon: CheckCircle2 },
  { href: '/huong-dan', label: 'Hướng dẫn', icon: BookOpenCheck }
];

export function Header() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDark(isDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--sheet)] border-b border-[var(--border)] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-14 sm:h-16 items-center justify-between w-full gap-3">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            aria-label="Trang chủ hệ thống Vị trí việc làm 360 HCM-UTE"
            className="flex items-center gap-2.5 py-1"
          >
            <img
              src="/ute_logo.png"
              alt="HCM-UTE Logo"
              className="block h-9 w-auto md:hidden object-contain"
            />
            <img
              src={dark ? '/horizontal-ute-logo-white.png' : '/horizontal-ute-logo.png'}
              alt="HCM-UTE Logo"
              className="hidden h-9 sm:h-10 w-auto md:block object-contain"
            />
            <div className="border-l border-[var(--border)] pl-2.5 flex flex-col">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-[var(--foreground)] leading-tight">
                Vị trí việc làm <span className="text-[var(--primary)]">360</span>
              </span>
              <span className="text-[11px] text-[var(--ink-muted)] font-medium hidden sm:inline">
                Đề án VTVL 2026–2030 · HCM-UTE
              </span>
            </div>
          </Link>
          <InfoTip title="Căn cứ pháp lý & Cơ quan thường trực">
            <p><strong>Đơn vị chủ trì:</strong> Phòng Tổ chức - Nhân sự (TCNS) — Trường Đại học Công nghệ Kỹ thuật TP.HCM (HCM-UTE).</p>
            <p><strong>Căn cứ:</strong> Hướng dẫn số 07-HD/BTCTW; Nghị định số 232/2026/NĐ-CP; Thông tư số 31/2026/TT-BGDĐT; Hướng dẫn số 02 (1907/HD-ĐHCNKT ngày 17/6/2026).</p>
          </InfoTip>
        </div>

        <div className="flex items-center gap-1.5">
          <nav aria-label="Điều hướng quy trình nghiệp vụ" className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                    active
                      ? 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30'
                      : 'text-[var(--foreground)] border-transparent hover:bg-[var(--muted)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={toggleTheme}
            title={dark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
            className="h-8 w-8 rounded-lg border border-[var(--border)] bg-[var(--sheet)] hover:bg-[var(--muted)] flex items-center justify-center cursor-pointer transition-colors"
          >
            {dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[var(--foreground)]" />}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Mở danh mục điều hướng"
            className="lg:hidden h-8 w-8 rounded-lg border border-[var(--border)] bg-[var(--sheet)] flex items-center justify-center cursor-pointer"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-[var(--border)] bg-[var(--sheet)] px-4 py-3 space-y-1 shadow-md">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold ${
                  active ? 'bg-[var(--primary)] text-white' : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
