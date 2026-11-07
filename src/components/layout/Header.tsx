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
  Building2,
  BookOpenCheck
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Tổng quan', icon: Home },
  { href: '/huong-dan', label: 'Hướng dẫn đơn vị', icon: BookOpenCheck },
  { href: '/tao-tep', label: 'Bước 1–2–4: Tạo & gộp tệp', icon: FileSpreadsheet },
  { href: '/bam-gio', label: 'Bước 3: Đo định mức', icon: Timer },
  { href: '/ra-soat', label: 'Bước 5: Thẩm định biểu', icon: CheckCircle2 }
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
      <div className="bg-[#004776] text-white text-[11px] sm:text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <Building2 className="w-3.5 h-3.5 text-sky-300 shrink-0" />
            <span>TRƯỜNG ĐẠI HỌC CÔNG NGHỆ KỸ THUẬT TP.HCM (HCM-UTE)</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-white/85 tabular-nums">
            <span>Cơ quan thường trực: Phòng Tổ chức - Nhân sự (TCNS)</span>
            <span>·</span>
            <span>Kỳ thống kê: 01/10/2025–30/9/2026</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-15 sm:h-16 items-center justify-between w-full gap-4">
        <Link
          href="/"
          aria-label="Trang chủ hệ thống Vị trí việc làm 360 HCM-UTE"
          className="flex items-center gap-3 py-1"
        >
          <img
            src="/ute_logo.png"
            alt="HCM-UTE Logo"
            className="block h-9 w-auto md:hidden object-contain"
          />
          <img
            src={dark ? '/horizontal-ute-logo-white.png' : '/horizontal-ute-logo.png'}
            alt="HCM-UTE Logo"
            className="hidden h-10 sm:h-11 w-auto md:block object-contain"
          />
          <div className="border-l border-[var(--border)] pl-3 flex flex-col">
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-[var(--foreground)] leading-tight">
              Vị trí việc làm <span className="text-[var(--primary)]">360</span>
            </span>
            <span className="text-[11px] text-[var(--ink-muted)] font-medium">
              Hệ thống lập và thẩm định đề án vị trí việc làm
            </span>
          </div>
        </Link>

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
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors border ${
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

          <div className="h-5 w-[1px] bg-[var(--border)] hidden lg:block mx-1" />

          <button
            type="button"
            onClick={toggleTheme}
            title={dark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
            className="h-9 w-9 rounded-lg border border-[var(--border)] bg-[var(--sheet)] hover:bg-[var(--muted)] flex items-center justify-center cursor-pointer transition-colors"
          >
            {dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[var(--foreground)]" />}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Mở danh mục điều hướng"
            className="lg:hidden h-9 w-9 rounded-lg border border-[var(--border)] bg-[var(--sheet)] flex items-center justify-center cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold ${
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
