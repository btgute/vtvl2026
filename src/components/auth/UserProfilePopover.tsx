'use client';

import React, { useState, useEffect } from 'react';
import { Building2, ChevronDown, LogOut, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from '@/components/ui/Popover';
import { Badge } from '@/components/ui/Badge';
import { GoogleLogoSvg, GoogleOAuthButton } from '@/components/auth/GoogleOAuthButton';
import {
  OperatorSession,
  getCurrentOperatorSession
} from '@/services/telemetry/operator-session';
import {
  consumeGoogleOAuthCallback,
  signOutGoogleSession
} from '@/services/auth/google-auth';

export function UserProfilePopover() {
  const [session, setSession] = useState<OperatorSession | null>(null);

  useEffect(() => {
    const callbackSession = consumeGoogleOAuthCallback();
    setSession(callbackSession || getCurrentOperatorSession());

    const handleSessionChange = () => {
      setSession(getCurrentOperatorSession());
    };

    window.addEventListener('vtvl-operator-changed', handleSessionChange);
    return () => window.removeEventListener('vtvl-operator-changed', handleSessionChange);
  }, []);

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/bang-tinh';

  const handleOpenSwitchModal = () => {
    window.dispatchEvent(new CustomEvent('vtvl-open-session-modal'));
  };

  if (!session) {
    return (
      <Popover>
        <PopoverTrigger>
          <span className="inline-flex items-center gap-2 h-10 px-3.5 rounded-xl border border-[#d8e3ef] bg-white hover:border-[#006cee] hover:bg-[#f5f9ff] text-sm font-semibold text-[#004776] shadow-2xs transition-all">
            <GoogleLogoSvg className="w-4 h-4" />
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

          <GoogleOAuthButton
            label="Tiếp tục với Google"
            loadingLabel="Đang kết nối Google…"
            redirectPath={currentPath}
            size="default"
            className="w-full justify-center font-bold border-[#cbd5e1] hover:border-[#006cee]"
          />

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
            <GoogleOAuthButton
              label="Liên kết tài khoản Google"
              loadingLabel="Đang kết nối Google…"
              redirectPath={currentPath}
              size="sm"
              className="w-full justify-start font-semibold"
            />
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
