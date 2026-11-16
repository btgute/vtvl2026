import fs from 'fs';
import path from 'path';
import { isPostgresConfigured, pgQuery } from './postgres-pool';

export interface ServerAuditLog {
  id: string;
  workbookId?: string;
  unitCode: string;
  unitName: string;
  action: string;
  details: string;
  actorEmail?: string;
  actorRole?: string;
  createdAt: string;
  timestamp: number;
}

const DATA_DIR = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), '.data');
const AUDIT_FILE = path.join(DATA_DIR, 'audit-logs.json');

const memoryAuditLogs: ServerAuditLog[] = [];
let isLoaded = false;

function ensureLoaded() {
  if (isLoaded) return;
  try {
    if (fs.existsSync(AUDIT_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8'));
      if (Array.isArray(parsed)) {
        memoryAuditLogs.push(...parsed);
      }
    }
  } catch { /* ignore */ }
  isLoaded = true;
}

function persistLogs() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(memoryAuditLogs, null, 2), 'utf8');
  } catch { /* ignore in read-only environment */ }
}

export function appendAuditLog(entry: Omit<ServerAuditLog, 'id' | 'createdAt' | 'timestamp'>): ServerAuditLog {
  ensureLoaded();
  const nowIso = new Date().toISOString();
  const ts = Date.now();
  const newLog: ServerAuditLog = {
    ...entry,
    id: `audit_${ts}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: nowIso,
    timestamp: ts
  };
  memoryAuditLogs.unshift(newLog);
  if (memoryAuditLogs.length > 5000) {
    memoryAuditLogs.length = 5000;
  }
  persistLogs();

  if (isPostgresConfigured()) {
    pgQuery(
      `INSERT INTO public.audit_logs (
         workbook_id, actor_email, action, record_id, metadata, created_at
       ) VALUES ($1, $2, $3, $4, $5::jsonb, $6::timestamptz)`,
      [
        newLog.workbookId || null,
        newLog.actorEmail || null,
        newLog.action,
        newLog.unitCode,
        JSON.stringify({
          clientId: newLog.id,
          unitCode: newLog.unitCode,
          unitName: newLog.unitName,
          details: newLog.details,
          actorRole: newLog.actorRole || null
        }),
        nowIso
      ]
    ).catch((err) => console.error('[appendAuditLog:pg]', err));
  }

  return newLog;
}

export async function getAuditLogs(
  filter?: { unitCode?: string; workbookId?: string; limit?: number }
): Promise<ServerAuditLog[]> {
  const max = Math.min(Math.max(filter?.limit || 100, 1), 500);

  if (isPostgresConfigured()) {
    try {
      const clauses: string[] = [];
      const params: unknown[] = [];

      if (filter?.unitCode) {
        params.push(filter.unitCode);
        clauses.push(`record_id = $${params.length}`);
      }
      if (filter?.workbookId) {
        params.push(filter.workbookId);
        clauses.push(`workbook_id = $${params.length}`);
      }
      params.push(max);
      const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';

      const res = await pgQuery<{
        id: string;
        workbook_id: string | null;
        actor_email: string | null;
        action: string;
        record_id: string | null;
        metadata: Record<string, unknown> | null;
        created_at: Date;
      }>(
        `SELECT id::text, workbook_id, actor_email, action, record_id, metadata, created_at
         FROM public.audit_logs
         ${whereSql}
         ORDER BY created_at DESC
         LIMIT $${params.length}`,
        params
      );

      if (res && res.rows.length > 0) {
        return res.rows.map((r) => {
          const meta = r.metadata || {};
          const created = new Date(r.created_at);
          return {
            id: String(meta.clientId || `audit_${r.id}`),
            workbookId: r.workbook_id || undefined,
            unitCode: String(meta.unitCode || r.record_id || 'HCM-UTE'),
            unitName: String(meta.unitName || r.record_id || 'HCM-UTE'),
            action: r.action,
            details: String(meta.details || ''),
            actorEmail: r.actor_email || undefined,
            actorRole: meta.actorRole ? String(meta.actorRole) : undefined,
            createdAt: created.toISOString(),
            timestamp: created.getTime()
          };
        });
      }
    } catch (err) {
      console.error('[getAuditLogs:pg]', err);
    }
  }

  ensureLoaded();
  let list = [...memoryAuditLogs];
  if (filter?.unitCode) {
    list = list.filter((l) => l.unitCode === filter.unitCode);
  }
  if (filter?.workbookId) {
    list = list.filter((l) => l.workbookId === filter.workbookId);
  }
  return list.slice(0, max);
}
