import { ExcelSheetKey, GenericGridRow } from '@/components/excel-grid/excel-grid-types';
import { findHcmuteUnit } from '@/configs/hcmute-units';
import { buildDefaultGridWorkbook } from '@/components/excel-grid/excel-grid-defaults';
import fs from 'fs';
import path from 'path';

export interface ServerParticipant {
  id: string;
  sessionId: string;
  workbookId: string;
  displayName: string;
  email: string;
  emailNormalized: string;
  roleLabel: string;
  startedAt: string;
  updatedAt: string;
}

export interface ServerRevision {
  id: string;
  workbookId: string;
  revision: number;
  data: Record<ExcelSheetKey, GenericGridRow[]>;
  actorEmail: string;
  actorTitle?: string;
  sessionId?: string;
  changeSummary?: string;
  createdAt: string;
}

export interface ServerWorkbook {
  id: string;
  unitId: string;
  unitNameVi: string;
  reportingPeriod: string;
  status: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'archived';
  currentRevision: number;
  data: Record<ExcelSheetKey, GenericGridRow[]>;
  touchedCells: string[];
  createdAt: string;
  updatedAt: string;
  participants: ServerParticipant[];
  revisions: ServerRevision[];
  isDeleted?: boolean;
}

export function normalizeEmail(raw: string): string {
  let e = (raw || '').trim().toLowerCase();
  if (!e) return '';
  if (!e.includes('@')) return `${e}@hcmute.edu.vn`;
  if (e.endsWith('@hcmute')) return `${e}.edu.vn`;
  return e;
}

// Đường dẫn lưu trữ dữ liệu bền vững phía máy chủ
const DATA_DIR = process.env.VERCEL ? '/tmp/vtvl_data' : path.join(process.cwd(), '.data');
const STORE_FILE = path.join(DATA_DIR, 'server_workbooks.json');
let memoryWorkbooks: Map<string, ServerWorkbook> | null = null;

function ensureDataDir(): void {
  try { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); } catch { /* ignore */ }
}

function loadStore(): Map<string, ServerWorkbook> {
  if (memoryWorkbooks) return memoryWorkbooks;
  memoryWorkbooks = new Map();
  try {
    ensureDataDir();
    if (fs.existsSync(STORE_FILE)) {
      const list: ServerWorkbook[] = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
      list.forEach((wb) => memoryWorkbooks!.set(wb.id, wb));
    }
  } catch { /* ignore fallback */ }
  return memoryWorkbooks;
}

function persistStore(): void {
  if (!memoryWorkbooks) return;
  try {
    ensureDataDir();
    fs.writeFileSync(STORE_FILE, JSON.stringify(Array.from(memoryWorkbooks.values()), null, 2), 'utf8');
  } catch { /* ignore */ }
}

