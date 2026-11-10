'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  OperatorSession,
  getCurrentOperatorSession,
  saveCurrentOperatorSession,
  updateOperatorSessionUnit,
  clearCurrentOperatorSession,
  getSessionByEmail,
  saveEmailSessionData,
  normalizeEmail
} from '@/services/telemetry/operator-session';
import { saveLocalDraft, queueOfflineSync } from '@/services/storage/indexeddb-storage';
import { saveActiveUnitSession } from '@/services/telemetry/activity-log';
import { ExcelSheetKey, GenericGridRow } from './excel-grid-types';

export type SyncStatusKind = 'synced' | 'saving' | 'offline' | 'conflict' | 'unsaved';

export function useOperatorSession() {
  const [session, setSession] = useState<OperatorSession | null>(null);
  const [workbookId, setWorkbookId] = useState<string | null>(null);
  const [currentRevision, setCurrentRevision] = useState<number>(1);
  const [syncStatus, setSyncStatus] = useState<SyncStatusKind>('synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [conflictData, setConflictData] = useState<any | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [touchedCells, setTouchedCells] = useState<Set<string>>(new Set());
  const [isRestoredSession, setIsRestoredSession] = useState<boolean>(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const sync = () => {
      const cur = getCurrentOperatorSession();
      if (cur) {
        setSession(cur);
        const saved = getSessionByEmail(cur.email);
        if (saved?.touchedCells) setTouchedCells(new Set(saved.touchedCells));
      } else {
        setIsModalOpen(true);
      }
    };
    sync();
    window.addEventListener('vtvl-operator-changed', sync);
    return () => window.removeEventListener('vtvl-operator-changed', sync);
  }, []);

  const markCellTouched = useCallback((cellKey: string) => {
    setTouchedCells((prev) => {
      if (prev.has(cellKey)) return prev;
      const next = new Set(prev);
      next.add(cellKey);
      return next;
    });
    setSyncStatus('unsaved');
  }, []);

  const updateSessionUnit = useCallback((newUnitCode: string) => {
    const updated = updateOperatorSessionUnit(newUnitCode);
    if (updated) {
      setSession(updated);
      setWorkbookId(null);
      saveActiveUnitSession({
        unitCode: newUnitCode,
        actorEmail: updated.email,
        actorTitle: updated.title
      });
    }
  }, []);

  const submitSession = useCallback(async (
    email: string,
    unitCode: string,
    title: string,
    chosenWorkbookId?: string
  ): Promise<{ restoredData: Record<ExcelSheetKey, GenericGridRow[]> | null; isExisting: boolean }> => {
    const norm = normalizeEmail(email) || email;
    const newSession = saveCurrentOperatorSession(norm, unitCode, title);
    setSession(newSession);
    setIsModalOpen(false);

    saveActiveUnitSession({
      unitCode: newSession.unitCode,
      actorEmail: newSession.email,
      actorTitle: newSession.title
    });

    let targetWorkbookId = chosenWorkbookId;

    if (!targetWorkbookId) {
      try {
        const res = await fetch('/api/workbooks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            unitCode,
            reportingPeriod: '01/10/2025–30/9/2026',
            email: norm,
            displayName: norm.split('@')[0],
            roleLabel: title
          })
        });
        if (res.ok) {
          const json = await res.json();
          if (json.workbook) {
            targetWorkbookId = json.workbook.id;
            setWorkbookId(json.workbook.id);
            setCurrentRevision(json.workbook.currentRevision || 1);
            if (json.workbook.data && Object.keys(json.workbook.data).length > 0) {
              setIsRestoredSession(true);
              setSyncStatus('synced');
              setLastSyncedAt(new Date().toLocaleTimeString('vi-VN'));
              return { restoredData: json.workbook.data, isExisting: true };
            }
          }
        }
      } catch { /* offline fallback */ }
    } else {
      setWorkbookId(targetWorkbookId);
      try {
        const res = await fetch(`/api/workbooks/${targetWorkbookId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.workbook) {
            setCurrentRevision(json.workbook.currentRevision || 1);
            if (json.workbook.data) {
              setIsRestoredSession(true);
              setSyncStatus('synced');
              setLastSyncedAt(new Date().toLocaleTimeString('vi-VN'));
              return { restoredData: json.workbook.data, isExisting: true };
            }
          }
        }
      } catch { /* offline */ }
    }

    const savedRecord = getSessionByEmail(norm, true);
    if (savedRecord?.data) {
      setIsRestoredSession(true);
      if (savedRecord.touchedCells) setTouchedCells(new Set(savedRecord.touchedCells));
      return { restoredData: savedRecord.data, isExisting: true };
    }

    setIsRestoredSession(false);
    setTouchedCells(new Set());
    return { restoredData: null, isExisting: false };
  }, []);

  const persistDataForSession = useCallback(async (
    data: Record<ExcelSheetKey, GenericGridRow[]>,
    forceImmediate = false
  ) => {
    if (!session) return;
    setSyncStatus('saving');

    const touchedArray = Array.from(touchedCells);
    saveEmailSessionData(session.email, session.unitCode, session.title, data, touchedArray);

    saveLocalDraft({
      id: workbookId || `draft_${session.unitCode}_${session.email}`,
      unitCode: session.unitCode,
      reportingPeriod: '01/10/2025–30/9/2026',
      operatorEmail: session.email,
      data,
      touchedCells: touchedArray,
      clientSavedAt: new Date().toISOString(),
      clientTimestamp: Date.now(),
      serverRevision: currentRevision,
      isDirty: false
    });

    const runServerSave = async () => {
      const activeWbId = workbookId || `wb_${session.unitCode}_2026`;
      try {
        const res = await fetch(`/api/workbooks/${activeWbId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data,
            touchedCells: touchedArray,
            baseRevision: currentRevision,
            commitMessage: `Lưu tự động lúc ${new Date().toLocaleTimeString('vi-VN')}`,
            participant: {
              email: session.email,
              displayName: session.email.split('@')[0],
              roleLabel: session.title
            }
          })
        });

        if (res.status === 409) {
          const json = await res.json();
          setSyncStatus('conflict');
          setConflictData(json.currentServerWorkbook);
          return;
        }

        if (res.ok) {
          const json = await res.json();
          if (json.workbook?.currentRevision) {
            setCurrentRevision(json.workbook.currentRevision);
          }
          setSyncStatus('synced');
          setLastSyncedAt(new Date().toLocaleTimeString('vi-VN'));
        } else {
          setSyncStatus('offline');
        }
      } catch {
        setSyncStatus('offline');
        queueOfflineSync({
          id: `queue_${Date.now()}`,
          workbookId: activeWbId,
          baseRevision: currentRevision,
          data,
          touchedCells: touchedArray,
          queuedAt: Date.now(),
          operatorEmail: session.email
        });
      }
    };

    if (forceImmediate) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      await runServerSave();
    } else {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(runServerSave, 1500);
    }
  }, [session, workbookId, currentRevision, touchedCells]);

  const switchSession = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);
  const logoutSession = useCallback(() => {
    clearCurrentOperatorSession();
    setSession(null);
    setWorkbookId(null);
    setTouchedCells(new Set());
    setIsModalOpen(true);
  }, []);

  return {
    session,
    workbookId,
    currentRevision,
    syncStatus,
    lastSyncedAt,
    conflictData,
    isModalOpen,
    touchedCells,
    isRestoredSession,
    markCellTouched,
    submitSession,
    updateSessionUnit,
    switchSession,
    closeModal,
    logoutSession,
    persistDataForSession
  };
}
