import { NextResponse } from 'next/server';
import { getServerAdminAuth } from '@/services/storage/server-admin-auth';
import { isPostgresConfigured, pgQuery } from '@/services/storage/postgres-pool';

export async function GET() {
  const isAuth = await getServerAdminAuth();
  if (!isAuth) {
    return NextResponse.json(
      { error: 'Yêu cầu quyền Quản trị viên để xem nhật ký migration CSDL.' },
      { status: 401 }
    );
  }

  if (!isPostgresConfigured()) {
    return NextResponse.json({ configured: false, prismaMigrations: [], sqlMigrations: [] });
  }

  try {
    const prismaRes = await pgQuery<{
      id: string;
      migration_name: string;
      checksum: string;
      started_at: Date;
      finished_at: Date | null;
      applied_steps_count: number;
    }>(`
      SELECT id, migration_name, checksum, started_at, finished_at, applied_steps_count
      FROM public."_prisma_migrations"
      ORDER BY started_at ASC
    `).catch(() => null);

    const sqlRes = await pgQuery<{
      id: number;
      filename: string;
      checksum_sha256: string;
      execution_ms: number;
      status: string;
      applied_by: string;
      git_commit: string | null;
      error_message: string | null;
      applied_at: Date;
    }>(`
      SELECT id, filename, checksum_sha256, execution_ms, status, applied_by, git_commit, error_message, applied_at
      FROM public.schema_migrations
      ORDER BY id ASC
    `).catch(() => null);

    return NextResponse.json({
      configured: true,
      prismaMigrations: prismaRes?.rows || [],
      sqlMigrations: sqlRes?.rows || []
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi truy vấn nhật ký migration.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
