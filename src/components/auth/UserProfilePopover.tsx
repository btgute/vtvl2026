'use client';

import React, { useState, useEffect } from 'react';
import { User, LogOut, Building2, ChevronDown, ShieldCheck } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/Popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  getStoredUserProfile,
  logoutUserProfile,
  GoogleAuthProfile,
  checkAndHandleOAuthCallback
} from '@/services/auth/google-supabase-auth';
import { GoogleLoginModal } from './GoogleLoginModal';

export function UserProfilePopover() {
  const [profile, setProfile] = useState<GoogleAuthProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // Check if returning from Google OAuth redirect
    const oauthProfile = checkAndHandleOAuthCallback();
    if (oauthProfile) {
      setProfile(oauthProfile);
    } else {
      setProfile(getStoredUserProfile());
    }

    const onAuthChange = (e: Event) => {
      const customEvent = e as CustomEvent<GoogleAuthProfile | null>;
      setProfile(customEvent.detail || null);
    };

    window.addEventListener('vtvl-auth-state-changed', onAuthChange);
    return () => window.removeEventListener('vtvl-auth-state-changed', onAuthChange);
  }, []);

  const handleLogout = () => {
    logoutUserProfile();
  };

  if (!profile) {
    return (
      <>
        <Button
          variant="outline"
          size="default"
          onClick={() => setModalOpen(true)}
          className="border-[#cbd5e1] hover:border-[#006cee] font-bold text-sm text-[#004776] shadow-xs"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
          <span className="hidden sm:inline">Đăng nhập</span>
        </Button>
        <GoogleLoginModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  const initials = profile.displayName
    ? profile.displayName
        .split(' ')
        .map((p) => p[0])
        .slice(-2)
        .join('')
        .toUpperCase()
    : 'CB';

  return (
    <>
      <Popover>
        <PopoverTrigger className="flex items-center gap-2 p-1.5 rounded-full hover:bg-[#e1edf8] transition-colors border border-transparent hover:border-[#cbd5e1]">
          <Avatar className="h-8 w-8 ring-2 ring-[#006cee]/30">
            {profile.avatarUrl ? (
              <AvatarImage src={profile.avatarUrl} alt={profile.displayName} />
            ) : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-[#004776] leading-tight max-w-[120px] truncate">
              {profile.displayName}
            </span>
            <span className="text-[11px] font-medium text-[#20446c] leading-tight">
              {profile.unitCode}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#20446c]" />
        </PopoverTrigger>

        <PopoverContent align="end" className="w-72 p-4 space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b border-[#f1f5f9]">
            <Avatar className="h-11 w-11">
              {profile.avatarUrl ? (
                <AvatarImage src={profile.avatarUrl} alt={profile.displayName} />
              ) : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-[#004776] truncate">{profile.displayName}</h4>
              <p className="text-xs font-medium text-[#20446c] truncate">{profile.email}</p>
              <Badge variant="secondary" className="mt-1 text-[10px]">
                {profile.roleLabel}
              </Badge>
            </div>
          </div>

          <div className="rounded-xl bg-[#f8fafc] p-2.5 border border-[#e2e8f0] space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#004776]">
              <Building2 className="w-3.5 h-3.5 text-[#006cee]" />
              <span>Đơn vị:</span>
              <span className="font-bold text-[#006cee]">[{profile.unitCode}]</span>
            </div>
            <p className="text-[11px] font-medium text-[#20446c] leading-tight pl-5">
              {profile.unitNameVi}
            </p>
          </div>

          <div className="pt-1 flex flex-col gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(true)}
              className="w-full justify-start text-xs font-medium"
            >
              <Building2 className="w-3.5 h-3.5 mr-2 text-[#006cee]" />
              <span>Đổi đơn vị hoặc chức danh</span>
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-xs font-semibold"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              <span>Đăng xuất</span>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <GoogleLoginModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
