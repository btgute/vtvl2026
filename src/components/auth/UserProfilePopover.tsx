'use client';

import React, { useState, useEffect } from 'react';
import { Building2, ChevronDown, LogOut, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from '@/components/ui/Popover';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  OperatorSession,
  getCurrentOperatorSession
} from '@/services/telemetry/operator-session';
import {
  consumeGoogleOAuthCallback,
  startGoogleOAuthLogin,
  signOutGoogleSession
} from '@/services/auth/google-auth';

function GoogleLogoSvg({ className = 'w-4 h-4 shrink-0' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
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
  );
}

export function UserProfilePopover() {
  const [session, setSession] = useState<OperatorSession | null>(null);
  const [googleMsg, setGoogleMsg] = useState<string | null>(null);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  useEffect(() => {
    const callbackSession = consumeGoogleOAuthCallback();
    setSession(callbackSession || getCurrentOperatorSession());

    const handleSessionChange = () => {
      setSession(getCurrentOperatorSession());
      setGoogleMsg(null);
    };

    window.addEventListener('vtvl-operator-changed', handleSessionChange);
    return () => window.removeEventListener('vtvl-operator-changed', handleSessionChange);
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true);
    setGoogleMsg(null);
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/bang-tinh';
    const res = await startGoogleOAuthLogin(currentPath);
    if (!res.ok) {
      setGoogleMsg(res.message || 'Không thể kết nối Google OAuth.');
      setIsLoadingGoogle(false);
    }
  };

  const handleOpenSwitchModal = () => {
    window.dispatchEvent(new CustomEvent('vtvl-open-session-modal'));
  };

  if (!session) {
    return (
      <Popover>
        <PopoverTrigger>
          <span className="inline-flex items-center gap-2 h-10 px-3.5 rounded-xl border border-[#d8e3ef] bg-white hover:border-[#006cee] hover:bg-[#f5f9ff] text-sm font-semibold text-[#004776] shadow-2xs transition-all">
            <GoogleLogoSvg className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Đăng nhập Google</span>
          </span>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-80 p-4 space-y-3">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#004776]">Đăng nhập tài khoản HCM-UTE</h4>
            <p className="text-xs font-medium text-[#476885] leading-relaxed">
              Sử dụng tài khoản Google công vụ @hcmute.edu.vn để đồng bộ hồ sơ an toàn trên Supabase.
            </p>
          </div>

          <Button
            variant="outline"
            size="default"
            onClick={handleGoogleLogin}
            disabled={isLoadingGoogle}
            className="w-full justify-center font-bold border-[#cbd5e1] hover:border-[#006cee]"
          >
            <GoogleLogoSvg />
            <span>{isLoadingGoogle ? 'Đang kết nối Google…' : 'Tiếp tục với Google'}</span>
          </Button>

          {googleMsg && (
            <div className="p-2.5 rounded-xl bg-[#fdf2e1] border border-[#fbd39a] text-xs font-medium text-[#8f4f00] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{googleMsg}</span>
            </div>
          )}

          <div className="pt-2 border-t border-[#e8eff7]">
            <PopoverClose onClick={handleOpenSwitchModal}>
              <span className="w-full inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg bg-[#e1edf8] hover:bg-[#d0e4f5] text-xs font-bold text-[#004776] transition-colors">
                <Building2 className="w-3.5 h-3.5 text-[#006cee]" />
                <span>Hoặc khai báo phiên đơn vị</span>
              </span>
            </PopoverClose>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  const label = session.displayName || session.email.split('@')[0];
  const initials = label.slice(0, 2).toUpperCase();

  return (
    <Popover>
      <PopoverTrigger>
        <span className="inline-flex items-center gap-2.5 h-10 pl-1.5 pr-3 rounded-full border border-[#d8e3ef] bg-white hover:border-[#006cee] hover:bg-[#f5f9ff] transition-all shadow-2xs">
          {session.avatarUrl ? (
            <img
              src={session.avatarUrl}
              alt={label}
              className="w-7 h-7 rounded-full object-cover shrink-0"
            />
          ) : (
            <span className="w-7 h-7 rounded-full bg-[#006cee] text-white text-xs font-bold inline-flex items-center justify-center shrink-0">
              {initials}
            </span>
          )}
          <span className="hidden md:flex flex-col text-left leading-tight">
            <span className="text-[13px] font-bold text-[#004776] max-w-[130px] truncate">
              {label}
            </span>
            <span className="text-[11px] font-semibold text-[#006cee]">
              [{session.unitCode}]
            </span>
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-[#476885] shrink-0" />
        </span>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-4 space-y-3">
        <div className="flex items-center gap-3 pb-3 border-b border-[#e8eff7]">
          {session.avatarUrl ? (
            <img
              src={session.avatarUrl}
              alt={label}
              className="w-11 h-11 rounded-full object-cover shrink-0 border border-[#d8e3ef]"
            />
          ) : (
            <span className="w-11 h-11 rounded-full bg-[#004776] text-white text-sm font-bold inline-flex items-center justify-center shrink-0">
              {initials}
            </span>
          )}
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="text-sm font-bold text-[#004776] truncate">{label}</div>
            <div className="text-xs font-medium text-[#476885] truncate">{session.email}</div>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <Badge variant="secondary" className="text-[11px] px-2 py-0.5">
                {session.title || 'Chuyên viên'}
              </Badge>
              {session.authProvider === 'google' && (
                <Badge variant="success" className="text-[11px] px-2 py-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Google</span>
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#f5f9ff] border border-[#d8e3ef] space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#004776]">
            <Building2 className="w-3.5 h-3.5 text-[#006cee]" />
            <span>Đơn vị [{session.unitCode}]</span>
          </div>
          <p className="text-xs font-medium text-[#20446c] leading-snug pl-5">
            {session.unitNameVi}
          </p>
        </div>

        <div className="space-y-1.5 pt-1">
          {session.authProvider !== 'google' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoogleLogin}
              disabled={isLoadingGoogle}
              className="w-full justify-start font-semibold"
            >
              <GoogleLogoSvg className="w-3.5 h-3.5" />
              <span>Liên kết tài khoản Google</span>
            </Button>
          )}

          {googleMsg && (
            <div className="p-2 rounded-lg bg-[#fdf2e1] border border-[#fbd39a] text-[11px] font-medium text-[#8f4f00]">
              {googleMsg}
            </div>
          )}

          <PopoverClose onClick={handleOpenSwitchModal}>
            <span className="w-full inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-[#d8e3ef] bg-white hover:bg-[#f5f9ff] text-xs font-semibold text-[#004776] transition-colors">
              <RefreshCw className="w-3.5 h-3.5 text-[#006cee]" />
              <span>Đổi đơn vị hoặc chức danh</span>
            </span>
          </PopoverClose>

          <PopoverClose onClick={signOutGoogleSession}>
            <span className="w-full inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-[#fdeceb] hover:bg-[#fbd5d3] text-xs font-bold text-[#b42318] transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </span>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}
