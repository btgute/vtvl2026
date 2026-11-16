import { Prisma } from '@prisma/client';
import { findHcmuteUnit } from '@/configs/hcmute-units';
import { buildDefaultGridWorkbook } from '@/components/excel-grid/excel-grid-defaults';
import prisma, { isDatabaseConfigured } from './prisma';
import type { ServerWorkbook } from './server-workbook-store';

const CACHE_TTL_MS = 2000;
let cachedWorkbooks: ServerWorkbook[] | null = null;
let lastFetchedAt = 0;

export function invalidatePostgresWorkbookCache(): void {
  cachedWorkbooks = null;
  lastFetchedAt = 0;
}

function formatViTime(val: Date | string | null | undefined): string {
  if (!val) return new Date().toLocaleString('vi-VN');
  const d = val instanceof Date ? val : new Date(String(val));
  return isNaN(d.getTime()) ? String(val) : d.toLocaleString('vi-VN');
}

export async function fetchWorkbooksFromPostgres(forceRefresh = false): Promise<ServerWorkbook[]> {
  if (!isDatabaseConfigured()) return [];

  const now = Date.now();
  if (!forceRefresh && cachedWorkbooks && now - lastFetchedAt < CACHE_TTL_MS) {
    return cachedWorkbooks;
  }

  try {
    const rows = await prisma.workbook.findMany({
      where: { isDeleted: false },
      orderBy: { updatedAt: 'desc' },
      take: 100,
      include: {
        participants: { orderBy: { updatedAt: 'asc' } },
        revisions: { orderBy: { revision: 'desc' }, take: 15 }
      }
    });

    const workbooks: ServerWorkbook[] = rows.map((r) => {
      const unit = findHcmuteUnit(r.unitId);
      const created = formatViTime(r.createdAt);
      const updated = formatViTime(r.updatedAt);
      const dataObj = (r.data && typeof r.data === 'object' ? r.data : {}) as ServerWorkbook['data'];
      const touched = Array.isArray(r.touchedCells) ? (r.touchedCells as string[]) : [];

      const parts =
        r.participants.length > 0
          ? r.participants.map((sp) => ({
              id: sp.id,
              sessionId: sp.sessionId,
              workbookId: sp.workbookId,
              displayName: sp.displayName || sp.roleLabel,
              email: sp.email,
              emailNormalized: sp.emailNormalized,
              roleLabel: sp.roleLabel,
              startedAt: formatViTime(sp.startedAt),
              updatedAt: formatViTime(sp.updatedAt)
            }))
          : [
              {
                id: `part_${r.unitId}`,
                sessionId: `sess_${r.unitId}`,
                workbookId: r.id,
                displayName: 'Chuyên viên',
                email: 'tcns@hcmute.edu.vn',
                emailNormalized: 'tcns@hcmute.edu.vn',
                roleLabel: 'Chuyên viên',
                startedAt: created,
                updatedAt: updated
              }
            ];

      return {
        id: r.id,
        unitId: unit.code,
        unitNameVi: unit.nameVi,
        reportingPeriod: r.reportingPeriod || '01/10/2025–30/9/2026',
        status: (r.status as ServerWorkbook['status']) || 'draft',
        currentRevision: r.currentRevision || 1,
        data: Object.keys(dataObj).length > 0 ? dataObj : buildDefaultGridWorkbook(unit.code),
        touchedCells: touched,
        createdAt: created,
        updatedAt: updated,
        participants: parts,
        revisions: r.revisions.map((wr) => ({
          id: wr.id,
          workbookId: wr.workbookId,
          revision: wr.revision,
          data: (wr.data as ServerWorkbook['data']) || buildDefaultGridWorkbook(unit.code),
          actorEmail: wr.actorEmail,
          actorTitle: wr.actorTitle || undefined,
          sessionId: wr.sessionId || undefined,
          changeSummary: wr.changeSummary || undefined,
          createdAt: formatViTime(wr.createdAt)
        }))
      };
    });

    cachedWorkbooks = workbooks;
    lastFetchedAt = Date.now();
    return workbooks;
  } catch (err) {
    console.error('[fetchWorkbooksFromPostgres:Prisma]', err);
    return cachedWorkbooks || [];
  }
}

