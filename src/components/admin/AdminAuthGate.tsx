'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, KeyRound, ArrowLeft, Unlock, AlertCircle, Sparkles } from 'lucide-react';
import { verifyAdminPassword } from '@/components/excel-grid/useC1AdminLock';

interface AdminAuthGateProps {
  onSuccess: () => void;
}

const ALLOWED_PASSWORDS = [
  'tcns@2026',
  'admin@2026',
  'HCMUTE@2026',
  'hcmute@2026',
  'tcns@hcmute.edu.vn',
  'TCNS@2026',
  'ADMIN@2026'
];

export function AdminAuthGate({ onSuccess }: AdminAuthGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = password.trim();
    if (!trimmed) {
      setError('Vui lòng nhập mật khẩu quản trị.');
      return;
    }

    setIsVerifying(true);
    setError('');

    // Kiểm tra danh sách mật khẩu quản trị cho phép hoặc hash SHA-256
    const isDirectMatch = ALLOWED_PASSWORDS.includes(trimmed);
    const isHashMatch = await verifyAdminPassword(trimmed);

    setIsVerifying(false);

    if (isDirectMatch || isHashMatch) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('hcmute_vtvl_admin_auth', 'true');
      }
      onSuccess();
    } else {
      setError('Mật khẩu quản trị viên không chính xác. Vui lòng kiểm tra lại.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#cbd5e1] overflow-hidden">
        {/* Banner đầu trang */}
        <div className="bg-linear-to-r from-[#004776] to-[#00385c] p-6 text-white text-center relative">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-amber-300 shadow-inner mb-3">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Cổng xác thực Quản trị viên
          </h2>
          <p className="text-xs text-white/80 mt-1">
            Khu vực giới hạn dành riêng cho Ban Quản trị &amp; Phòng TCNS
          </p>
        </div>

        {/* Form nhập mật khẩu */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="admin-auth-pass" className="block text-xs font-bold text-[#004776]">
              Mật khẩu Quản trị hệ thống:
            </label>
            <div className="relative">
              <input
                id="admin-auth-pass"
                type="password"
                autoFocus
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Nhập mật khẩu quản trị..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#f8fafc] border border-[#cbd5e1] rounded-xl focus:ring-2 focus:ring-[#004776] focus:outline-none text-[#004776] font-medium"
              />
              <KeyRound className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {error && (
              <p className="flex items-center gap-1.5 text-xs text-red-600 font-semibold pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-[11px] text-[#004776] flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Ghi chú xác thực:</span> Mật khẩu quản trị được cấp riêng cho Ban Chỉ đạo VTVL và chuyên viên Phòng Tổ chức - Nhân sự (mặc định thử nghiệm:{' '}
              <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200">
                tcns@2026
              </code>
              ).
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#004776] hover:bg-[#00385c] text-white font-bold rounded-xl text-sm transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Unlock className="w-4 h-4" />
              <span>{isVerifying ? 'Đang kiểm tra...' : 'Đăng nhập Quản trị viên'}</span>
            </button>

            <Link
              href="/bang-tinh"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 text-xs font-semibold text-[#64748b] hover:text-[#004776] hover:bg-[#f1f5f9] rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại Bảng tính 15 sheet</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
