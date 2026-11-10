import { NextResponse } from 'next/server';
import {
  getWorkbookById,
  saveServerWorkbook,
  deleteServerWorkbook,
  normalizeEmail
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

    return NextResponse.json({ success: true, workbook });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const {
      data,
      touchedCells,
      baseRevision,
      commitMessage,
      participant
    } = body;

    if (!data) {
      return NextResponse.json(
        { error: 'Thiếu dữ liệu bảng biểu.' },
        { status: 400 }
      );
    }

    const normEmail = participant?.email ? normalizeEmail(participant.email) : 'tcns@hcmute.edu.vn';

    const result = saveServerWorkbook({
      workbookId: id,
      data,
      touchedCells: Array.isArray(touchedCells) ? touchedCells : [],
      baseRevision: typeof baseRevision === 'number' ? baseRevision : 1,
      changeSummary: commitMessage || 'Cập nhật từ phiên làm việc',
      actorEmail: normEmail,
      actorTitle: participant?.roleLabel || 'Người thực hiện'
    });

    if (result.conflict) {
      return NextResponse.json(
        {
          error: 'Xung đột phiên bản dữ liệu máy chủ.',
          conflict: true,
          serverRevision: result.currentRevision,
          currentServerWorkbook: result.serverWorkbook
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      workbook: result
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const ok = deleteServerWorkbook(id);
    return NextResponse.json({ success: ok });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
