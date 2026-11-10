import { NextResponse } from 'next/server';
import {
  getAllActiveServerWorkbooks,
  getOrCreateWorkbook,
  normalizeEmail,
  syncServerWorkbooksFromSupabase
} from '@/services/storage/server-workbook-store';

export async function GET() {
  try {
    await syncServerWorkbooksFromSupabase();
    const list = getAllActiveServerWorkbooks();
    const summary = list.map((w) => ({
      id: w.id,
      unitCode: w.unitId,
      unitNameVi: w.unitNameVi,
      reportingPeriod: w.reportingPeriod,
      currentRevision: w.currentRevision,
      status: w.status,
      participants: w.participants,
      updatedAt: w.updatedAt,
      touchedCellsCount: w.touchedCells?.length || 0
    }));
    return NextResponse.json({ workbooks: summary, total: summary.length });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { unitCode, reportingPeriod, email, displayName, roleLabel } = body;

    if (!unitCode || !email) {
      return NextResponse.json(
        { error: 'Thiếu thông tin đơn vị hoặc email người thực hiện.' },
        { status: 400 }
      );
    }

    const normEmail = normalizeEmail(email);
    if (!normEmail) {
      return NextResponse.json(
        { error: 'Email không hợp lệ.' },
        { status: 400 }
      );
    }

    const workbook = getOrCreateWorkbook(
      unitCode,
      reportingPeriod || '01/10/2025–30/9/2026',
      normEmail,
      roleLabel || 'Người thực hiện'
    );

    return NextResponse.json({ success: true, workbook });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
