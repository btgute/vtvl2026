import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAdminPassword,
  generateAdminToken,
  getServerAdminAuth,
  setServerAdminCookie,
  clearServerAdminCookie,
  isVerifiedAdminAccount
} from '@/services/storage/server-admin-auth';

function extractBearer(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization') || '';
  return authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : null;
}

export async function GET(req: NextRequest) {
  const cookieAuth = await getServerAdminAuth();
  if (cookieAuth) {
    return NextResponse.json({ authenticated: true, role: 'admin' });
  }

  const email = req.nextUrl.searchParams.get('email') || '';
  const bearer = extractBearer(req);
  if (email && bearer) {
    const isGoogleAdmin = await isVerifiedAdminAccount(email, bearer);
    if (isGoogleAdmin) {
      const token = generateAdminToken();
      await setServerAdminCookie(token);
      return NextResponse.json({ authenticated: true, role: 'admin' });
    }
  }

  return NextResponse.json({ authenticated: false });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;
    if (!password || !verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: 'Mật khẩu quản trị viên không chính xác.' },
        { status: 401 }
      );
    }
    const token = generateAdminToken();
    await setServerAdminCookie(token);
    return NextResponse.json({ success: true, message: 'Đăng nhập Quản trị viên thành công.' });
  } catch {
    return NextResponse.json({ error: 'Dữ liệu yêu cầu không hợp lệ.' }, { status: 400 });
  }
}

export async function DELETE() {
  await clearServerAdminCookie();
  return NextResponse.json({ success: true, message: 'Đã đăng xuất Quản trị viên.' });
}
