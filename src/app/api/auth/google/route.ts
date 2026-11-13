import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  ''
).trim();

const SUPABASE_KEY = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  ''
).trim();

export async function GET(request: NextRequest) {
  if (!SUPABASE_URL) {
    return NextResponse.json({
      ok: false,
      reason: 'MISSING_CONFIG',
      message: 'Chưa cấu hình NEXT_PUBLIC_SUPABASE_URL.'
    });
  }

  const { searchParams } = new URL(request.url);
  const redirectPath = searchParams.get('redirect') || '/bang-tinh';
  const safePath = redirectPath.startsWith('/') ? redirectPath : '/bang-tinh';
  const origin = searchParams.get('origin') || request.nextUrl.origin;
  const targetUrl = `${origin}${safePath}`;

  if (SUPABASE_KEY) {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        },
        cache: 'no-store'
      });

      if (res.ok) {
        const settings = await res.json();
        if (settings?.external?.google === false) {
          return NextResponse.json({
            ok: false,
            reason: 'PROVIDER_DISABLED',
            message:
              'Nhà cung cấp Google OAuth chưa được bật trên Supabase Dashboard (Authentication → Providers → Google).'
          });
        }
      }
    } catch {
      // Nếu không kiểm tra trước được, vẫn cho phép chuyển hướng sang Supabase Auth
    }
  }

  const authorizeUrl =
    `${SUPABASE_URL}/auth/v1/authorize?provider=google` +
    `&redirect_to=${encodeURIComponent(targetUrl)}` +
    `&query_params=${encodeURIComponent('hd=hcmute.edu.vn&prompt=select_account')}`;

  return NextResponse.json({ ok: true, authorizeUrl });
}