export async function persistWorkbookToPostgres(wb: ServerWorkbook): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  invalidatePostgresWorkbookCache();

  try {
    const unit = findHcmuteUnit(wb.unitId);
    const latestPart = wb.participants[wb.participants.length - 1] || {
      email: 'tcns@hcmute.edu.vn',
      roleLabel: 'Chuyên viên'
    };

    const d = (wb.data || {}) as Record<string, Array<Record<string, unknown>>>;
    const a1Count = Array.isArray(d.A1) ? d.A1.length : 0;
    const a2Count = Array.isArray(d.A2) ? d.A2.length : 0;
    const c1Count = Array.isArray(d.C1) ? d.C1.length : 0;
    const fteTotal = Array.isArray(d.C3)
      ? d.C3.reduce((s, r) => s + (parseFloat(String(r.nguoiCanBoTri ?? r.nhuCauFte ?? 0)) || 0), 0)
      : 0;

    const dataJson = (wb.data || {}) as unknown as Prisma.InputJsonValue;
    const touchedJson = (wb.touchedCells || []) as unknown as Prisma.InputJsonValue;

    await prisma.$transaction(async (tx) => {
      await tx.workbook.upsert({
        where: { id: wb.id },
        update: {
          status: wb.status || 'draft',
          currentRevision: Math.max(1, wb.currentRevision || 1),
          data: dataJson,
          touchedCells: touchedJson,
          isDeleted: Boolean(wb.isDeleted),
          updatedAt: new Date()
        },
        create: {
          id: wb.id,
          unitId: unit.code,
          reportingPeriod: wb.reportingPeriod || '01/10/2025–30/9/2026',
          status: wb.status || 'draft',
          currentRevision: Math.max(1, wb.currentRevision || 1),
          data: dataJson,
          touchedCells: touchedJson,
          isDeleted: Boolean(wb.isDeleted)
        }
      });

      for (const p of wb.participants || []) {
        const sessId = p.sessionId || `sess_${wb.id}`;
        await tx.workbookSession.upsert({
          where: { id: sessId },
          update: { lastActiveAt: new Date() },
          create: { id: sessId, workbookId: wb.id, accessScope: 'editor' }
        });
        await tx.sessionParticipant.upsert({
          where: { id: p.id },
          update: {
            displayName: p.displayName || p.roleLabel,
            roleLabel: p.roleLabel || 'Chuyên viên',
            updatedAt: new Date()
          },
          create: {
            id: p.id,
            sessionId: sessId,
            workbookId: wb.id,
            displayName: p.displayName || p.roleLabel,
            email: p.email,
            emailNormalized: p.emailNormalized,
            roleLabel: p.roleLabel || 'Chuyên viên'
          }
        });
      }

      const latestRev = wb.revisions?.[0];
      if (latestRev) {
        await tx.workbookRevision.upsert({
          where: { id: latestRev.id },
          update: {},
          create: {
            id: latestRev.id,
            workbookId: wb.id,
            revision: latestRev.revision,
            data: (latestRev.data || {}) as unknown as Prisma.InputJsonValue,
            actorEmail: latestRev.actorEmail || latestPart.email,
            actorTitle: latestRev.actorTitle || latestPart.roleLabel,
            sessionId: latestRev.sessionId || null,
            changeSummary: latestRev.changeSummary || `Cập nhật lần ${latestRev.revision}`
          }
        });
      }

      await tx.tTienDo.upsert({
        where: { maDonVi: unit.code },
        update: {
          tenDonVi: unit.nameVi,
          phienBan: `v${wb.currentRevision || 1}`,
          soNhiemVuA1: a1Count,
          soCongViecA2: a2Count,
          soVtvlC1: c1Count,
          tongFteC3: Math.round(fteTotal * 100) / 100,
          emailNguoiThucHien: latestPart.email,
          chucVuNguoiThucHien: latestPart.roleLabel,
          trangThaiRaSoat: 'Đã đồng bộ Prisma PostgreSQL',
          duLieuHoSoJson: {
            lastWorkbookId: wb.id,
            actorEmail: latestPart.email,
            lastSavedAt: wb.updatedAt
          } as unknown as Prisma.InputJsonValue,
          updatedAt: new Date()
        },
        create: {
          maDonVi: unit.code,
          tenDonVi: unit.nameVi,
          phienBan: `v${wb.currentRevision || 1}`,
          soNhiemVuA1: a1Count,
          soCongViecA2: a2Count,
          soVtvlC1: c1Count,
          tongFteC3: Math.round(fteTotal * 100) / 100,
          emailNguoiThucHien: latestPart.email,
          chucVuNguoiThucHien: latestPart.roleLabel,
          trangThaiRaSoat: 'Đã đồng bộ Prisma PostgreSQL',
          duLieuHoSoJson: {
            lastWorkbookId: wb.id,
            actorEmail: latestPart.email,
            lastSavedAt: wb.updatedAt
          } as unknown as Prisma.InputJsonValue
        }
      });
    });
    return true;
  } catch (err) {
    console.error('[persistWorkbookToPostgres:Prisma]', err);
    return false;
  }
}

export async function deleteWorkbookFromPostgres(workbookId: string, unitId: string): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  invalidatePostgresWorkbookCache();
  try {
    await prisma.workbook.update({
      where: { id: workbookId },
      data: { isDeleted: true, updatedAt: new Date() }
    });
    await prisma.tTienDo
      .update({
        where: { maDonVi: unitId },
        data: { trangThaiRaSoat: 'Đã đánh dấu lưu trữ/xóa', updatedAt: new Date() }
      })
      .catch(() => {});
    return true;
  } catch {
    return false;
  }
}
