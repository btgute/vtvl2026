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
import { DotPattern } from '@/components/ui/DotPattern';
import { UserProfilePopover } from '@/components/auth/UserProfilePopover';

const NAV_ITEMS = [
  { href: '/bang-tinh', label: 'Bảng tính 15 biểu', icon: FileSpreadsheet },
  { href: '/?view=overview', label: 'Quy trình tổng quan', icon: Home },
  { href: '/huong-dan', label: 'Căn cứ pháp lý', icon: BookOpenCheck },
  { href: '/admin', label: 'Quản trị hệ thống', icon: ShieldCheck }
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#cbd5e1] shadow-2xs">
      {/* Top accent dot pattern bar */}
      <div className="relative h-1.5 w-full bg-gradient-to-r from-[#004776] via-[#006cee] to-[#38bdf8] overflow-hidden">
        <DotPattern
          width={12}
          height={12}
          cr={1}
          className="text-white/40"
        />
      </div>

      <div className="w-full max-w-none px-3 sm:px-5 lg:px-7 flex h-16 items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 min-w-0 shrink-0">
          <Link
            href="/bang-tinh"
            aria-label="Hệ thống Vị trí việc làm HCM-UTE"
            className="flex items-center gap-2.5 py-1 min-w-0 cursor-pointer group"
          >
            <div className="h-10 w-10 rounded-xl p-1 bg-[#e1edf8] border border-[#cbd5e1] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <img
                src="/ute_logo.png"
                alt="HCM-UTE Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold text-[#004776] tracking-tight leading-none">
                HCM-UTE VTVL 360
              </span>
              <span className="text-xs font-semibold text-[#20446c] tracking-normal leading-tight mt-0.5">
                Trường Đại học Công nghệ Kỹ thuật TP.HCM
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <nav aria-label="Điều hướng chính" className="hidden lg:flex items-center gap-1.5">
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
                  className={`inline-flex items-center gap-2 px-3.5 h-10 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
                    active
                      ? 'bg-[#e1edf8] text-[#006cee] border-[#006cee]/30 shadow-xs'
                      : 'text-[#004776] border-transparent hover:bg-[#f1f5f9] hover:border-[#cbd5e1]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User profile & Google Login Popover */}
          <div className="pl-1 border-l border-[#cbd5e1]">
            <UserProfilePopover />
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
            className="lg:hidden h-10 w-10 rounded-xl border border-[#cbd5e1] bg-white flex items-center justify-center text-[#004776] hover:bg-[#f1f5f9] cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="lg:hidden fixed inset-0 z-50 bg-[#004776]/50 backdrop-blur-xs flex justify-end"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-[min(22rem,90vw)] h-dvh bg-white border-l border-[#cbd5e1] p-5 flex flex-col justify-between shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#cbd5e1]">
                <div className="flex items-center gap-2">
                  <img src="/ute_logo.png" alt="HCM-UTE Logo" className="h-8 w-8 object-contain" />
                  <div>
                    <div className="text-base font-bold text-[#004776]">HCM-UTE VTVL</div>
                    <div className="text-xs font-medium text-[#20446c]">Điều hướng hệ thống</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="h-9 w-9 rounded-xl border border-[#cbd5e1] inline-flex items-center justify-center cursor-pointer text-[#004776]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5">
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
                      className={`flex items-center gap-3 px-4 min-h-[46px] rounded-xl text-base font-bold ${
                        active
                          ? 'bg-[#006cee] text-white shadow-xs'
                          : 'text-[#004776] hover:bg-[#e1edf8]'
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#cbd5e1] text-xs font-medium text-[#20446c]">
              Trường Đại học Công nghệ Kỹ thuật TP.HCM (HCM-UTE)
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
