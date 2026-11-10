import { NextResponse } from 'next/server';
import {
  getWorkbookById,
  rollbackServerWorkbookRevision
} from '@/services/storage/server-workbook-store';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const workbook = getWorkbookById(id);

    if (!workbook) {
      return NextResponse.json({ error: 'Không tìm thấy hồ sơ.' }, { status: 404 });
    }

    return NextResponse.json({
      workbookId: id,
      currentRevision: wCurrent(workbook),
      revisions: workbook.revisions || []
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function wCurrent(w: { currentRevision?: number }) {
  return w.currentRevision || 1;
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { targetRevision, reason } = body;

    if (typeof targetRevision !== 'number') {
      return NextResponse.json(
        { error: 'Thiếu số phiên bản cần khôi phục (targetRevision).' },
        { status: 400 }
      );
    }

    const updated = rollbackServerWorkbookRevision(id, targetRevision, reason);
    if (!updated) {
      return NextResponse.json(
        { error: 'Không thể khôi phục phiên bản đã chọn.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, workbook: updated });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
