'use client';

import React, { useState } from 'react';
import { X, Building2, User, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DotPattern } from '@/components/ui/DotPattern';
import { HCMUTE_UNITS } from '@/configs/hcmute-units';
import {
  initiateGoogleOAuth,
  loginWithHcmuteIdentity,
  GoogleAuthProfile
} from '@/services/auth/google-supabase-auth';

interface GoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (profile: GoogleAuthProfile) => void;
  defaultUnitCode?: string;
}

export function GoogleLoginModal({
  isOpen,
  onClose,
  onSuccess,
  defaultUnitCode = 'TCNS'
}: GoogleLoginModalProps) {
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [unitCode, setUnitCode] = useState(defaultUnitCode);
  const [roleTitle, setRoleTitle] = useState('Chuyên viên phụ trách');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGoogleOAuthClick = () => {
    setIsSubmitting(true);
    initiateGoogleOAuth();
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setIsSubmitting(true);
    const profile = loginWithHcmuteIdentity({
      email: emailInput,
      displayName: nameInput.trim() || undefined,
      unitCode,
      roleLabel: roleTitle
    });

    setIsSubmitting(false);
    onSuccess?.(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#004776]/40 backdrop-blur-xs animate-in fade-in-0 duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#cbd5e1] overflow-hidden">
        {/* Header with vibrant dot pattern and official HCM-UTE Logo */}
        <div className="relative bg-gradient-to-br from-[#004776] to-[#005fa3] p-6 text-white overflow-hidden">
          <DotPattern
            width={18}
            height={18}
            cr={1.2}
            className="text-white/25 [mask-image:radial-gradient(ellipse_at_top,white,transparent_75%)]"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Đóng hộp thoại"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-1.5 shadow-md shrink-0 flex items-center justify-center">
              <img src="/ute_logo.png" alt="HCM-UTE Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-blue-200">
                Cổng xác thực tập trung
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Đăng nhập hệ thống VTVL
              </h2>
            </div>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-5">
          {/* Nút đăng nhập Google */}
          <div>
            <button
              type="button"
              onClick={handleGoogleOAuthClick}
              disabled={isSubmitting}
              className="w-full h-12 flex items-center justify-center gap-3 px-5 rounded-2xl border-2 border-[#cbd5e1] hover:border-[#006cee] bg-white hover:bg-[#f8fafc] text-[#004776] font-bold text-base transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-[0.98]"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Tiếp tục với tài khoản Google</span>
            </button>
            <p className="mt-2 text-center text-xs text-[#20446c]">
              Khuyên dùng email công vụ có đuôi <span className="font-semibold text-[#006cee]">@hcmute.edu.vn</span>
            </p>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#cbd5e1] w-full" />
            <span className="bg-white px-3 text-xs font-semibold uppercase text-[#20446c]">
              Hoặc nhập thông tin nhanh
            </span>
            <div className="border-t border-[#cbd5e1] w-full" />
          </div>

          {/* Form đăng nhập tài khoản cán bộ */}
          <form onSubmit={handleEmailSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#004776] mb-1">
                Email công vụ HCM-UTE:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="ten.cb@hcmute.edu.vn"
                  className="w-full pl-9 pr-3 py-2.5 text-sm font-medium bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[#004776] focus:ring-2 focus:ring-[#006cee] focus:outline-none"
                />
                <Mail className="w-4 h-4 text-[#20446c] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#004776] mb-1">
                Họ và tên cán bộ:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full pl-9 pr-3 py-2.5 text-sm font-medium bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[#004776] focus:ring-2 focus:ring-[#006cee] focus:outline-none"
                />
                <User className="w-4 h-4 text-[#20446c] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-[#004776] mb-1">
                  Đơn vị phụ trách:
                </label>
                <select
                  value={unitCode}
                  onChange={(e) => setUnitCode(e.target.value)}
                  className="w-full py-2.5 px-3 text-xs font-bold bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[#004776] focus:ring-2 focus:ring-[#006cee] focus:outline-none cursor-pointer"
                >
                  {HCMUTE_UNITS.map((u) => (
                    <option key={u.code} value={u.code}>
                      [{u.code}] {u.nameVi}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#004776] mb-1">
                  Chức vụ:
                </label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="Trợ lý khoa / Chuyên viên"
                  className="w-full py-2.5 px-3 text-xs font-medium bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[#004776] focus:ring-2 focus:ring-[#006cee] focus:outline-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="slink"
              size="lg"
              disabled={isSubmitting || !emailInput.trim()}
              className="w-full mt-2"
            >
              <span>Vào không gian làm việc</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
