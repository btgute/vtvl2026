'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  OperatorSession,
  EmailSessionRecord,
  getCurrentOperatorSession,
  saveCurrentOperatorSession,
  updateOperatorSessionUnit,
  clearCurrentOperatorSession,
  getSessionByEmail,
  saveEmailSessionData
} from '@/services/telemetry/operator-session';
import { saveActiveUnitSession } from '@/services/telemetry/activity-log';
import { ExcelSheetKey, GenericGridRow } from './excel-grid-types';

export function useOperatorSession() {
  const [session, setSession] = useState<OperatorSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [touchedCells, setTouchedCells] = useState<Set<string>>(new Set());
  const [isRestoredSession, setIsRestoredSession] = useState<boolean>(false);

  // Khởi tạo từ localStorage & lắng nghe sự kiện đồng bộ
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
  }, []);

  const updateSessionUnit = useCallback((newUnitCode: string) => {
    const updated = updateOperatorSessionUnit(newUnitCode);
    if (updated) {
      setSession(updated);
      saveActiveUnitSession({
        unitCode: newUnitCode,
        actorEmail: updated.email,
        actorTitle: updated.title
      });
    }
  }, []);

  const submitSession = useCallback((
    email: string,
    unitCode: string,
    title: string
  ): { restoredData: Record<ExcelSheetKey, GenericGridRow[]> | null; isExisting: boolean } => {
    const savedRecord = getSessionByEmail(email, true);
    const chosenUnit = savedRecord ? savedRecord.unitCode : unitCode;
    const chosenTitle = savedRecord ? savedRecord.title : title;
    const newSession = saveCurrentOperatorSession(email, chosenUnit, chosenTitle);
    setSession(newSession);
    setIsModalOpen(false);

    saveActiveUnitSession({
      unitCode: newSession.unitCode,
      actorEmail: newSession.email,
      actorTitle: newSession.title
    });

    if (savedRecord && savedRecord.data) {
      setIsRestoredSession(true);
      if (savedRecord.touchedCells) {
        setTouchedCells(new Set(savedRecord.touchedCells));
      }
      return { restoredData: savedRecord.data, isExisting: true };
    }

    setIsRestoredSession(false);
    setTouchedCells(new Set());
    return { restoredData: null, isExisting: false };
  }, []);

  const switchSession = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const logoutSession = useCallback(() => {
    clearCurrentOperatorSession();
    setSession(null);
    setTouchedCells(new Set());
    setIsModalOpen(true);
  }, []);

  const persistDataForSession = useCallback((
    data: Record<ExcelSheetKey, GenericGridRow[]>
  ) => {
    if (!session) return;
    saveEmailSessionData(
      session.email,
      session.unitCode,
      session.title,
      data,
      Array.from(touchedCells)
    );
  }, [session, touchedCells]);

  return {
    session,
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

