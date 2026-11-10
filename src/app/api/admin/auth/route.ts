import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAdminPassword,
  generateAdminToken,
  getServerAdminAuth,
  setServerAdminCookie,
  clearServerAdminCookie
} from '@/services/storage/server-admin-auth';

export async function GET() {
  const isAuth = await getServerAdminAuth();
  return NextResponse.json({ authenticated: isAuth });
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

