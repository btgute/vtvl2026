import { NextResponse } from 'next/server';
import {
  findWorkbooksByEmail,
  normalizeEmail
} from '@/services/storage/server-workbook-store';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const rawEmail = url.searchParams.get('email');

    if (!rawEmail) {
      return NextResponse.json({ workbooks: [], total: 0 });
    }

    const normEmail = normalizeEmail(rawEmail);
    if (!normEmail) {
      return NextResponse.json({ workbooks: [], total: 0 });
    }

    let results = findWorkbooksByEmail(normEmail);

    const unitCode = url.searchParams.get('unitCode');
    if (unitCode) {
      results = results.filter((w) => w.unitId.toUpperCase() === unitCode.toUpperCase());
    }

    const reportingPeriod = url.searchParams.get('reportingPeriod');
    if (reportingPeriod) {
      results = results.filter((w) => w.reportingPeriod === reportingPeriod);
    }

    const summary = results.map((w) => {
      const lastParticipant = w.participants[w.participants.length - 1];
      return {
        id: w.id,
        unitCode: w.unitId,
        unitNameVi: w.unitNameVi,
        reportingPeriod: w.reportingPeriod,
        currentRevision: w.currentRevision,
        status: w.status,
        lastSavedAt: w.updatedAt,
        latestParticipant: lastParticipant || null,
        touchedCellsCount: w.touchedCells?.length || 0,
        revisionsCount: w.revisions?.length || 1
      };
    });

    return NextResponse.json({
      queryEmail: normEmail,
      workbooks: summary,
      total: summary.length
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

