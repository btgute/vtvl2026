'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  OperatorSession,
  EmailSessionRecord,
  getCurrentOperatorSession,
  saveCurrentOperatorSession,
  clearCurrentOperatorSession,
  getSessionByEmail,
  saveEmailSessionData
} from '@/services/telemetry/operator-session';
import { ExcelSheetKey, GenericGridRow } from './excel-grid-types';

export function useOperatorSession() {
  const [session, setSession] = useState<OperatorSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [touchedCells, setTouchedCells] = useState<Set<string>>(new Set());
  const [isRestoredSession, setIsRestoredSession] = useState<boolean>(false);

  // Khởi tạo từ localStorage
  useEffect(() => {
    const cur = getCurrentOperatorSession();
    if (cur) {
      setSession(cur);
      const saved = getSessionByEmail(cur.email);
      if (saved?.touchedCells) {
        setTouchedCells(new Set(saved.touchedCells));
      }
    } else {
      setIsModalOpen(true);
    }
  }, []);

  const markCellTouched = useCallback((cellKey: string) => {
    setTouchedCells((prev) => {
      if (prev.has(cellKey)) return prev;
      const next = new Set(prev);
      next.add(cellKey);
      return next;
    });
  }, []);

  const submitSession = useCallback((
    email: string,
    unitCode: string,
    title: string
  ): { restoredData: Record<ExcelSheetKey, GenericGridRow[]> | null; isExisting: boolean } => {
    const savedRecord = getSessionByEmail(email);
    const newSession = saveCurrentOperatorSession(
      email,
      savedRecord ? savedRecord.unitCode : unitCode,
      savedRecord ? savedRecord.title : title
    );
    setSession(newSession);
    setIsModalOpen(false);

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
    switchSession,
    logoutSession,
    persistDataForSession,
    closeModal: () => {
      if (session) setIsModalOpen(false);
    }
  };
}
