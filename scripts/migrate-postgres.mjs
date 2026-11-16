import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import pg from 'pg';

const { Client } = pg;
const LOCK_ID = 20260731;

const PRIORITY_ORDER = [
  '00-supabase-compat.sql',
  '20261107_init_vtvl_hcmute.sql',
  '20261110_vtvl_server_workbooks.sql',
  '20261110_lockdown_supabase_rls.sql',
  '20261113_google_auth_rls_and_indexes.sql',
  '20261113_user_accounts_and_roles.sql',
  '20261116_native_postgres_seed_and_auth.sql'
];

function collectMigrationFiles(rootDir) {
  const entries = [];
  const compatFile = path.join(rootDir, 'deploy/postgres/00-supabase-compat.sql');
  if (fs.existsSync(compatFile)) {
    entries.push({ filename: '00-supabase-compat.sql', fullPath: compatFile });
  }

  for (const relDir of ['supabase/migrations', 'db/migrations']) {
    const dir = path.join(rootDir, relDir);
    if (!fs.existsSync(dir)) continue;
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.sql'))
      .sort();
    for (const f of files) {
      if (!entries.some((e) => e.filename === f)) {
        entries.push({ filename: f, fullPath: path.join(dir, f) });
      }
    }
  }

  return entries.sort((a, b) => {
    const ia = PRIORITY_ORDER.indexOf(a.filename);
    const ib = PRIORITY_ORDER.indexOf(b.filename);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.filename.localeCompare(b.filename);
  });
}

async function runMigrations() {
  const dbUrl = (process.env.DATABASE_URL || '').trim();
  if (!dbUrl) {
    console.error('❌ [MIGRATE] Thiếu biến môi trường DATABASE_URL.');
    process.exit(1);
  }

  const rootDir = process.cwd();
  const gitCommit = (process.env.GIT_COMMIT || '').trim() || null;
  const files = collectMigrationFiles(rootDir);

  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  const tsNow = () => new Date().toISOString();

  console.log(`[${tsNow()}] 🗄️  Bắt đầu kiểm tra PostgreSQL Migrations (tổng ${files.length} tệp)...`);

  try {
    await client.query('SELECT pg_advisory_lock($1)', [LOCK_ID]);

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        id serial PRIMARY KEY,
        filename text NOT NULL UNIQUE,
        checksum_sha256 text NOT NULL,
        execution_ms integer NOT NULL DEFAULT 0,
        status text NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed')),
        applied_by text NOT NULL DEFAULT current_user,
        git_commit text,
        error_message text,
        applied_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    const appliedRes = await client.query(
      `SELECT filename, checksum_sha256 FROM public.schema_migrations WHERE status = 'success'`
    );
    const appliedMap = new Map(appliedRes.rows.map((r) => [r.filename, r.checksum_sha256]));

    let appliedCount = 0;
    let skippedCount = 0;

    for (const item of files) {
      const sql = fs.readFileSync(item.fullPath, 'utf8');
      const sha256 = crypto.createHash('sha256').update(sql).digest('hex');

      if (appliedMap.has(item.filename)) {
        skippedCount += 1;
        console.log(`  ✓ [SKIP] ${item.filename} (đã áp dụng)`);
        continue;
      }

      const t0 = Date.now();
      try {
        await client.query('BEGIN');
        await client.query(sql);
        const execMs = Date.now() - t0;
        await client.query(
          `INSERT INTO public.schema_migrations (
             filename, checksum_sha256, execution_ms, status, git_commit, error_message, applied_at
           ) VALUES ($1, $2, $3, 'success', $4, NULL, now())
           ON CONFLICT (filename) DO UPDATE SET
             checksum_sha256 = EXCLUDED.checksum_sha256,
             execution_ms = EXCLUDED.execution_ms,
             status = 'success',
             git_commit = EXCLUDED.git_commit,
             error_message = NULL,
             applied_at = now()`,
          [item.filename, sha256, execMs, gitCommit]
        );
        await client.query('COMMIT');
        appliedCount += 1;
        console.log(`  🚀 [APPLIED] ${item.filename} (${execMs} ms | sha256:${sha256.slice(0, 12)})`);
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        const execMs = Date.now() - t0;
        const errMsg = err instanceof Error ? err.message : String(err);
        await client
          .query(
            `INSERT INTO public.schema_migrations (
               filename, checksum_sha256, execution_ms, status, git_commit, error_message, applied_at
             ) VALUES ($1, $2, $3, 'failed', $4, $5, now())
             ON CONFLICT (filename) DO UPDATE SET
               checksum_sha256 = EXCLUDED.checksum_sha256,
               execution_ms = EXCLUDED.execution_ms,
               status = 'failed',
               git_commit = EXCLUDED.git_commit,
               error_message = EXCLUDED.error_message,
               applied_at = now()`,
            [item.filename, sha256, execMs, gitCommit, errMsg]
          )
          .catch(() => {});
        console.error(`  ❌ [FAILED] ${item.filename} (${execMs} ms): ${errMsg}`);
        throw err;
      }
    }

    const summaryRes = await client.query(
      `SELECT count(*)::int AS total_ok FROM public.schema_migrations WHERE status = 'success'`
    );
    console.log(
      `[${tsNow()}] ✅ Hoàn tất Migration: mới áp dụng ${appliedCount}, bỏ qua ${skippedCount}, tổng lịch sử thành công: ${summaryRes.rows[0]?.total_ok || 0}.`
    );
  } finally {
    await client.query('SELECT pg_advisory_unlock($1)', [LOCK_ID]).catch(() => {});
    await client.end().catch(() => {});
  }
}

runMigrations().catch((err) => {
  console.error('❌ [MIGRATE FATAL]', err instanceof Error ? err.message : err);
  process.exit(1);
});
