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
    return NextResponse.json({ configured: false, migrations: [] });
  }

  try {
    const res = await pgQuery<{
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
    `);

    return NextResponse.json({
      configured: true,
      total: res?.rowCount || 0,
      migrations: res?.rows || []
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi truy vấn nhật ký migration.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
