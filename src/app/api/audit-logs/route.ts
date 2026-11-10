import { NextResponse } from 'next/server';
import { appendAuditLog, getAuditLogs } from '@/services/storage/server-audit-store';
import { getServerAdminAuth } from '@/services/storage/server-admin-auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { unitCode, unitName, action, details, actorEmail, actorTitle, workbookId } = body;

    if (!unitCode || !action || !details) {
      return NextResponse.json(
        { error: 'Thiếu trường bắt buộc cho nhật ký thao tác (unitCode, action, details).' },
        { status: 400 }
      );
    }

    // Làm sạch details nếu người dùng hoặc client cũ lỡ ghép email
    const cleanDetails = String(details).replace(/\s*\[Người thực hiện:\s*[^\]]+\]/g, '').trim();

    const log = appendAuditLog({
      unitCode: String(unitCode),
      unitName: String(unitName || unitCode),
      action: String(action),
      details: cleanDetails,
      actorEmail: actorEmail ? String(actorEmail).toLowerCase().trim() : undefined,
      actorRole: actorTitle ? String(actorTitle) : undefined,
      workbookId: workbookId ? String(workbookId) : undefined
    });

    return NextResponse.json({ success: true, log }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi hệ thống khi ghi nhật ký.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const isAuth = await getServerAdminAuth();
  if (!isAuth) {
    return NextResponse.json(
      { error: 'Yêu cầu quyền Quản trị viên để xem nhật ký kiểm toán hệ thống.' },
      { status: 401 }
    );
  }

  try {
    const url = new URL(req.url);
    const unitCode = url.searchParams.get('unitCode') || undefined;
    const workbookId = url.searchParams.get('workbookId') || undefined;
    const limit = Number(url.searchParams.get('limit')) || 100;

    const logs = getAuditLogs({ unitCode, workbookId, limit });
    return NextResponse.json({ success: true, logs, total: logs.length });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi khi đọc nhật ký.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
