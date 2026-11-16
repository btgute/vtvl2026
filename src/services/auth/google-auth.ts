'use client';

import { signIn, signOut } from 'next-auth/react';
import {
  OperatorSession,
  clearCurrentOperatorSession,
  getCurrentOperatorSession
} from '@/services/telemetry/operator-session';

export interface GoogleLoginCheckResult {
  ok: boolean;
  reason?: 'PROVIDER_DISABLED' | 'MISSING_CONFIG' | 'NETWORK_ERROR';
  message?: string;
}

/**
 * Khởi chạy đăng nhập Google OAuth qua NextAuth (/api/auth/callback/google)
 */
export async function startGoogleOAuthLogin(redirectPath = '/bang-tinh'): Promise<GoogleLoginCheckResult> {
  if (typeof window === 'undefined') {
    return { ok: false, reason: 'MISSING_CONFIG', message: 'Không thể đăng nhập ngoài trình duyệt.' };
  }

  try {
    const checkRes = await fetch('/api/auth/google', { cache: 'no-store' });
    const checkData = await checkRes.json().catch(() => ({}));

    if (!checkRes.ok || !checkData.ok) {
      return {
        ok: false,
        reason: checkData.reason || 'MISSING_CONFIG',
        message: checkData.message || 'Máy chủ chưa cấu hình Google OAuth (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET).'
      };
    }

    const safeCallback = redirectPath.startsWith('/') ? redirectPath : '/bang-tinh';
    await signIn('google', { callbackUrl: safeCallback });
    return { ok: true };
  } catch {
    return {
      ok: false,
      reason: 'NETWORK_ERROR',
      message: 'Lỗi kết nối đến dịch vụ xác thực NextAuth (/api/auth).'
    };
  }
}

/**
 * Tương thích ngược cho các component đọc phiên đăng nhập hiện hành
 */
export function consumeGoogleOAuthCallback(): OperatorSession | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const authErr = params.get('error');
  if (authErr === 'AccessDenied') {
    const cleanUrl = window.location.pathname;
    window.history.replaceState(null, '', cleanUrl);
    if (typeof window.alert === 'function') {
      window.alert('Tài khoản Google không thuộc tên miền được phép (@hcmute.edu.vn) hoặc chưa được cấp quyền.');
    }
    return null;
  }
  return getCurrentOperatorSession();
}

export function signOutGoogleSession(): void {
  clearCurrentOperatorSession();
  if (typeof window !== 'undefined') {
    fetch('/api/admin/auth', { method: 'DELETE' }).catch(() => {});
    signOut({ redirect: false }).catch(() => {});
  }
}
