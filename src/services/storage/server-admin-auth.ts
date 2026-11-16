import { cookies } from 'next/headers';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/services/auth/auth-options';
import { getUserAccountByEmail, syncAccountsFromPostgres } from './server-account-store';
import { normalizeEmail } from './server-workbook-store';

export const ADMIN_COOKIE_NAME = 'hcmute_vtvl_admin_token_v2';

const ADMIN_PASSWORD_HASH = '0a5de87db3d6c7d52645c1581269a880b1bbc613abc8e4c8e0f51c99753f8909';
const SERVER_AUTH_SECRET =
  process.env.NEXTAUTH_SECRET ||
  process.env.ADMIN_SERVER_SECRET ||
  'hcmute_vtvl_admin_jwt_secret_2026_super_secure';

export interface AdminSessionPayload {
  role: 'admin';
  authenticatedAt: string;
  expiresAt: number;
}

function hmacSign(input: string): string {
  return crypto.createHmac('sha256', SERVER_AUTH_SECRET).update(input).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

export function hashStringSha256(val: string): string {
  return crypto.createHash('sha256').update(val).digest('hex');
}

export function verifyAdminPassword(password: string): boolean {
  if (!password) return false;
  return hashStringSha256(password.trim()) === ADMIN_PASSWORD_HASH;
}

export function generateAdminToken(): string {
  const payload: AdminSessionPayload = {
    role: 'admin',
    authenticatedAt: new Date().toISOString(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${hmacSign(body)}`;
}

export function verifyAdminToken(token: string): AdminSessionPayload | null {
  if (!token || !token.includes('.')) return null;
  const [body, signature] = token.split('.');
  if (!body || !signature || !safeEqual(signature, hmacSign(body))) return null;

  try {
    const payload: AdminSessionPayload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.role !== 'admin' || Date.now() > payload.expiresAt) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getVerifiedNextAuthEmail(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);
    const email = normalizeEmail(session?.user?.email || '');
    return email || null;
  } catch {
    return null;
  }
}

export async function isVerifiedAdminAccount(email?: string | null, _accessToken?: string | null): Promise<boolean> {
  const verifiedEmail = await getVerifiedNextAuthEmail();
  if (!verifiedEmail) return false;
  if (email && normalizeEmail(email) !== verifiedEmail) return false;

  await syncAccountsFromPostgres();
  const acc = getUserAccountByEmail(verifiedEmail);
  return Boolean(acc && acc.role === 'admin' && acc.status === 'active');
}

export async function getServerAdminAuth(reqEmail?: string, accessToken?: string | null): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (token && verifyAdminToken(token) !== null) return true;
  } catch { /* ignore */ }

  return isVerifiedAdminAccount(reqEmail, accessToken);
}

export async function setServerAdminCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60
  });
}

export async function clearServerAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
