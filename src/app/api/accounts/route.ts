import { NextRequest, NextResponse } from 'next/server';
import {
  syncAccountsFromPostgres,
  getUserAccountByEmail,
  upsertUserAccount,
  UserRole
} from '@/services/storage/server-account-store';
import {
  getServerAdminAuth,
  getVerifiedNextAuthEmail,
  isVerifiedAdminAccount,
  generateAdminToken,
  setServerAdminCookie
} from '@/services/storage/server-admin-auth';
import { normalizeEmail } from '@/services/storage/server-workbook-store';

export async function GET(req: NextRequest) {
  const email = normalizeEmail(req.nextUrl.searchParams.get('email') || '');
  if (!email) {
    return NextResponse.json({ error: 'Thiếu email người dùng.' }, { status: 400 });
  }

  await syncAccountsFromPostgres();
  const account = getUserAccountByEmail(email);

  const cookieAdmin = await getServerAdminAuth();
  const verifiedGoogleAdmin = await isVerifiedAdminAccount(email);

  if (verifiedGoogleAdmin && !cookieAdmin) {
    await setServerAdminCookie(generateAdminToken());
  }

  const isAdmin = cookieAdmin || verifiedGoogleAdmin;
  return NextResponse.json({ account, isAdmin });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = normalizeEmail(body.email || '');
    if (!email) {
      return NextResponse.json({ error: 'Email công vụ không hợp lệ.' }, { status: 400 });
    }

    await syncAccountsFromPostgres();
    const existing = getUserAccountByEmail(email);
    const cookieAdmin = await getServerAdminAuth();
    const verifiedEmail = await getVerifiedNextAuthEmail();
    const verifiedGoogleAdmin = await isVerifiedAdminAccount(email);
    const isAdmin = cookieAdmin || verifiedGoogleAdmin;

    const wantsGoogle = body.authProvider === 'google' || existing?.authProvider === 'google';
    if (wantsGoogle && !isAdmin && verifiedEmail !== email) {
      if (existing) {
        return NextResponse.json({ account: existing, isAdmin: false });
      }
      return NextResponse.json(
        { error: 'Yêu cầu đăng nhập Google hợp lệ qua NextAuth để đồng bộ tài khoản này.' },
        { status: 401 }
      );
    }

    let targetUnitCode = body.unitCode;
    let targetHasSelectedUnit = body.hasSelectedUnit ?? Boolean(body.unitCode);

    if (existing?.hasSelectedUnit && !isAdmin) {
      targetUnitCode = existing.unitCode;
      targetHasSelectedUnit = true;
    }

    const account = upsertUserAccount({
      email,
      displayName: body.displayName || existing?.displayName,
      unitCode: targetUnitCode || existing?.unitCode,
      title: body.title || existing?.title,
      avatarUrl: body.avatarUrl || existing?.avatarUrl,
      authProvider: verifiedEmail === email ? 'google' : (existing?.authProvider || 'email'),
      hasSelectedUnit: targetHasSelectedUnit
    });

    if (verifiedGoogleAdmin && !cookieAdmin) {
      await setServerAdminCookie(generateAdminToken());
    }

    return NextResponse.json({ account, isAdmin });
  } catch {
    return NextResponse.json({ error: 'Không thể đồng bộ tài khoản người dùng.' }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const email = normalizeEmail(body.email || '');
    if (!email) {
      return NextResponse.json({ error: 'Email công vụ không hợp lệ.' }, { status: 400 });
    }

    await syncAccountsFromPostgres();
    const existing = getUserAccountByEmail(email);
    const verifiedEmail = await getVerifiedNextAuthEmail();
    const isAdmin = await getServerAdminAuth(email);

    if (existing?.authProvider === 'google' && !isAdmin && verifiedEmail !== email) {
      return NextResponse.json(
        { error: 'Không có quyền sửa thông tin tài khoản Google của người dùng khác.' },
        { status: 403 }
      );
    }

    const requestedRole = body.role as UserRole | undefined;
    if (requestedRole && !isAdmin) {
      return NextResponse.json(
        { error: 'Chỉ Quản trị viên hệ thống mới có quyền thay đổi vai trò.' },
        { status: 403 }
      );
    }

    if (!isAdmin && existing?.hasSelectedUnit && body.unitCode && body.unitCode !== existing.unitCode) {
      return NextResponse.json(
        { error: 'Chỉ Quản trị viên hệ thống mới có quyền thay đổi đơn vị công tác.' },
        { status: 403 }
      );
    }

    const account = upsertUserAccount(
      {
        email,
        displayName: body.displayName,
        unitCode: !isAdmin && existing?.hasSelectedUnit ? existing.unitCode : body.unitCode,
        title: body.title,
        avatarUrl: body.avatarUrl,
        role: isAdmin ? requestedRole : undefined,
        hasSelectedUnit: existing?.hasSelectedUnit || body.hasSelectedUnit || Boolean(body.unitCode)
      },
      isAdmin && Boolean(requestedRole)
    );

    return NextResponse.json({ account, isAdmin });
  } catch {
    return NextResponse.json({ error: 'Không thể cập nhật thông tin tài khoản.' }, { status: 400 });
  }
}
