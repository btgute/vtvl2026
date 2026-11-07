import { syncActivityToSupabase } from '@/services/supabase/vtvl-sync';

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  unitCode: string;
  unitName: string;
  action: 'TAO_TEP' | 'NAP_PHIEU' | 'BAM_GIO' | 'RA_SOAT';
  details: string;
}

const STORAGE_KEY = 'hcmute_vtvl_activity_logs_v1';

export function recordActivity(
  unitCode: string,
  unitName: string,
  action: ActivityLogEntry['action'],
  details: string
): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const list: ActivityLogEntry[] = raw ? JSON.parse(raw) : [];
    const entry: ActivityLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toLocaleString('vi-VN'),
      unitCode,
      unitName,
      action,
      details
    };
    const updated = [entry, ...list].slice(0, 50);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('vtvl-activity-updated'));
    void syncActivityToSupabase(unitCode, unitName, action, details);
  } catch (err) {
    console.error('Failed to record VTVL activity:', err);
  }
}

export function getActivityLogs(): ActivityLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

