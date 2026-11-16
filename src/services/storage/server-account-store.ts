import fs from 'fs';
import path from 'path';
import { findHcmuteUnit } from '@/configs/hcmute-units';
import { isPostgresConfigured, pgQuery } from './postgres-pool';
import {
  getAllActiveServerWorkbooks,
  normalizeEmail,
  syncServerWorkbooksFromPostgres
} from './server-workbook-store';

export type UserRole = 'admin' | 'unit_leader' | 'editor' | 'viewer';

export interface UserAccountRecord {
  email: string;
  displayName: string;
  unitCode: string;
  unitNameVi: string;
  title: string;
  role: UserRole;
  authProvider: 'google' | 'email';
  avatarUrl?: string;
  status: 'active' | 'suspended';
  hasSelectedUnit?: boolean;
  createdAt: string;
  lastActiveAt: string;
}

const VALID_ROLES: UserRole[] = ['admin', 'unit_leader', 'editor', 'viewer'];
const DATA_DIR = process.env.VERCEL ? '/tmp/vtvl_data' : path.join(process.cwd(), '.data');
const ACCOUNTS_FILE = path.join(DATA_DIR, 'server_accounts.json');

let memoryAccounts: Map<string, UserAccountRecord> | null = null;
let lastPgSyncAt = 0;

function isValidRole(role: unknown): role is UserRole {
  return typeof role === 'string' && VALID_ROLES.includes(role as UserRole);
}

function normalizeRecord(item: Partial<UserAccountRecord> & { email: string }): UserAccountRecord {
  const email = normalizeEmail(item.email);
  const unit = findHcmuteUnit(item.unitCode || 'FIT');
  const now = new Date().toLocaleString('vi-VN');
  const isTcns = email === 'tcns@hcmute.edu.vn';
  return {
    email,
    displayName: (item.displayName || email.split('@')[0]).trim(),
    unitCode: unit.code,
    unitNameVi: unit.nameVi,
    title: (item.title || (isTcns ? 'Trưởng phòng' : 'Chuyên viên')).trim(),
    role: isValidRole(item.role) ? item.role : isTcns ? 'admin' : 'editor',
    authProvider: item.authProvider === 'google' ? 'google' : 'email',
    avatarUrl: item.avatarUrl,
    status: item.status === 'suspended' ? 'suspended' : 'active',
    hasSelectedUnit: item.hasSelectedUnit !== undefined ? Boolean(item.hasSelectedUnit) : isTcns,
    createdAt: item.createdAt || now,
    lastActiveAt: item.lastActiveAt || now
  };
}

function seedFromWorkbooks(store: Map<string, UserAccountRecord>): boolean {
  let changed = false;
  const now = new Date().toLocaleString('vi-VN');
  if (!store.has('tcns@hcmute.edu.vn')) {
    store.set('tcns@hcmute.edu.vn', normalizeRecord({
      email: 'tcns@hcmute.edu.vn',
      displayName: 'Quản trị Phòng Tổ chức – Nhân sự',
      unitCode: 'TCNS',
      title: 'Trưởng phòng',
      role: 'admin',
      authProvider: 'google',
      hasSelectedUnit: true,
      createdAt: now,
      lastActiveAt: now
    }));
    changed = true;
  }
  for (const wb of getAllActiveServerWorkbooks()) {
    for (const p of wb.participants || []) {
      const email = normalizeEmail(p.emailNormalized || p.email);
      if (!email || store.has(email)) continue;
      store.set(email, normalizeRecord({
        email,
        displayName: p.displayName || email.split('@')[0],
        unitCode: wb.unitId || 'FIT',
        title: p.roleLabel || 'Chuyên viên',
        createdAt: p.startedAt || now,
        lastActiveAt: p.updatedAt || now
      }));
      changed = true;
    }
  }
  return changed;
}

function loadStore(): Map<string, UserAccountRecord> {
  if (memoryAccounts) return memoryAccounts;
  memoryAccounts = new Map();
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(ACCOUNTS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8'));
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          const email = normalizeEmail(item?.email || '');
          if (email) memoryAccounts.set(email, normalizeRecord({ ...item, email }));
        }
      }
    }
  } catch { /* ignore */ }
  if (seedFromWorkbooks(memoryAccounts)) persistLocalStore();
  return memoryAccounts;
}

function persistLocalStore(): void {
  if (!memoryAccounts) return;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(Array.from(memoryAccounts.values()), null, 2), 'utf8');
  } catch { /* ignore */ }
}

