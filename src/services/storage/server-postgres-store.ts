import { findHcmuteUnit } from '@/configs/hcmute-units';
import { buildDefaultGridWorkbook } from '@/components/excel-grid/excel-grid-defaults';
import { isPostgresConfigured, pgQuery, withPgTransaction } from './postgres-pool';
import type { ServerParticipant, ServerRevision, ServerWorkbook } from './server-workbook-store';

const CACHE_TTL_MS = 2000;
let cachedWorkbooks: ServerWorkbook[] | null = null;
let lastFetchedAt = 0;

export function invalidatePostgresWorkbookCache(): void {
  cachedWorkbooks = null;
  lastFetchedAt = 0;
}

function formatViTime(val: unknown): string {
  if (!val) return new Date().toLocaleString('vi-VN');
  const d = val instanceof Date ? val : new Date(String(val));
  return isNaN(d.getTime()) ? String(val) : d.toLocaleString('vi-VN');
}

export async function fetchWorkbooksFromPostgres(forceRefresh = false): Promise<ServerWorkbook[]> {
  if (!isPostgresConfigured()) return [];

  const now = Date.now();
  if (!forceRefresh && cachedWorkbooks && now - lastFetchedAt < CACHE_TTL_MS) {
    return cachedWorkbooks;
  }

  try {
    const res = await pgQuery<{
      id: string;
      unit_id: string;
      reporting_period: string;
      status: ServerWorkbook['status'];
      current_revision: number;
      data: ServerWorkbook['data'];
      touched_cells: string[];
      created_at: Date;
      updated_at: Date;
      participants_json: ServerParticipant[] | null;
      revisions_json: ServerRevision[] | null;
    }>(`
      SELECT
        w.id, w.unit_id, w.reporting_period, w.status, w.current_revision,
        w.data, w.touched_cells, w.created_at, w.updated_at,
        (
          SELECT coalesce(jsonb_agg(jsonb_build_object(
            'id', sp.id, 'sessionId', sp.session_id, 'workbookId', sp.workbook_id,
            'displayName', coalesce(sp.display_name, sp.role_label),
            'email', sp.email, 'emailNormalized', sp.email_normalized, 'roleLabel', sp.role_label,
            'startedAt', to_char(sp.started_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'HH24:MI:SS DD/MM/YYYY'),
            'updatedAt', to_char(sp.updated_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'HH24:MI:SS DD/MM/YYYY')
          ) ORDER BY sp.updated_at ASC), '[]'::jsonb)
          FROM public.session_participants sp WHERE sp.workbook_id = w.id
        ) AS participants_json,
        (
          SELECT coalesce(jsonb_agg(jsonb_build_object(
            'id', wr.id, 'workbookId', wr.workbook_id, 'revision', wr.revision, 'data', wr.data,
            'actorEmail', wr.actor_email, 'actorTitle', wr.actor_title,
            'sessionId', wr.session_id, 'changeSummary', wr.change_summary,
            'createdAt', to_char(wr.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'HH24:MI:SS DD/MM/YYYY')
          ) ORDER BY wr.revision DESC), '[]'::jsonb)
          FROM (
            SELECT * FROM public.workbook_revisions WHERE workbook_id = w.id ORDER BY revision DESC LIMIT 15
          ) wr
        ) AS revisions_json
      FROM public.workbooks w
      WHERE w.is_deleted = false
      ORDER BY w.updated_at DESC
      LIMIT 100
    `);

    const workbooks: ServerWorkbook[] = (res?.rows || []).map((r) => {
      const unit = findHcmuteUnit(r.unit_id);
      const created = formatViTime(r.created_at);
      const updated = formatViTime(r.updated_at);
      const parts = Array.isArray(r.participants_json) && r.participants_json.length > 0
        ? r.participants_json
        : [{
            id: `part_${r.unit_id}`, sessionId: `sess_${r.unit_id}`, workbookId: r.id,
            displayName: 'Chuyên viên', email: 'tcns@hcmute.edu.vn',
            emailNormalized: 'tcns@hcmute.edu.vn', roleLabel: 'Chuyên viên',
            startedAt: created, updatedAt: updated
          }];

      return {
        id: r.id, unitId: unit.code, unitNameVi: unit.nameVi,
        reportingPeriod: r.reporting_period || '01/10/2025–30/9/2026',
        status: r.status || 'draft', currentRevision: r.current_revision || 1,
        data: r.data && Object.keys(r.data).length > 0 ? r.data : buildDefaultGridWorkbook(unit.code),
        touchedCells: Array.isArray(r.touched_cells) ? r.touched_cells : [],
        createdAt: created, updatedAt: updated,
        participants: parts, revisions: Array.isArray(r.revisions_json) ? r.revisions_json : []
      };
    });

    cachedWorkbooks = workbooks;
    lastFetchedAt = Date.now();
    return workbooks;
  } catch (err) {
    console.error('[fetchWorkbooksFromPostgres]', err);
    return cachedWorkbooks || [];
  }
}

