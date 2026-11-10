import { cookies } from 'next/headers';
import crypto from 'crypto';

const ADMIN_COOKIE_NAME = 'hcmute_vtvl_admin_token_v2';
const ADMIN_PASSWORD_HASH = '0a5de87db3d6c7d52645c1581269a880b1bbc613abc8e4c8e0f51c99753f8909'; // SHA-256 của Hcmute@2026*#
const SERVER_AUTH_SECRET = process.env.ADMIN_SERVER_SECRET || 'hcmute_vtvl_admin_jwt_secret_2026_super_secure';

export interface AdminSessionPayload {
  role: 'admin';
  authenticatedAt: string;
  expiresAt: number;
}

export function hashStringSha256(val: string): string {
  return crypto.createHash('sha256').update(val).digest('hex');
}

export function verifyAdminPassword(password: string): boolean {
  if (!password) return false;
  const hash = hashStringSha256(password.trim());
  return hash === ADMIN_PASSWORD_HASH;
}

export function generateAdminToken(): string {
  const payload: AdminSessionPayload = {
    role: 'admin',
    authenticatedAt: new Date().toISOString(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 giờ
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SERVER_AUTH_SECRET).update(body).digest('base64url');
  return `${body}.${signature}`;
}

export function verifyAdminToken(token: string): AdminSessionPayload | null {
  if (!token || !token.includes('.')) return null;
  const [body, signature] = token.split('.');
  const expectedSig = crypto.createHmac('sha256', SERVER_AUTH_SECRET).update(body).digest('base64url');
  if (signature !== expectedSig) return null;

  try {
    const payload: AdminSessionPayload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.role !== 'admin' || Date.now() > payload.expiresAt) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getServerAdminAuth(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return false;
    return verifyAdminToken(token) !== null;
  } catch {
    return false;
  }
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
