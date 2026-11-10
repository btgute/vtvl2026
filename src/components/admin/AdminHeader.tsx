'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, FileSpreadsheet, LogOut, ArrowLeft } from 'lucide-react';

interface AdminHeaderProps {
  onLogout: () => void;
}

export function AdminHeader({ onLogout }: AdminHeaderProps) {
  return (
    <div className="px-5 py-3.5 sm:py-4 border-b border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3 min-h-[64px] sm:min-h-[72px]">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-[#004776]/10 border border-[#004776]/20 flex items-center justify-center text-[#004776] shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-[#004776] tracking-tight truncate">
              Trung tâm Quản trị VTVL 360
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
              Quyền Admin
            </span>
          </div>
          <p className="text-xs text-[#64748b] truncate max-w-xs sm:max-w-md lg:max-w-xl" title="Phòng Tổ chức - Nhân sự (TCNS) · Trường Đại học Công nghệ Kỹ thuật TP.HCM (HCM-UTE)">
            Phòng Tổ chức - Nhân sự (TCNS) · Trường Đại học Công nghệ Kỹ thuật TP.HCM (HCM-UTE)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <Link
          href="/bang-tinh"
          className="h-10 inline-flex items-center gap-1.5 px-3.5 text-xs font-semibold text-[#004776] bg-[#f8fafc] hover:bg-[#e2e8f0] border border-[#cbd5e1] rounded-xl transition-colors cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-[#004776]" />
          <span>Vào Bảng tính 15 sheet</span>
        </Link>

        <button
          type="button"
          onClick={onLogout}
          className="h-10 inline-flex items-center gap-1.5 px-3.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Khóa quản trị</span>
        </button>
      </div>
    </div>
  );
}