export function getOrCreateWorkbook(
  unitId: string,
  reportingPeriod = '01/10/2025–30/9/2026',
  email = 'tcns@hcmute.edu.vn',
  roleLabel = 'Chuyên viên'
): ServerWorkbook {
  const store = loadStore();
  const normEmail = normalizeEmail(email);
  const existing = Array.from(store.values()).find(
    (w) => !w.isDeleted && w.unitId === unitId && w.reportingPeriod === reportingPeriod
  );
  const now = new Date().toLocaleString('vi-VN');
  if (existing) {
    let p = existing.participants.find((x) => x.emailNormalized === normEmail);
    if (!p) {
      existing.participants.push({
        id: `part_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        sessionId: `sess_${Date.now()}`,
        workbookId: existing.id,
        displayName: roleLabel,
        email,
        emailNormalized: normEmail,
        roleLabel,
        startedAt: now,
        updatedAt: now
      });
      persistStore();
    }
    return existing;
  }

  const unit = findHcmuteUnit(unitId);
  const id = `wb_${unitId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const defaultData = buildDefaultGridWorkbook(unitId);
  const newWorkbook: ServerWorkbook = {
    id,
    unitId,
    unitNameVi: unit.nameVi,
    reportingPeriod,
    status: 'draft',
    currentRevision: 1,
    data: defaultData,
    touchedCells: [],
    createdAt: now,
    updatedAt: now,
    participants: [{
      id: `part_${Date.now()}`,
      sessionId: `sess_${Date.now()}`,
      workbookId: id,
      displayName: roleLabel,
      email,
      emailNormalized: normEmail,
      roleLabel,
      startedAt: now,
      updatedAt: now
    }],
    revisions: [{
      id: `rev_${id}_1`,
      workbookId: id,
      revision: 1,
      data: defaultData,
      actorEmail: normEmail,
      actorTitle: roleLabel,
      changeSummary: 'Khởi tạo hồ sơ ban đầu',
      createdAt: now
    }]
  };
  store.set(id, newWorkbook);
  persistStore();
  return newWorkbook;
}

export function findWorkbooksByEmail(email: string): ServerWorkbook[] {
  const store = loadStore();
  const norm = normalizeEmail(email);
  const username = norm.split('@')[0];
  return Array.from(store.values()).filter(
    (w) => !w.isDeleted && w.participants.some(
      (p) => p.emailNormalized === norm || p.emailNormalized.split('@')[0] === username
    )
  );
}

export function getWorkbookById(id: string): ServerWorkbook | null {
  const store = loadStore();
  const wb = store.get(id);
  if (!wb || wb.isDeleted) return null;
  return wb;
}

export function getAllActiveServerWorkbooks(): ServerWorkbook[] {
  const store = loadStore();
  return Array.from(store.values())
    .filter((w) => !w.isDeleted)
    .sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));
}

export function saveServerWorkbook(params: {
  workbookId: string;
  baseRevision: number;
  data: Record<ExcelSheetKey, GenericGridRow[]>;
  actorEmail: string;
  actorTitle?: string;
  touchedCells?: string[];
  changeSummary?: string;
}): { success: boolean; conflict?: boolean; currentRevision?: number; serverWorkbook?: ServerWorkbook } {
  const store = loadStore();
  const wb = store.get(params.workbookId);
  if (!wb || wb.isDeleted) return { success: false };

  // Khóa lạc quan (Optimistic Concurrency Check)
  if (params.baseRevision > 0 && wb.currentRevision !== params.baseRevision) {
    return {
      success: false,
      conflict: true,
      currentRevision: wb.currentRevision,
      serverWorkbook: wb
    };
  }

  const now = new Date().toLocaleString('vi-VN');
  const normEmail = normalizeEmail(params.actorEmail);
  const nextRev = wb.currentRevision + 1;

  wb.currentRevision = nextRev;
  wb.data = params.data;
  wb.updatedAt = now;
  if (params.touchedCells) wb.touchedCells = params.touchedCells;

  // Cập nhật participant
  let p = wb.participants.find((x) => x.emailNormalized === normEmail);
  if (!p) {
    p = {
      id: `part_${Date.now()}`,
      sessionId: `sess_${Date.now()}`,
      workbookId: wb.id,
      displayName: params.actorTitle || 'Chuyên viên',
      email: params.actorEmail,
      emailNormalized: normEmail,
      roleLabel: params.actorTitle || 'Chuyên viên',
      startedAt: now,
      updatedAt: now
    };
    wb.participants.push(p);
  } else {
    p.updatedAt = now;
    if (params.actorTitle) p.roleLabel = params.actorTitle;
  }

  // Ghi nhận revision (giữ tối đa 15 revision gần nhất)
  const revItem: ServerRevision = {
    id: `rev_${wb.id}_${nextRev}`,
    workbookId: wb.id,
    revision: nextRev,
    data: params.data,
    actorEmail: normEmail,
    actorTitle: params.actorTitle,
    changeSummary: params.changeSummary || `Cập nhật lần ${nextRev}`,
    createdAt: now
  };
  wb.revisions.unshift(revItem);
  if (wb.revisions.length > 15) wb.revisions = wb.revisions.slice(0, 15);

  persistStore();
  return { success: true, currentRevision: nextRev, serverWorkbook: wb };
}

export function rollbackServerWorkbookRevision(
  workbookId: string,
  targetRevision: number,
  actorEmail: string
): { success: boolean; currentRevision?: number } {
  const store = loadStore();
  const wb = store.get(workbookId);
  if (!wb || wb.isDeleted) return { success: false };

  const targetRevItem = wb.revisions.find((r) => r.revision === targetRevision);
  if (!targetRevItem) return { success: false };

  const now = new Date().toLocaleString('vi-VN');
  const nextRev = wb.currentRevision + 1;

  wb.currentRevision = nextRev;
  wb.data = targetRevItem.data;
  wb.updatedAt = now;

  wb.revisions.unshift({
    id: `rev_${wb.id}_${nextRev}`,
    workbookId: wb.id,
    revision: nextRev,
    data: targetRevItem.data,
    actorEmail: normalizeEmail(actorEmail),
    changeSummary: `Khôi phục từ phiên bản #${targetRevision}`,
    createdAt: now
  });

  persistStore();
  return { success: true, currentRevision: nextRev };
}

export function deleteServerWorkbook(workbookId: string): boolean {
  const store = loadStore();
  const wb = store.get(workbookId);
  if (!wb) return false;
  wb.isDeleted = true;
  persistStore();
  return true;
}
