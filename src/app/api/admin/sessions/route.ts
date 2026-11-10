import { NextResponse } from 'next/server';
import { getServerAdminAuth } from '@/services/storage/server-admin-auth';
import { getAllActiveServerWorkbooks, deleteServerWorkbook } from '@/services/storage/server-workbook-store';

export async function GET() {
  const isAuth = await getServerAdminAuth();
  if (!isAuth) {
    return NextResponse.json(
      { error: 'Yêu cầu quyền Quản trị viên để truy cập dữ liệu này.' },
      { status: 401 }
    );
  }

  const workbooks = getAllActiveServerWorkbooks();
  const summary = workbooks.map((w) => {
    const latestParticipant = w.participants[w.participants.length - 1] || {
      email: 'tcns@hcmute.edu.vn',
      roleLabel: 'Chuyên viên'
    };

    return {
      id: w.id,
      unitCode: w.unitId,
      unitNameVi: w.unitNameVi,
      reportingPeriod: w.reportingPeriod,
      email: latestParticipant.email,
      title: latestParticipant.roleLabel,
      lastSavedAt: w.updatedAt,
      currentRevision: w.currentRevision,
      touchedCells: w.touchedCells || [],
      revisionCount: w.revisions?.length || 1,
      status: w.status
    };
  });

  return NextResponse.json({ workbooks: summary, total: summary.length });
}

export async function DELETE(req: Request) {
  const isAuth = await getServerAdminAuth();
  if (!isAuth) {
    return NextResponse.json(
      { error: 'Yêu cầu quyền Quản trị viên để xóa hồ sơ.' },
      { status: 401 }
    );
  }

  try {
    const url = new URL(req.url);
    const workbookId = url.searchParams.get('id');
    if (!workbookId) {
      return NextResponse.json({ error: 'Thiếu mã workbook.' }, { status: 400 });
    }
    const ok = deleteServerWorkbook(workbookId);
    return NextResponse.json({ success: ok });
  } catch {
    return NextResponse.json({ error: 'Lỗi khi xóa hồ sơ.' }, { status: 500 });
  }
}

