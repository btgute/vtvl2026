'use client';

import {
  OperatorSession,
  normalizeEmail,
  saveCurrentOperatorSession,
  clearCurrentOperatorSession,
  getCurrentOperatorSession
} from '@/services/telemetry/operator-session';

const SUPABASE_URL = (
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qhjodwlvwzlaasvpkhkr.supabase.co'
).trim();

const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

export interface GoogleLoginCheckResult {
  ok: boolean;
  reason?: 'PROVIDER_DISABLED' | 'MISSING_CONFIG' | 'NETWORK_ERROR';
  message?: string;
}

/**
 * Kiểm tra xem Google OAuth đã được bật trên Supabase hay chưa trước khi chuyển hướng
 */
export async function startGoogleOAuthLogin(redirectPath = '/bang-tinh'): Promise<GoogleLoginCheckResult> {
  if (typeof window === 'undefined' || !SUPABASE_URL) {
    return { ok: false, reason: 'MISSING_CONFIG', message: 'Chưa cấu hình máy chủ xác thực Supabase.' };
  }

  try {
    if (SUPABASE_ANON_KEY) {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
        headers: { apikey: SUPABASE_ANON_KEY },
        cache: 'no-store'
      });
      if (res.ok) {
        const settings = await res.json();
        if (settings?.external?.google === false) {
          return {
            ok: false,
            reason: 'PROVIDER_DISABLED',
            message: 'Nhà cung cấp Google OAuth chưa được bật trên Supabase Dashboard. Vui lòng bật tại Authentication → Providers → Google hoặc đăng nhập bằng email công vụ bên dưới.'
          };
        }
      }
    }
  } catch {
    // Nếu không kiểm tra trước được, vẫn cho phép chuyển hướng OAuth
  }

  const targetUrl = `${window.location.origin}${redirectPath}`;
  const authorizeUrl =
    `${SUPABASE_URL}/auth/v1/authorize?provider=google` +
    `&redirect_to=${encodeURIComponent(targetUrl)}` +
    `&query_params=${encodeURIComponent('hd=hcmute.edu.vn&prompt=select_account')}`;

  window.location.href = authorizeUrl;
  return { ok: true };
}

/**
 * Xử lý token trả về từ Google OAuth (#access_token=...) và đồng bộ vào OperatorSession
 */
export function consumeGoogleOAuthCallback(defaultUnitCode = 'TCNS'): OperatorSession | null {
  if (typeof window === 'undefined') return null;
  const rawHash = window.location.hash;
  if (!rawHash || !rawHash.includes('access_token=')) return null;

  const params = new URLSearchParams(rawHash.slice(1));
  const accessToken = params.get('access_token');
  if (!accessToken) return null;

  try {
    const parts = accessToken.split('.');
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    );
    const payload = JSON.parse(jsonStr);

    const email = normalizeEmail(payload.email || '');
    if (!email) return null;

    const existing = getCurrentOperatorSession();
    const unitCode = existing?.unitCode || defaultUnitCode;
    const title = existing?.title || 'Chuyên viên';
    const displayName =
      payload.user_metadata?.full_name ||
      payload.user_metadata?.name ||
      payload.name ||
      email.split('@')[0];
    const avatarUrl = payload.user_metadata?.avatar_url || payload.user_metadata?.picture || '';

    const session = saveCurrentOperatorSession(email, unitCode, title, {
      displayName,
      avatarUrl,
      authProvider: 'google',
      accessToken
    });

    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    return session;
  } catch {
    return null;
  }
}

export function signOutGoogleSession(): void {
  clearCurrentOperatorSession();
}