async function persistAccountToPostgres(acc: UserAccountRecord): Promise<void> {
  if (!isPostgresConfigured()) return;
  try {
    await pgQuery(
      `INSERT INTO public.user_accounts (
         email, display_name, unit_code, unit_name_vi, title, role,
         auth_provider, avatar_url, status, has_selected_unit, last_active_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now())
       ON CONFLICT (email) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         unit_code = EXCLUDED.unit_code,
         unit_name_vi = EXCLUDED.unit_name_vi,
         title = EXCLUDED.title,
         role = EXCLUDED.role,
         auth_provider = EXCLUDED.auth_provider,
         avatar_url = COALESCE(EXCLUDED.avatar_url, public.user_accounts.avatar_url),
         status = EXCLUDED.status,
         has_selected_unit = EXCLUDED.has_selected_unit,
         last_active_at = now()`,
      [
        acc.email,
        acc.displayName,
        acc.unitCode,
        acc.unitNameVi,
        acc.title,
        acc.role,
        acc.authProvider,
        acc.avatarUrl || null,
        acc.status,
        Boolean(acc.hasSelectedUnit)
      ]
    );
  } catch (err) {
    console.error('[persistAccountToPostgres]', err);
  }
}

export async function syncAccountsFromPostgres(force = false): Promise<void> {
  const store = loadStore();
  const now = Date.now();
  if (!force && now - lastPgSyncAt < 2000) return;
  lastPgSyncAt = now;

  try {
    await syncServerWorkbooksFromPostgres();
    if (seedFromWorkbooks(store)) persistLocalStore();
  } catch { /* ignore */ }

  if (!isPostgresConfigured()) return;
  try {
    const res = await pgQuery<{
      email: string;
      display_name: string;
      unit_code: string;
      unit_name_vi: string;
      title: string;
      role: UserRole;
      auth_provider: 'google' | 'email';
      avatar_url: string | null;
      status: 'active' | 'suspended';
      has_selected_unit: boolean;
      created_at: Date;
      last_active_at: Date;
    }>(`
      SELECT email, display_name, unit_code, unit_name_vi, title, role,
             auth_provider, avatar_url, status,
             coalesce(has_selected_unit, false) AS has_selected_unit,
             created_at, last_active_at
      FROM public.user_accounts
      ORDER BY last_active_at DESC
    `);

    let changed = false;
    for (const row of res?.rows || []) {
      const email = normalizeEmail(row.email);
      if (!email) continue;
      store.set(email, normalizeRecord({
        email,
        displayName: row.display_name,
        unitCode: row.unit_code,
        unitNameVi: row.unit_name_vi,
        title: row.title,
        role: row.role,
        authProvider: row.auth_provider,
        avatarUrl: row.avatar_url || undefined,
        status: row.status,
        hasSelectedUnit: row.has_selected_unit,
        createdAt: new Date(row.created_at).toLocaleString('vi-VN'),
        lastActiveAt: new Date(row.last_active_at).toLocaleString('vi-VN')
      }));
      changed = true;
    }
    if (changed) persistLocalStore();
  } catch (err) {
    console.error('[syncAccountsFromPostgres]', err);
  }
}

export function getAllUserAccounts(): UserAccountRecord[] {
  const roleWeight: Record<UserRole, number> = { admin: 0, unit_leader: 1, editor: 2, viewer: 3 };
  return Array.from(loadStore().values()).sort((a, b) => roleWeight[a.role] - roleWeight[b.role] || a.email.localeCompare(b.email));
}

export function getUserAccountByEmail(email: string): UserAccountRecord | null {
  const norm = normalizeEmail(email);
  return norm ? loadStore().get(norm) || null : null;
}

export function upsertUserAccount(
  input: Partial<UserAccountRecord> & { email: string },
  allowRoleOverride = false
): UserAccountRecord {
  const store = loadStore();
  const norm = normalizeEmail(input.email);
  const existing = store.get(norm);
  const resolvedRole: UserRole =
    allowRoleOverride && isValidRole(input.role)
      ? input.role
      : existing?.role || (norm === 'tcns@hcmute.edu.vn' ? 'admin' : isValidRole(input.role) ? input.role : 'editor');

  const record = normalizeRecord({
    ...existing,
    ...input,
    email: norm,
    role: resolvedRole,
    createdAt: existing?.createdAt || new Date().toLocaleString('vi-VN'),
    lastActiveAt: new Date().toLocaleString('vi-VN')
  });

  store.set(norm, record);
  persistLocalStore();
  persistAccountToPostgres(record).catch(() => {});
  return record;
}

export function updateUserAccountRole(
  email: string,
  role: UserRole,
  updates?: Partial<Pick<UserAccountRecord, 'unitCode' | 'title' | 'displayName' | 'status'>>
): UserAccountRecord | null {
  const norm = normalizeEmail(email);
  return !isValidRole(role) || !norm ? null : upsertUserAccount({ email: norm, role, ...updates }, true);
}

export function deleteUserAccount(email: string): boolean {
  const store = loadStore();
  const norm = normalizeEmail(email);
  if (!norm || !store.delete(norm)) return false;
  persistLocalStore();
  if (isPostgresConfigured()) {
    pgQuery('DELETE FROM public.user_accounts WHERE email = $1', [norm]).catch(() => {});
  }
  return true;
}
