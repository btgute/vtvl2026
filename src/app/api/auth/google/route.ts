import { NextRequest, NextResponse } from 'next/server';
import { OAUTH_STATE_COOKIE, signOAuthState } from '@/services/storage/server-admin-auth';

function resolvePublicOrigin(request: NextRequest): string {
  const envOrigin = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/+$/, '');
  if (envOrigin) return envOrigin;

  const fwdProto = (request.headers.get('x-forwarded-proto') || '').split(',')[0].trim();
  const fwdHost = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '').split(',')[0].trim();
  if (fwdHost && !fwdHost.startsWith('127.0.0.1') && !fwdHost.startsWith('localhost')) {
    return `${fwdProto || 'https'}://${fwdHost}`;
  }

  return (request.nextUrl.searchParams.get('origin') || request.nextUrl.origin).replace(/\/+$/, '');
}

export async function GET(request: NextRequest) {
  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();

  const publicOrigin = resolvePublicOrigin(request);
  const callbackUri = `${publicOrigin}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.json({
      ok: false,
      reason: 'MISSING_CONFIG',
      message: `Chưa cấu hình GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET trên máy chủ. Vui lòng khai báo trong tệp .env và đăng ký Redirect URI: ${callbackUri}`
    });
  }

  const redirectParam = request.nextUrl.searchParams.get('redirect') || '/bang-tinh';
  const safePath = redirectParam.startsWith('/') ? redirectParam : '/bang-tinh';
  const state = signOAuthState(safePath, publicOrigin);

  const allowedHd = (process.env.GOOGLE_ALLOWED_HD ?? 'hcmute.edu.vn').trim();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUri,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
    access_type: 'online',
    state
  });
  if (allowedHd && allowedHd !== '*') {
    params.set('hd', allowedHd);
  }

  const authorizeUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  const res = NextResponse.json({ ok: true, authorizeUrl });

  res.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: publicOrigin.startsWith('https://'),
    sameSite: 'lax',
    path: '/',
    maxAge: 600
  });

  return res;
}
