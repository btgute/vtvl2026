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
const GOOGLE_CLIENT_ID = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '').trim();

export interface GoogleLoginCheckResult {
  ok: boolean;
  reason?: 'PROVIDER_DISABLED' | 'MISSING_CONFIG' | 'NETWORK_ERROR';
  message?: string;
}

/**
 * Khởi chạy đăng nhập Google OAuth: ưu tiên qua Supabase Auth, dự phòng trực tiếp bằng NEXT_PUBLIC_GOOGLE_CLIENT_ID
 */
export async function startGoogleOAuthLogin(redirectPath = '/bang-tinh'): Promise<GoogleLoginCheckResult> {
  if (typeof window === 'undefined') {
    return { ok: false, reason: 'MISSING_CONFIG', message: 'Không thể đăng nhập ngoài trình duyệt.' };
  }

  const targetUrl = `${window.location.origin}${redirectPath}`;
  let useDirectGoogleOAuth = false;

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
        headers: { apikey: SUPABASE_ANON_KEY },
        cache: 'no-store'
      });
      if (res.ok) {
        const settings = await res.json();
        if (settings?.external?.google === false) {
          if (GOOGLE_CLIENT_ID) {
            useDirectGoogleOAuth = true;
          } else {
            return {
              ok: false,
              reason: 'PROVIDER_DISABLED',
              message:
                'Chưa bật Google OAuth trên Supabase Dashboard và chưa có NEXT_PUBLIC_GOOGLE_CLIENT_ID trong .env.'
            };
          }
        }
      }
    } catch {
      // Bỏ qua nếu không kiểm tra trước được; fallback bên dưới
    }
  } else if (GOOGLE_CLIENT_ID) {
    useDirectGoogleOAuth = true;
  } else if (!SUPABASE_URL) {
    return { ok: false, reason: 'MISSING_CONFIG', message: 'Chưa cấu hình Supabase hoặc Google Client ID.' };
  }

  if (useDirectGoogleOAuth && GOOGLE_CLIENT_ID) {
    const nonce =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const directUrl =
      'https://accounts.google.com/o/oauth2/v2/auth' +
      `?client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(targetUrl)}` +
      '&response_type=id_token' +
      '&scope=openid%20email%20profile' +
      '&hd=hcmute.edu.vn' +
      '&prompt=select_account' +
      `&nonce=${encodeURIComponent(nonce)}`;
    window.location.href = directUrl;
    return { ok: true };
  }

  const authorizeUrl =
    `${SUPABASE_URL}/auth/v1/authorize?provider=google` +
    `&redirect_to=${encodeURIComponent(targetUrl)}` +
    `&query_params=${encodeURIComponent('hd=hcmute.edu.vn&prompt=select_account')}`;

  window.location.href = authorizeUrl;
  return { ok: true };
}

/**
 * Xử lý token trả về từ Supabase (#access_token=...) hoặc Google OAuth (#id_token=...)
 */
export function consumeGoogleOAuthCallback(defaultUnitCode = 'TCNS'): OperatorSession | null {
  if (typeof window === 'undefined') return null;
  const rawHash = window.location.hash;
  if (!rawHash || (!rawHash.includes('access_token=') && !rawHash.includes('id_token='))) {
    return null;
  }

  const params = new URLSearchParams(rawHash.slice(1));
  const token = params.get('access_token') || params.get('id_token');
  if (!token) return null;

  try {
    const parts = token.split('.');
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
    const avatarUrl =
      payload.user_metadata?.avatar_url ||
      payload.user_metadata?.picture ||
      payload.picture ||
      '';

    const session = saveCurrentOperatorSession(email, unitCode, title, {
      displayName,
      avatarUrl,
      authProvider: 'google',
      accessToken: token
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

