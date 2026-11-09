import { HCMUTE_UNITS } from '@/configs/hcmute-units';
import { GenericGridRow, ExcelSheetKey } from '@/components/excel-grid/excel-grid-types';

export interface OperatorSession {
  email: string;
  unitCode: string;
  unitNameVi: string;
  title: string;
  startedAt: string;
  lastActiveAt: string;
}

export interface EmailSessionRecord {
  email: string;
  unitCode: string;
  unitNameVi: string;
  title: string;
  lastSavedAt: string;
  data: Record<ExcelSheetKey, GenericGridRow[]>;
  touchedCells: string[]; // Danh sách các ô `${rowId}_${field}` đã thao tác
}

const CURRENT_OPERATOR_KEY = 'hcmute_vtvl_current_operator_v1';
const EMAIL_RECORDS_KEY = 'hcmute_vtvl_email_sessions_v1';

export function getCurrentOperatorSession(): OperatorSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CURRENT_OPERATOR_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCurrentOperatorSession(
  email: string,
  unitCode: string,
  title: string
): OperatorSession {
  const unit = HCMUTE_UNITS.find((u) => u.code === unitCode) || HCMUTE_UNITS[0];
  const now = new Date().toLocaleString('vi-VN');
  const session: OperatorSession = {
    email: email.trim().toLowerCase(),
    unitCode,
    unitNameVi: unit.nameVi,
    title: title.trim(),
    startedAt: now,
    lastActiveAt: now
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(CURRENT_OPERATOR_KEY, JSON.stringify(session));
    window.dispatchEvent(new CustomEvent('vtvl-operator-changed', { detail: session }));
  }
  return session;
}

export function clearCurrentOperatorSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CURRENT_OPERATOR_KEY);
    window.dispatchEvent(new CustomEvent('vtvl-operator-changed', { detail: null }));
  }
}

export function getAllEmailSessions(): EmailSessionRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EMAIL_RECORDS_KEY);
    if (!raw) return [];
    const list: EmailSessionRecord[] = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function getSessionByEmail(email: string): EmailSessionRecord | null {
  const normEmail = email.trim().toLowerCase();
  const all = getAllEmailSessions();
  return all.find((s) => s.email === normEmail) || null;
}

export function saveEmailSessionData(
  email: string,
  unitCode: string,
  title: string,
  data: Record<ExcelSheetKey, GenericGridRow[]>,
  touchedCells: string[]
): void {
  if (typeof window === 'undefined') return;
  const normEmail = email.trim().toLowerCase();
  const unit = HCMUTE_UNITS.find((u) => u.code === unitCode) || HCMUTE_UNITS[0];
  const now = new Date().toLocaleString('vi-VN');

  const newRecord: EmailSessionRecord = {
    email: normEmail,
    unitCode,
    unitNameVi: unit.nameVi,
    title: title.trim(),
    lastSavedAt: now,
    data,
    touchedCells
  };

  try {
    const all = getAllEmailSessions().filter((s) => s.email !== normEmail);
    all.unshift(newRecord); // Đưa phiên gần nhất lên đầu
    // Giới hạn lưu tối đa 20 email gần nhất
    const trimmed = all.slice(0, 20);
    localStorage.setItem(EMAIL_RECORDS_KEY, JSON.stringify(trimmed));
  } catch {
    /* ignore storage errors */
  }
}

