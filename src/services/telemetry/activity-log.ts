import { HCMUTE_UNITS } from '@/configs/hcmute-units';
import { buildDefaultProposedPositionsForUnit } from '@/configs/hcmute-nd232-catalog';
import { HcmuteUnit, ProposedVtvlRow, UnitGroupKind } from '@/types/vtvl';
import { syncActivityToSupabase } from '@/services/supabase/vtvl-sync';

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  unitCode: string;
  unitName: string;
  actorEmail?: string;
  actorTitle?: string;
  action: 'TAO_TEP' | 'NAP_PHIEU' | 'BAM_GIO' | 'RA_SOAT' | 'CHON_DON_VI' | 'LUU_NHAP';
  details: string;
}

export interface ActiveUnitSession {
  unitCode: string;
  kind: UnitGroupKind;
  customDate: string;
  actorEmail: string;
  actorTitle: string;
  activeStep: number;
  wizardStage: 1 | 2 | 3 | 4 | 5;
  lastSavedAt: string;
  ngachOverrides: Record<string, number>;
  customPositionNames: Record<string, string>;
  customCareerLevels: Record<string, string>;
  proposedPositions: ProposedVtvlRow[];
  previousPositionsSnapshot?: ProposedVtvlRow[];
}

const STORAGE_KEY = 'hcmute_vtvl_activity_logs_v1';
const UNIT_SESSION_KEY = 'hcmute_vtvl_active_unit_session_v2';

let cachedUnitCode = '';
let cachedRootWorkbookFile: File | null = null;
let cachedMergedWorkbookFile: File | null = null;
let cachedSurveyFormFiles: File[] = [];

function formatCurrentHHMM(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function createDefaultSession(unit: HcmuteUnit = HCMUTE_UNITS[0]): ActiveUnitSession {
  return {
    unitCode: unit.code,
    kind: unit.group,
    customDate: '2026-11-07',
    actorEmail: '',
    actorTitle: '',
    activeStep: 1,
    wizardStage: 1,
    lastSavedAt: formatCurrentHHMM(),
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
    const stage = ([1, 2, 3, 4, 5] as const).includes(parsed.wizardStage as 1 | 2 | 3 | 4 | 5)
      ? (parsed.wizardStage as 1 | 2 | 3 | 4 | 5)
      : 1;
    return {
      unitCode: unit.code,
      kind: unit.group,
      customDate: parsed.customDate || '2026-11-07',
      actorEmail: parsed.actorEmail || '',
      actorTitle: parsed.actorTitle || '',
      activeStep: parsed.activeStep || 1,
      wizardStage: stage,
      lastSavedAt: parsed.lastSavedAt || formatCurrentHHMM(),
      ngachOverrides: parsed.ngachOverrides || {},
      customPositionNames: parsed.customPositionNames || {},
      customCareerLevels: parsed.customCareerLevels || {},
      proposedPositions: proposed,
      previousPositionsSnapshot: parsed.previousPositionsSnapshot
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
    actorEmail: partial.actorEmail ?? current.actorEmail,
    actorTitle: partial.actorTitle ?? current.actorTitle,
    activeStep: partial.activeStep ?? current.activeStep,
    wizardStage: partial.wizardStage ?? current.wizardStage,
    lastSavedAt: formatCurrentHHMM(),
    ngachOverrides: partial.ngachOverrides ?? (isSameUnit ? current.ngachOverrides : {}),
    customPositionNames: partial.customPositionNames ?? (isSameUnit ? current.customPositionNames : {}),
    customCareerLevels: partial.customCareerLevels ?? (isSameUnit ? current.customCareerLevels : {}),
    proposedPositions:
      partial.proposedPositions ??
      (isSameUnit
        ? current.proposedPositions
        : buildDefaultProposedPositionsForUnit(matchedUnit.nameVi, matchedUnit.group)),
    previousPositionsSnapshot:
      partial.previousPositionsSnapshot !== undefined
        ? partial.previousPositionsSnapshot
        : current.previousPositionsSnapshot
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
    } catch {
      // Bỏ qua lỗi bộ nhớ trình duyệt đầy, không ghi thông tin cá nhân ra console
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
  details: string,
  actorOverride?: { actorEmail?: string; actorTitle?: string }
): void {
  if (typeof window === 'undefined') return;
  try {
    const session = getActiveUnitSession();
    const actorEmail = (actorOverride?.actorEmail ?? session.actorEmail ?? '').trim();
    const actorTitle = (actorOverride?.actorTitle ?? session.actorTitle ?? '').trim();
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const list: ActivityLogEntry[] = raw ? JSON.parse(raw) : [];
    const entry: ActivityLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toLocaleString('vi-VN'),
      unitCode,
      unitName,
      actorEmail,
      actorTitle,
      action,
      details
    };
    const updated = [entry, ...list].slice(0, 80);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('vtvl-activity-updated'));
    void syncActivityToSupabase(unitCode, unitName, action, details, actorEmail, actorTitle);
  } catch {
    // Không ghi dữ liệu cá nhân ra console
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
