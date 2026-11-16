import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var __uteVtvlPgPool: Pool | undefined;
}

export function isPostgresConfigured(): boolean {
  return Boolean((process.env.DATABASE_URL || '').trim());
}

export function getPostgresPool(): Pool | null {
  const connectionString = (process.env.DATABASE_URL || '').trim();
  if (!connectionString) return null;

  if (!globalThis.__uteVtvlPgPool) {
    globalThis.__uteVtvlPgPool = new Pool({
      connectionString,
      max: 15,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      statement_timeout: 15000,
      application_name: 'hcmute-vtvl-360'
    });

    globalThis.__uteVtvlPgPool.on('error', (err) => {
      console.error('[PostgreSQL Pool Error]', err.message);
    });
  }

  return globalThis.__uteVtvlPgPool;
}

export async function pgQuery<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: unknown[] = []
): Promise<QueryResult<T> | null> {
  const pool = getPostgresPool();
  if (!pool) return null;
  return pool.query<T>(sql, params);
}

export async function withPgTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T | null> {
  const pool = getPostgresPool();
  if (!pool) return null;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
