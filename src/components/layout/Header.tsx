'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileSpreadsheet,
  Home,
  Menu,
  X,
  BookOpenCheck,
  ShieldCheck
} from 'lucide-react';
import { InfoTip } from './MilestonesBar';

const NAV_ITEMS = [
  { href: '/bang-tinh', label: 'Bảng tính Excel 15 sheet', icon: FileSpreadsheet },
  { href: '/?view=overview', label: 'Tổng quan (08 bước)', icon: Home },
  { href: '/huong-dan', label: 'Phụ lục HD 07', icon: BookOpenCheck },
  { href: '/admin', label: 'Quản trị (Admin)', icon: ShieldCheck }
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = '';
      return;
    }
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-40 bg-[var(--sheet)] border-b border-[var(--border-subtle)]">
      <div className="w-full max-w-none px-3 sm:px-5 lg:px-6 flex h-14 sm:h-15 lg:h-16 items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-1 min-w-0 shrink-0">
          <Link
            href="/bang-tinh"
            aria-label="Bảng tính Excel 15 sheet Vị trí việc làm HCM-UTE"
            className="flex items-center gap-2 py-1 min-w-0 cursor-pointer"
          >
            <img
              src="/ute_logo.png"
              alt="HCM-UTE Logo"
              className="block h-8 w-auto md:hidden object-contain shrink-0"
            />
            <span className="md:hidden text-sm font-semibold text-[var(--foreground)] truncate">
              Vị trí việc làm
            </span>
            <img
              src="/horizontal-ute-logo.png"
              alt="HCM-UTE Logo"
              className="hidden h-8 lg:h-9 w-auto md:block object-contain shrink-0"
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
              const active = item.href === '/bang-tinh'
                ? pathname === '/bang-tinh' || pathname === '/tao-tep'
                : item.href.startsWith('/?view=overview')
                  ? pathname === '/'
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`inline-flex items-center gap-1.5 px-3 h-9 rounded-lg text-[13.5px] whitespace-nowrap transition-colors border ${
                    active
                      ? 'bg-[var(--surface-tint)] text-[var(--primary)] border-[var(--primary)]/25 font-semibold'
                      : 'text-[var(--foreground)] border-transparent font-medium hover:bg-[var(--surface-secondary)]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <Link
            href="/bang-tinh"
            className="hidden sm:inline-flex lg:hidden items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-semibold bg-[var(--surface-tint)] text-[var(--primary)] border border-[var(--primary)]/25 whitespace-nowrap"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
            <span>Bảng tính 15 sheet</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Đóng danh mục điều hướng' : 'Mở danh mục điều hướng'}
            className="lg:hidden h-10 w-10 rounded-lg border border-[var(--border)] bg-[var(--sheet)] flex items-center justify-center cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Danh mục điều hướng"
          className="lg:hidden fixed inset-0 z-50 bg-black/45 flex justify-end"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-[min(20rem,86vw)] h-dvh bg-[var(--sheet)] border-l border-[var(--border)] p-4 flex flex-col justify-between shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[var(--foreground)]">Hệ thống VTVL HCM-UTE</div>
                  <div className="text-xs text-[var(--ink-muted)] truncate">Điều hướng nghiệp vụ</div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Đóng menu"
                  className="h-10 w-10 rounded-lg border border-[var(--border)] inline-flex items-center justify-center cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav aria-label="Menu di động" className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = item.href === '/bang-tinh'
                    ? pathname === '/bang-tinh' || pathname === '/tao-tep'
                    : item.href.startsWith('/?view=overview')
                      ? pathname === '/'
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2.5 px-3.5 min-h-[44px] rounded-lg text-sm ${
                        active ? 'bg-[var(--primary)] text-white font-semibold' : 'text-[var(--foreground)] font-medium hover:bg-[var(--surface-secondary)]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="pt-3 border-t border-[var(--border-subtle)] text-xs text-[var(--ink-subtle)]">
              Phòng Tổ chức - Nhân sự (TCNS) · Trường Đại học Công nghệ Kỹ thuật TP.HCM (HCM-UTE)
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
