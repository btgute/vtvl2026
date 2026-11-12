'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  ArrowRight,
  Building2,
  CheckCircle2,
  BookOpenCheck,
  History,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { DotPattern } from '@/components/ui/DotPattern';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { getStoredUserProfile, GoogleAuthProfile } from '@/services/auth/google-supabase-auth';
import { HCMUTE_UNITS, findHcmuteUnit } from '@/configs/hcmute-units';

export default function HomePage() {
  const [profile, setProfile] = useState<GoogleAuthProfile | null>(null);
  const [selectedUnitCode, setSelectedUnitCode] = useState('TCNS');

  useEffect(() => {
    setProfile(getStoredUserProfile());
    const onAuth = (e: Event) => {
      const custom = e as CustomEvent<GoogleAuthProfile | null>;
      setProfile(custom.detail || null);
      if (custom.detail?.unitCode) {
        setSelectedUnitCode(custom.detail.unitCode);
      }
    };
    window.addEventListener('vtvl-auth-state-changed', onAuth);
    return () => window.removeEventListener('vtvl-auth-state-changed', onAuth);
  }, []);

  const currentUnit = findHcmuteUnit(profile?.unitCode || selectedUnitCode);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Hero Banner với DotPattern & Logo UTE */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#004776] via-[#005fa3] to-[#006cee] p-6 sm:p-10 text-white shadow-xl overflow-hidden">
        <DotPattern
          width={22}
          height={22}
          cr={1.5}
          className="text-white/20 [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]"
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/20 text-xs sm:text-sm font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Hệ thống Vị trí việc làm &amp; S-Link</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Trường Đại học Công nghệ Kỹ thuật TP.HCM
            </h1>

            <p className="text-base sm:text-lg font-medium text-blue-100 leading-relaxed">
              Chuẩn hóa 15 bảng tính nghiệp vụ theo Hướng dẫn số 07-HD/BTCTW và Nghị định số 232/2026/NĐ-CP dành cho toàn thể 51 đơn vị thuộc HCM-UTE.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href={`/bang-tinh?unit=${currentUnit.code}`}>
                <Button variant="slink" size="lg" className="bg-white text-[#004776] hover:bg-blue-50 font-bold shadow-md">
                  <FileSpreadsheet className="w-5 h-5" />
                  <span>Vào bảng tính 15 biểu</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link href="/huong-dan">
                <Button variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/15 hover:border-white font-bold bg-transparent">
                  <BookOpenCheck className="w-5 h-5" />
                  <span>Căn cứ pháp lý</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Logo đại học & Thẻ thông tin nhanh */}
          <div className="hidden lg:flex flex-col items-center justify-center p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-center shrink-0 w-72">
            <div className="w-20 h-20 rounded-2xl bg-white p-2 shadow-md flex items-center justify-center mb-3">
              <img src="/ute_logo.png" alt="HCM-UTE" className="w-full h-full object-contain" />
            </div>
            <div className="text-base font-bold text-white leading-tight">HCM-UTE VTVL 360</div>
            <div className="text-xs font-semibold text-blue-200 mt-1">Đơn vị chủ trì: Phòng TCNS</div>
            <div className="mt-4 w-full pt-3 border-t border-white/15 flex items-center justify-between text-xs text-blue-100">
              <span>51 đơn vị trực thuộc</span>
              <span className="font-bold text-white">15 biểu chuẩn</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 3 thẻ chức năng chính */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="hover:border-[#006cee] transition-all">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-[#e1edf8] flex items-center justify-center text-[#006cee] mb-2">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <CardTitle className="text-lg">Bảng tính 15 biểu</CardTitle>
            <CardDescription className="text-sm">
              Bộ công cụ bảng tính trực tiếp từ Biểu A1 đến D2, tự động tính tổng FTE, định biên và cơ cấu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/bang-tinh?unit=${currentUnit.code}`}>
              <Button variant="secondary" size="default" className="w-full font-bold">
                <span>Mở không gian làm việc</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-[#006cee] transition-all">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-[#e1edf8] flex items-center justify-center text-[#006cee] mb-2">
              <Building2 className="w-5 h-5" />
            </div>
            <CardTitle className="text-lg">Đơn vị công tác</CardTitle>
            <CardDescription className="text-sm">
              Đang chọn: <span className="font-bold text-[#006cee]">[{currentUnit.code}] {currentUnit.nameVi}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <select
              value={currentUnit.code}
              onChange={(e) => setSelectedUnitCode(e.target.value)}
              className="w-full py-2.5 px-3 text-sm font-bold bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[#004776] focus:ring-2 focus:ring-[#006cee] focus:outline-none cursor-pointer"
            >
              {HCMUTE_UNITS.map((u) => (
                <option key={u.code} value={u.code}>
                  [{u.code}] {u.nameVi}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        <Card className="hover:border-[#006cee] transition-all">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-[#e1edf8] flex items-center justify-center text-[#006cee] mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <CardTitle className="text-lg">Bảo vệ &amp; Đồng bộ</CardTitle>
            <CardDescription className="text-sm">
              Dữ liệu được lưu trữ đệm 3 lớp trên trình duyệt, máy chủ cục bộ và cơ sở dữ liệu Supabase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-xs font-semibold text-[#20446c]">
              <span>Cơ cấu danh mục C1:</span>
              <Badge variant="success">Bảo vệ máy chủ</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
