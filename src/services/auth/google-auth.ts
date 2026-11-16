'use client';

import {
  OperatorSession,
  normalizeEmail,
  saveCurrentOperatorSession,
  clearCurrentOperatorSession,
  getCurrentOperatorSession
} from '@/services/telemetry/operator-session';

export interface GoogleLoginCheckResult {
  ok: boolean;
  reason?: 'PROVIDER_DISABLED' | 'MISSING_CONFIG' | 'NETWORK_ERROR';
  message?: string;
}

/**
 * Khởi chạy đăng nhập Google OAuth 2.0 trực tiếp qua API máy chủ Next.js (/api/auth/google)
 */
export async function startGoogleOAuthLogin(redirectPath = '/bang-tinh'): Promise<GoogleLoginCheckResult> {
  if (typeof window === 'undefined') {
    return { ok: false, reason: 'MISSING_CONFIG', message: 'Không thể đăng nhập ngoài trình duyệt.' };
  }

  try {
    const query = `redirect=${encodeURIComponent(redirectPath)}&origin=${encodeURIComponent(window.location.origin)}`;
    const res = await fetch(`/api/auth/google?${query}`, { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));

    if (res.ok && data.ok && data.authorizeUrl) {
      window.location.href = data.authorizeUrl;
      return { ok: true };
    }

    return {
      ok: false,
      reason: data.reason || 'NETWORK_ERROR',
      message: data.message || 'Không thể khởi tạo phiên đăng nhập Google từ máy chủ.'
    };
  } catch {
    return {
      ok: false,
      reason: 'NETWORK_ERROR',
      message: 'Lỗi kết nối đến máy chủ xác thực (/api/auth/google).'
    };
  }
}

/**
 * Xử lý JWT đã ký trả về từ máy chủ (/api/auth/google/callback#access_token=...)
 */
export function consumeGoogleOAuthCallback(defaultUnitCode = 'FIT'): OperatorSession | null {
  if (typeof window === 'undefined') return null;
  const rawHash = window.location.hash;
  if (!rawHash) return null;

  const params = new URLSearchParams(rawHash.slice(1));
  const authError = params.get('auth_error');
  if (authError) {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    if (typeof window.alert === 'function') {
      window.alert(authError);
    }
    return null;
  }

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
    const isSameEmail = existing && existing.email === email;
    const isTcnsAdmin = email === 'tcns@hcmute.edu.vn' || payload.role === 'admin';

    const hasSelectedUnit =
      payload.has_selected_unit !== undefined
        ? Boolean(payload.has_selected_unit)
        : isTcnsAdmin
          ? true
          : isSameEmail
            ? Boolean(existing.hasSelectedUnit)
            : false;

    const unitCode = payload.unit_code || (isTcnsAdmin ? 'TCNS' : isSameEmail && existing.hasSelectedUnit ? existing.unitCode : defaultUnitCode);
    const title = isTcnsAdmin ? (existing?.title || 'Trưởng phòng') : isSameEmail ? existing.title : 'Chuyên viên';

    const displayName = payload.name || email.split('@')[0];
    const avatarUrl = payload.picture || '';

    const session = saveCurrentOperatorSession(email, unitCode, title, {
      displayName,
      avatarUrl,
      authProvider: 'google',
      accessToken: token,
      role: payload.role || (isTcnsAdmin ? 'admin' : existing?.role || 'editor'),
      hasSelectedUnit
    });

    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    return session;
  } catch {
    return null;
  }
}

export function signOutGoogleSession(): void {
  clearCurrentOperatorSession();
  if (typeof window !== 'undefined') {
    fetch('/api/admin/auth', { method: 'DELETE' }).catch(() => {});
  }
}
