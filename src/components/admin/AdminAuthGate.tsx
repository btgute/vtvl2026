'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, KeyRound, ArrowLeft, Unlock, AlertCircle } from 'lucide-react';
import { DotPattern } from '@/components/ui/DotPattern';
import { Button } from '@/components/ui/Button';

interface AdminAuthGateProps {
  onSuccess: () => void;
}

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

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: trimmed })
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Mật khẩu quản trị viên không chính xác.');
      }
    } catch {
      setError('Không thể kết nối đến máy chủ xác thực.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#cbd5e1] overflow-hidden">
        {/* Header with DotPattern */}
        <div className="relative bg-gradient-to-br from-[#004776] to-[#005fa3] p-8 text-white text-center overflow-hidden border-b border-[#004776]">
          <DotPattern
            width={16}
            height={16}
            cr={1}
            className="text-white/20 [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]"
          />
          <div className="relative z-10">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-amber-300 shadow-lg mb-4 border border-white/20">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Cổng xác thực Quản trị viên
            </h2>
            <p className="text-sm text-blue-200 font-medium mt-1">
              Hệ thống Vị trí việc làm HCM-UTE
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label htmlFor="admin-auth-pass" className="block text-sm font-bold text-[#004776]">
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
                className="w-full pl-11 pr-4 py-3 text-sm bg-[#f8fafc] border border-[#cbd5e1] rounded-xl focus:ring-2 focus:ring-[#006cee] focus:outline-none text-[#004776] font-bold"
              />
              <KeyRound className="w-4 h-4 text-[#20446c] absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
            {error && (
              <p className="flex items-center gap-2 text-sm text-red-600 font-bold pt-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            <Button
              type="submit"
              variant="default"
              size="lg"
              disabled={isVerifying}
              className="w-full"
            >
              <Unlock className="w-5 h-5" />
              <span>{isVerifying ? 'Đang kiểm tra...' : 'Đăng nhập Quản trị viên'}</span>
            </Button>

            <Link
              href="/bang-tinh"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-bold text-[#20446c] hover:text-[#004776] hover:bg-[#e1edf8] rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Bảng tính 15 biểu</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
