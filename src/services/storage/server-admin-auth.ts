import { cookies } from 'next/headers';
import crypto from 'crypto';
import { getUserAccountByEmail, syncAccountsFromPostgres } from './server-account-store';
import { normalizeEmail } from './server-workbook-store';

export const ADMIN_COOKIE_NAME = 'hcmute_vtvl_admin_token_v2';
export const USER_COOKIE_NAME = 'hcmute_vtvl_user_token_v1';
export const OAUTH_STATE_COOKIE = 'hcmute_vtvl_oauth_state_v1';

const ADMIN_PASSWORD_HASH = '0a5de87db3d6c7d52645c1581269a880b1bbc613abc8e4c8e0f51c99753f8909';
const SERVER_AUTH_SECRET = process.env.ADMIN_SERVER_SECRET || 'hcmute_vtvl_admin_jwt_secret_2026_super_secure';

export interface AdminSessionPayload {
  role: 'admin';
  authenticatedAt: string;
  expiresAt: number;
}

export interface UserJwtClaims {
  email: string;
  name?: string;
  picture?: string;
  role?: string;
  unit_code?: string;
  has_selected_unit?: boolean;
  iat: number;
  exp: number;
}

export interface OAuthStatePayload {
  redirectPath: string;
  origin: string;
  nonce: string;
  exp: number;
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

export function signUserAccessToken(input: {
  email: string;
  name?: string;
  picture?: string;
  role?: string;
  unitCode?: string;
  hasSelectedUnit?: boolean;
}): string {
  const nowSec = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      email: normalizeEmail(input.email),
      name: input.name,
      picture: input.picture,
      role: input.role || 'editor',
      unit_code: input.unitCode || 'FIT',
      has_selected_unit: Boolean(input.hasSelectedUnit),
      iat: nowSec,
      exp: nowSec + 7 * 24 * 60 * 60
    } satisfies UserJwtClaims)
  ).toString('base64url');
  const signingInput = `${header}.${payload}`;
  return `${signingInput}.${hmacSign(signingInput)}`;
}

export function verifyUserAccessToken(token?: string | null): UserJwtClaims | null {
  if (!token) return null;
  const parts = token.trim().split('.');
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  const signingInput = `${header}.${payload}`;
  if (!safeEqual(signature, hmacSign(signingInput))) return null;

  try {
    const claims: UserJwtClaims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!claims.email || Math.floor(Date.now() / 1000) > claims.exp) return null;
    claims.email = normalizeEmail(claims.email);
    return claims;
  } catch {
    return null;
  }
}

export function signOAuthState(redirectPath: string, origin: string): string {
  const stateObj: OAuthStatePayload = {
    redirectPath: redirectPath.startsWith('/') ? redirectPath : '/bang-tinh',
    origin,
    nonce: crypto.randomBytes(16).toString('hex'),
    exp: Date.now() + 10 * 60 * 1000
  };
  const body = Buffer.from(JSON.stringify(stateObj)).toString('base64url');
  return `${body}.${hmacSign(body)}`;
}

export function verifyOAuthState(stateToken?: string | null): OAuthStatePayload | null {
  if (!stateToken || !stateToken.includes('.')) return null;
  const [body, sig] = stateToken.split('.');
  if (!body || !sig || !safeEqual(sig, hmacSign(body))) return null;
  try {
    const parsed: OAuthStatePayload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return Date.now() <= parsed.exp ? parsed : null;
  } catch {
    return null;
  }
}

export async function isVerifiedAdminAccount(email?: string | null, accessToken?: string | null): Promise<boolean> {
  if (!email) return false;
  let tokenToCheck = accessToken || null;
  if (!tokenToCheck) {
    try {
      const cookieStore = await cookies();
      tokenToCheck = cookieStore.get(USER_COOKIE_NAME)?.value || null;
    } catch { /* ignore */ }
  }
  const claims = verifyUserAccessToken(tokenToCheck);
  if (!claims || claims.email !== normalizeEmail(email)) return false;
  await syncAccountsFromPostgres();
  const acc = getUserAccountByEmail(claims.email);
  return Boolean(acc && acc.role === 'admin' && acc.status === 'active');
}

export async function getServerAdminAuth(reqEmail?: string, accessToken?: string | null): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (token && verifyAdminToken(token) !== null) return true;
  } catch { /* ignore */ }

  if (reqEmail) {
    return isVerifiedAdminAccount(reqEmail, accessToken);
  }
  return false;
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
  cookieStore.delete(USER_COOKIE_NAME);
}
