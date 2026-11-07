import { HCMUTE_UNITS } from '@/configs/hcmute-units';
import { buildDefaultProposedPositionsForUnit } from '@/configs/hcmute-nd232-catalog';
import { HcmuteUnit, ProposedVtvlRow, UnitGroupKind } from '@/types/vtvl';
import { syncActivityToSupabase } from '@/services/supabase/vtvl-sync';

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  unitCode: string;
  unitName: string;
  action: 'TAO_TEP' | 'NAP_PHIEU' | 'BAM_GIO' | 'RA_SOAT';
  details: string;
}

export interface ActiveUnitSession {
  unitCode: string;
  kind: UnitGroupKind;
  customDate: string;
  ngachOverrides: Record<string, number>;
  customPositionNames: Record<string, string>;
  customCareerLevels: Record<string, string>;
  proposedPositions: ProposedVtvlRow[];
}

const STORAGE_KEY = 'hcmute_vtvl_activity_logs_v1';
const UNIT_SESSION_KEY = 'hcmute_vtvl_active_unit_session_v2';

let cachedUnitCode = '';
let cachedRootWorkbookFile: File | null = null;
let cachedMergedWorkbookFile: File | null = null;
let cachedSurveyFormFiles: File[] = [];

function createDefaultSession(unit: HcmuteUnit = HCMUTE_UNITS[0]): ActiveUnitSession {
  return {
    unitCode: unit.code,
    kind: unit.group,
    customDate: '2026-11-07',
    ngachOverrides: {},
    customPositionNames: {},
    customCareerLevels: {},
    proposedPositions: buildDefaultProposedPositionsForUnit(unit.nameVi, unit.group)
  };
}

export function getActiveUnitSession(): ActiveUnitSession {
  if (typeof window === 'undefined') return createDefaultSession();
  try {
    const raw = window.localStorage.getItem(UNIT_SESSION_KEY);
    if (!raw) return createDefaultSession();
    const parsed = JSON.parse(raw) as Partial<ActiveUnitSession>;
    const unit = HCMUTE_UNITS.find((u) => u.code === parsed.unitCode) || HCMUTE_UNITS[0];
    const proposed =
      Array.isArray(parsed.proposedPositions) && parsed.proposedPositions.length > 0
        ? parsed.proposedPositions
        : buildDefaultProposedPositionsForUnit(unit.nameVi, unit.group);
    return {
      unitCode: unit.code,
      kind: unit.group,
      customDate: parsed.customDate || '2026-11-07',
      ngachOverrides: parsed.ngachOverrides || {},
      customPositionNames: parsed.customPositionNames || {},
      customCareerLevels: parsed.customCareerLevels || {},
      proposedPositions: proposed
    };
  } catch {
    return createDefaultSession();
  }
}

export function getActiveUnitDefinition(codeOverride?: string): HcmuteUnit {
  const session = getActiveUnitSession();
  const targetCode = codeOverride || session.unitCode;
  return HCMUTE_UNITS.find((u) => u.code === targetCode) || HCMUTE_UNITS[0];
}

export function saveActiveUnitSession(partial: Partial<ActiveUnitSession>): ActiveUnitSession {
  const current = getActiveUnitSession();
  const nextUnitCode = partial.unitCode ?? current.unitCode;
  const matchedUnit = HCMUTE_UNITS.find((u) => u.code === nextUnitCode) || HCMUTE_UNITS[0];
  const isSameUnit = matchedUnit.code === current.unitCode;

  const updated: ActiveUnitSession = {
    unitCode: matchedUnit.code,
    kind: matchedUnit.group,
    customDate: partial.customDate ?? current.customDate,
    ngachOverrides: partial.ngachOverrides ?? (isSameUnit ? current.ngachOverrides : {}),
    customPositionNames: partial.customPositionNames ?? (isSameUnit ? current.customPositionNames : {}),
    customCareerLevels: partial.customCareerLevels ?? (isSameUnit ? current.customCareerLevels : {}),
    proposedPositions:
      partial.proposedPositions ??
      (isSameUnit
        ? current.proposedPositions
        : buildDefaultProposedPositionsForUnit(matchedUnit.nameVi, matchedUnit.group))
  };

  if (!isSameUnit && cachedUnitCode && cachedUnitCode !== matchedUnit.code) {
    cachedRootWorkbookFile = null;
    cachedMergedWorkbookFile = null;
    cachedSurveyFormFiles = [];
  }
  cachedUnitCode = matchedUnit.code;

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(UNIT_SESSION_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('vtvl-unit-session-updated'));
    } catch (err) {
      console.error('Failed to save active unit session:', err);
    }
  }
  return updated;
}

export function setSessionRootWorkbook(unitCode: string, blob: Blob, fileName: string): File {
  cachedUnitCode = unitCode;
  const file = new File([blob], fileName, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  cachedRootWorkbookFile = file;
  return file;
}

export function setSessionMergedWorkbook(unitCode: string, blob: Blob, fileName: string): File {
  cachedUnitCode = unitCode;
  const file = new File([blob], fileName, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  cachedMergedWorkbookFile = file;
  return file;
}

export function addSessionSurveyFormFile(unitCode: string, blob: Blob, fileName: string): File {
  cachedUnitCode = unitCode;
  const file = new File([blob], fileName, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  cachedSurveyFormFiles = [
    ...cachedSurveyFormFiles.filter((f) => f.name !== fileName),
    file
  ];
  return file;
}

export function getSessionFilesForUnit(unitCode: string) {
  if (cachedUnitCode !== unitCode) {
    return { rootFile: null, mergedFile: null, formFiles: [] as File[] };
  }
  return {
    rootFile: cachedRootWorkbookFile,
    mergedFile: cachedMergedWorkbookFile,
    formFiles: cachedSurveyFormFiles
  };
}

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
