import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();

  const publicOrigin = (
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    request.nextUrl.origin
  ).replace(/\/+$/, '');
  const callbackUri = `${publicOrigin}/api/auth/callback/google`;

  if (!clientId || !clientSecret) {
    return NextResponse.json({
      ok: false,
      reason: 'MISSING_CONFIG',
      callbackUri,
      message: `Chưa cấu hình GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET trên máy chủ. Vui lòng khai báo trong tệp .env và đăng ký Redirect URI: ${callbackUri}`
    });
  }

  return NextResponse.json({ ok: true, provider: 'nextauth-google', callbackUri });
}
