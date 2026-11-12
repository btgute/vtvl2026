'use client';

import { normalizeEmail, saveCurrentOperatorSession } from '@/services/telemetry/operator-session';
import { findHcmuteUnit } from '@/configs/hcmute-units';

export interface GoogleAuthProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  unitCode: string;
  unitNameVi: string;
  roleLabel: string;
  provider: 'google' | 'hcmute-sso';
  accessToken?: string;
  expiresAt?: number;
}

const GOOGLE_AUTH_STORAGE_KEY = 'hcmute_vtvl_google_user_v1';
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qhjodwlvwzlaasvpkhkr.supabase.co').trim();
const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

export function getStoredUserProfile(): GoogleAuthProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(GOOGLE_AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveUserProfile(profile: GoogleAuthProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GOOGLE_AUTH_STORAGE_KEY, JSON.stringify(profile));
    saveCurrentOperatorSession(profile.email, profile.unitCode, profile.roleLabel);
    window.dispatchEvent(new CustomEvent('vtvl-auth-state-changed', { detail: profile }));
  } catch { /* ignore */ }
}

export function logoutUserProfile(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(GOOGLE_AUTH_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('vtvl-auth-state-changed', { detail: null }));
  } catch { /* ignore */ }
}

export function initiateGoogleOAuth(redirectPath: string = '/bang-tinh'): void {
  if (typeof window === 'undefined') return;
  const redirectUrl = `${window.location.origin}${redirectPath}`;
  const oauthEndpoint = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
  window.location.href = oauthEndpoint;
}

export function loginWithHcmuteIdentity(params: {
  email: string;
  unitCode: string;
  roleLabel?: string;
  displayName?: string;
  avatarUrl?: string;
}): GoogleAuthProfile {
  const normEmail = normalizeEmail(params.email);
  const unit = findHcmuteUnit(params.unitCode || 'TCNS');
  const fallbackName = params.displayName || normEmail.split('@')[0].toUpperCase();

  const profile: GoogleAuthProfile = {
    id: `ute_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    email: normEmail,
    displayName: fallbackName,
    avatarUrl: params.avatarUrl || '',
    unitCode: unit.code,
    unitNameVi: unit.nameVi,
    roleLabel: params.roleLabel || 'Chuyên viên phụ trách',
    provider: 'google'
  };

  saveUserProfile(profile);
  return profile;
}

export function checkAndHandleOAuthCallback(): GoogleAuthProfile | null {
  if (typeof window === 'undefined') return null;

  const hash = window.location.hash.substring(1);
  if (!hash || !hash.includes('access_token')) return null;

  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  const tokenType = params.get('token_type');

  if (accessToken) {
    try {
      const parts = accessToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        const email = normalizeEmail(payload.email || '');
        const unit = findHcmuteUnit('TCNS');
        const profile: GoogleAuthProfile = {
          id: payload.sub || `g_${Date.now()}`,
          email: email || 'giangvien@hcmute.edu.vn',
          displayName: payload.user_metadata?.full_name || payload.name || email.split('@')[0],
          avatarUrl: payload.user_metadata?.avatar_url || payload.picture || '',
          unitCode: unit.code,
          unitNameVi: unit.nameVi,
          roleLabel: 'Chuyên viên phụ trách',
          provider: 'google',
          accessToken
        };
        saveUserProfile(profile);
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        return profile;
      }
    } catch { /* ignore */ }
  }
  return null;
}

