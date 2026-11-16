import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  OAUTH_STATE_COOKIE,
  USER_COOKIE_NAME,
  generateAdminToken,
  signUserAccessToken,
  verifyOAuthState
} from '@/services/storage/server-admin-auth';
import {
  getUserAccountByEmail,
  syncAccountsFromPostgres,
  upsertUserAccount
} from '@/services/storage/server-account-store';
import { appendAuditLog } from '@/services/storage/server-audit-store';
import { normalizeEmail } from '@/services/storage/server-workbook-store';

function buildErrorRedirect(origin: string, path: string, msg: string): NextResponse {
  const res = NextResponse.redirect(`${origin}${path}#auth_error=${encodeURIComponent(msg)}`);
  res.cookies.delete(OAUTH_STATE_COOKIE);
  return res;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const stateParam = request.nextUrl.searchParams.get('state');
  const oauthErr = request.nextUrl.searchParams.get('error');

  const verifiedState = verifyOAuthState(stateParam);
  const fallbackOrigin = (process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin).replace(/\/+$/, '');
  const origin = verifiedState?.origin || fallbackOrigin;
  const redirectPath = verifiedState?.redirectPath || '/bang-tinh';

  if (oauthErr) {
    return buildErrorRedirect(origin, redirectPath, 'Đã hủy hoặc từ chối phiên đăng nhập Google.');
  }

  const cookieState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  if (!code || !verifiedState || (cookieState && cookieState !== stateParam)) {
    return buildErrorRedirect(origin, redirectPath, 'Phiên xác thực OAuth không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.');
  }

  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
  if (!clientId || !clientSecret) {
    return buildErrorRedirect(origin, redirectPath, 'Máy chủ chưa cấu hình khóa Google OAuth.');
  }

  try {
    const callbackUri = `${origin}/api/auth/google/callback`;
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUri,
        grant_type: 'authorization_code'
      }),
      cache: 'no-store'
    });

    const tokenJson = await tokenRes.json().catch(() => ({}));
    if (!tokenRes.ok || !tokenJson.access_token) {
      return buildErrorRedirect(origin, redirectPath, 'Không thể trao đổi mã xác thực với Google OAuth.');
    }

    const profileRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
      cache: 'no-store'
    });
    const profile = await profileRes.json().catch(() => ({}));
    const rawEmail = String(profile.email || '').trim().toLowerCase();

    if (!profileRes.ok || !rawEmail || profile.email_verified === false) {
      return buildErrorRedirect(origin, redirectPath, 'Tài khoản Google chưa xác minh địa chỉ email.');
    }

    await syncAccountsFromPostgres();
    const normEmail = normalizeEmail(rawEmail);
    const existingAcc = getUserAccountByEmail(normEmail);

    const allowedDomains = (process.env.GOOGLE_ALLOWED_HD ?? 'hcmute.edu.vn')
      .split(',')
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean);

    const domainPart = rawEmail.split('@')[1] || '';
    const isDomainAllowed =
      allowedDomains.length === 0 ||
      allowedDomains.includes('*') ||
      allowedDomains.includes(domainPart);

    if (!isDomainAllowed && !existingAcc) {
      return buildErrorRedirect(
        origin,
        redirectPath,
        `Tài khoản ${rawEmail} không thuộc tên miền công vụ @${allowedDomains.join(', @')} và chưa được cấp quyền trước.`
      );
    }

    if (existingAcc?.status === 'suspended') {
      return buildErrorRedirect(origin, redirectPath, 'Tài khoản của bạn hiện đang bị tạm khóa.');
    }

    const account = upsertUserAccount({
      email: normEmail,
      displayName: profile.name || existingAcc?.displayName || normEmail.split('@')[0],
      avatarUrl: profile.picture || existingAcc?.avatarUrl,
      authProvider: 'google',
      unitCode: existingAcc?.unitCode || (normEmail === 'tcns@hcmute.edu.vn' ? 'TCNS' : 'FIT'),
      title: existingAcc?.title,
      hasSelectedUnit: existingAcc?.hasSelectedUnit ?? (normEmail === 'tcns@hcmute.edu.vn')
    });

    appendAuditLog({
      unitCode: account.unitCode,
      unitName: account.unitNameVi,
      action: 'GOOGLE_OAUTH_LOGIN',
      details: `Đăng nhập thành công qua Google OAuth 2.0 (${account.role})`,
      actorEmail: account.email,
      actorRole: account.title
    });

    const jwt = signUserAccessToken({
      email: account.email,
      name: account.displayName,
      picture: account.avatarUrl,
      role: account.role,
      unitCode: account.unitCode,
      hasSelectedUnit: account.hasSelectedUnit
    });

    const isSecure = origin.startsWith('https://');
    const res = NextResponse.redirect(`${origin}${redirectPath}#access_token=${jwt}`);
    res.cookies.delete(OAUTH_STATE_COOKIE);
    res.cookies.set(USER_COOKIE_NAME, jwt, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    });

    if (account.role === 'admin') {
      res.cookies.set(ADMIN_COOKIE_NAME, generateAdminToken(), {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60
      });
    }

    return res;
  } catch (err) {
    console.error('[Google OAuth Callback Error]', err);
    return buildErrorRedirect(origin, redirectPath, 'Lỗi máy chủ khi xử lý đăng nhập Google OAuth.');
  }
}