export async function persistWorkbookToPostgres(wb: ServerWorkbook): Promise<boolean> {
  if (!isPostgresConfigured()) return false;
  invalidatePostgresWorkbookCache();

  try {
    const unit = findHcmuteUnit(wb.unitId);
    const latestPart = wb.participants[wb.participants.length - 1] || {
      email: 'tcns@hcmute.edu.vn', roleLabel: 'Chuyên viên'
    };

    const d = (wb.data || {}) as Record<string, Array<Record<string, unknown>>>;
    const a1Count = Array.isArray(d.A1) ? d.A1.length : 0;
    const a2Count = Array.isArray(d.A2) ? d.A2.length : 0;
    const c1Count = Array.isArray(d.C1) ? d.C1.length : 0;
    const fteTotal = Array.isArray(d.C3)
      ? d.C3.reduce((s, r) => s + (parseFloat(String(r.nguoiCanBoTri ?? r.nhuCauFte ?? 0)) || 0), 0)
      : 0;

    await withPgTransaction(async (client) => {
      await client.query(
        `INSERT INTO public.workbooks (
           id, unit_id, reporting_period, status, current_revision, data, touched_cells, is_deleted, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, now())
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status, current_revision = EXCLUDED.current_revision,
           data = EXCLUDED.data, touched_cells = EXCLUDED.touched_cells,
           is_deleted = EXCLUDED.is_deleted, updated_at = now()`,
        [
          wb.id, unit.code, wb.reportingPeriod || '01/10/2025–30/9/2026', wb.status || 'draft',
          Math.max(1, wb.currentRevision || 1), JSON.stringify(wb.data || {}),
          JSON.stringify(wb.touchedCells || []), Boolean(wb.isDeleted)
        ]
      );

      for (const p of wb.participants || []) {
        const sessId = p.sessionId || `sess_${wb.id}`;
        await client.query(
          `INSERT INTO public.workbook_sessions (id, workbook_id, access_scope, last_active_at)
           VALUES ($1, $2, 'editor', now()) ON CONFLICT (id) DO UPDATE SET last_active_at = now()`,
          [sessId, wb.id]
        );
        await client.query(
          `INSERT INTO public.session_participants (
             id, session_id, workbook_id, display_name, email, email_normalized, role_label, updated_at
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, now())
           ON CONFLICT (id) DO UPDATE SET
             display_name = EXCLUDED.display_name, role_label = EXCLUDED.role_label, updated_at = now()`,
          [p.id, sessId, wb.id, p.displayName || p.roleLabel, p.email, p.emailNormalized, p.roleLabel || 'Chuyên viên']
        );
      }

      const latestRev = wb.revisions?.[0];
      if (latestRev) {
        await client.query(
          `INSERT INTO public.workbook_revisions (
             id, workbook_id, revision, data, actor_email, actor_title, session_id, change_summary
           ) VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
          [
            latestRev.id, wb.id, latestRev.revision, JSON.stringify(latestRev.data || {}),
            latestRev.actorEmail || latestPart.email, latestRev.actorTitle || latestPart.roleLabel,
            latestRev.sessionId || null, latestRev.changeSummary || `Cập nhật lần ${latestRev.revision}`
          ]
        );
      }

      await client.query(
        `INSERT INTO public.t_tien_do (
           ma_don_vi, ten_don_vi, phien_ban, so_nhiem_vu_a1, so_cong_viec_a2, so_vtvl_c1,
           tong_fte_c3, email_nguoi_thuc_hien, chuc_vu_nguoi_thuc_hien,
           trang_thai_ra_soat, du_lieu_ho_so_json, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, now())
         ON CONFLICT (ma_don_vi) DO UPDATE SET
           ten_don_vi = EXCLUDED.ten_don_vi, phien_ban = EXCLUDED.phien_ban,
           so_nhiem_vu_a1 = EXCLUDED.so_nhiem_vu_a1, so_cong_viec_a2 = EXCLUDED.so_cong_viec_a2,
           so_vtvl_c1 = EXCLUDED.so_vtvl_c1, tong_fte_c3 = EXCLUDED.tong_fte_c3,
           email_nguoi_thuc_hien = EXCLUDED.email_nguoi_thuc_hien,
           chuc_vu_nguoi_thuc_hien = EXCLUDED.chuc_vu_nguoi_thuc_hien,
           trang_thai_ra_soat = EXCLUDED.trang_thai_ra_soat,
           du_lieu_ho_so_json = EXCLUDED.du_lieu_ho_so_json, updated_at = now()`,
        [
          unit.code, unit.nameVi, `v${wb.currentRevision || 1}`, a1Count, a2Count, c1Count,
          Math.round(fteTotal * 100) / 100, latestPart.email, latestPart.roleLabel,
          'Đã đồng bộ PostgreSQL',
          JSON.stringify({ lastWorkbookId: wb.id, actorEmail: latestPart.email, lastSavedAt: wb.updatedAt })
        ]
      );
    });
    return true;
  } catch (err) {
    console.error('[persistWorkbookToPostgres]', err);
    return false;
  }
}

export async function deleteWorkbookFromPostgres(workbookId: string, unitId: string): Promise<boolean> {
  if (!isPostgresConfigured()) return false;
  invalidatePostgresWorkbookCache();
  try {
    await pgQuery(`UPDATE public.workbooks SET is_deleted = true, updated_at = now() WHERE id = $1`, [workbookId]);
    await pgQuery(
      `UPDATE public.t_tien_do SET trang_thai_ra_soat = 'Đã đánh dấu lưu trữ/xóa', updated_at = now() WHERE ma_don_vi = $1`,
      [unitId]
    );
    return true;
  } catch {
    return false;
  }
}
