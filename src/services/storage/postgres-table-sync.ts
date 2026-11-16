import { isPostgresConfigured, withPgTransaction } from './postgres-pool';

const ALLOWED_SYNC_TABLES = new Set([
  'c1_vtvl',
  'a1_nhiem_vu',
  'c3_nhu_cau',
  'sldv_quy_mo_don_vi',
  'sldv_phan_bo_ngach',
  't_tien_do',
  'k_kiem_tra',
  'ra_soat_chua_du_can_cu'
]);

const SAFE_IDENT_RE = /^[a-z][a-z0-9_]*$/;

export async function upsertTableRowsPostgres(
  table: string,
  payload: Record<string, unknown> | Array<Record<string, unknown>>,
  upsertConflictCol?: string
): Promise<boolean> {
  if (!isPostgresConfigured() || !ALLOWED_SYNC_TABLES.has(table)) return false;
  const rows = Array.isArray(payload) ? payload : [payload];
  if (rows.length === 0) return true;

  const cols = Object.keys(rows[0]).filter((c) => SAFE_IDENT_RE.test(c));
  if (cols.length === 0) return false;

  const conflictCols = (upsertConflictCol || '')
    .split(',')
    .map((s) => s.trim())
    .filter((c) => SAFE_IDENT_RE.test(c));

  try {
    await withPgTransaction(async (client) => {
      for (const row of rows) {
        const values = cols.map((c) => {
          const v = row[c];
          return v !== null && typeof v === 'object' ? JSON.stringify(v) : v;
        });
        const placeholders = cols.map((_, idx) => `$${idx + 1}`).join(', ');
        const colNames = cols.map((c) => `"${c}"`).join(', ');

        let sql = `INSERT INTO public."${table}" (${colNames}) VALUES (${placeholders})`;
        if (conflictCols.length > 0) {
          const conflictTarget = conflictCols.map((c) => `"${c}"`).join(', ');
          const updateCols = cols.filter((c) => !conflictCols.includes(c));
          if (updateCols.length > 0) {
            const setClause = updateCols.map((c) => `"${c}" = EXCLUDED."${c}"`).join(', ');
            sql += ` ON CONFLICT (${conflictTarget}) DO UPDATE SET ${setClause}`;
          } else {
            sql += ` ON CONFLICT (${conflictTarget}) DO NOTHING`;
          }
        }
        await client.query(sql, values);
      }
    });
    return true;
  } catch (err) {
    console.error(`[upsertTableRowsPostgres:${table}]`, err);
    return false;
  }
}
