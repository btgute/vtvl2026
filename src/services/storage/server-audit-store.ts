import fs from 'fs';
import path from 'path';
import prisma, { isDatabaseConfigured } from './prisma';

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
  const now = new Date();
  const ts = now.getTime();
  const newLog: ServerAuditLog = {
    ...entry,
    id: `audit_${ts}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: now.toISOString(),
    timestamp: ts
  };
  memoryAuditLogs.unshift(newLog);
  if (memoryAuditLogs.length > 5000) {
    memoryAuditLogs.length = 5000;
  }
  persistLogs();

  if (isDatabaseConfigured()) {
    prisma.auditLog
      .create({
        data: {
          workbookId: newLog.workbookId || null,
          actorEmail: newLog.actorEmail || null,
          action: newLog.action,
          recordId: newLog.unitCode,
          metadata: {
            clientId: newLog.id,
            unitCode: newLog.unitCode,
            unitName: newLog.unitName,
            details: newLog.details,
            actorRole: newLog.actorRole || null
          },
          createdAt: now
        }
      })
      .catch((err) => console.error('[appendAuditLog:Prisma]', err));
  }

  return newLog;
}

export async function getAuditLogs(
  filter?: { unitCode?: string; workbookId?: string; limit?: number }
): Promise<ServerAuditLog[]> {
  const max = Math.min(Math.max(filter?.limit || 100, 1), 500);

  if (isDatabaseConfigured()) {
    try {
      const rows = await prisma.auditLog.findMany({
        where: {
          ...(filter?.unitCode ? { recordId: filter.unitCode } : {}),
          ...(filter?.workbookId ? { workbookId: filter.workbookId } : {})
        },
        orderBy: { createdAt: 'desc' },
        take: max
      });

      if (rows.length > 0) {
        return rows.map((r) => {
          const meta = (r.metadata || {}) as Record<string, unknown>;
          const created = new Date(r.createdAt);
          return {
            id: String(meta.clientId || `audit_${r.id.toString()}`),
            workbookId: r.workbookId || undefined,
            unitCode: String(meta.unitCode || r.recordId || 'HCM-UTE'),
            unitName: String(meta.unitName || r.recordId || 'HCM-UTE'),
            action: r.action,
            details: String(meta.details || ''),
            actorEmail: r.actorEmail || undefined,
            actorRole: meta.actorRole ? String(meta.actorRole) : undefined,
            createdAt: created.toISOString(),
            timestamp: created.getTime()
          };
        });
      }
    } catch (err) {
      console.error('[getAuditLogs:Prisma]', err);
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
