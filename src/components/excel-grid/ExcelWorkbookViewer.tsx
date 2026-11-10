'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useExcelGridState } from './excel-grid-state';
import { EXCEL_SHEET_METAS } from './excel-sheet-metas';
import { ExcelSheetTabs } from './ExcelSheetTabs';
import { ExcelTableRenderer } from './ExcelTableRenderer';
import { ScientificWorkspaceCard } from './ScientificWorkspaceCard';
import { GuidanceDrawerModal } from './GuidanceDrawerModal';
import { WorkflowSidebar } from '@/components/layout/MilestonesBar';
import { ExcelSheetKey } from './excel-grid-types';
import { C1AdminStatusBanner, C1AdminLockModal } from './C1AdminLockModal';
import { DataQualityReportModal } from './DataQualityReportModal';
import { OperatorSessionModal } from './OperatorSessionModal';
import { useOperatorSession } from './useOperatorSession';
import { validateWorkbookData } from '@/services/validation';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const getStepFromSheet = (sheet: ExcelSheetKey): number => {
  switch (sheet) {
    case 'A1': return 1;
    case 'A2':
    case 'DM_SP': return 2;
    case 'B1': return 3;
    case 'B2_CT':
    case 'B2': return 4;
    case 'C1':
    case 'C2': return 5;
    case 'C3': return 6;
    case 'D1':
    case 'D2':
    case 'DU_BAO': return 7;
    case 'K':
    case 'T':
    case 'S': return 8;
    default: return 1;
  }
};

const getSheetFromStep = (step: number): ExcelSheetKey => {
  switch (step) {
    case 1: return 'A1';
    case 2: return 'A2';
    case 3: return 'B1';
    case 4: return 'B2_CT';
    case 5: return 'C1';
    case 6: return 'C3';
    case 7: return 'D1';
    case 8: return 'K';
    default: return 'A1';
  }
};

interface ExcelWorkbookViewerProps {
  initialUnitCode?: string;
}

export function ExcelWorkbookViewer({ initialUnitCode = 'TCNS' }: ExcelWorkbookViewerProps) {
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [showGuidanceModal, setShowGuidanceModal] = useState(false);
  const [dirtySheets, setDirtySheets] = useState<Set<ExcelSheetKey>>(new Set());
  const [isSidebarVisible, setIsSidebarVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      try { return localStorage.getItem('hcmute_vtvl_sidebar_visible') === 'true'; } catch { /* ignore */ }
    }
    return false;
  });

  const toggleSidebar = () => {
    const nextVal = !isSidebarVisible;
    setIsSidebarVisible(nextVal);
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('hcmute_vtvl_sidebar_visible', String(nextVal)); } catch { /* ignore */ }
    }
  };

  const markSheetDirty = (sheetKey: ExcelSheetKey) => {
    setDirtySheets((prev) => (prev.has(sheetKey) ? prev : new Set(prev).add(sheetKey)));
  };

  const clearSheetDirty = (sheetKey: ExcelSheetKey) => {
    setDirtySheets((prev) => {
      if (!prev.has(sheetKey)) return prev;
      const next = new Set(prev);
      next.delete(sheetKey);
      return next;
    });
  };

  const {
    session, isModalOpen, touchedCells,
    markCellTouched, submitSession, updateSessionUnit, switchSession, closeModal, persistDataForSession
  } = useOperatorSession();

  const {
    unitCode, currentUnit, orderMode, setOrderMode, currentSheetOrder,
    activeSheet, activeSheetIndex, data, lastSaved, lastSavedSheet,
    isExporting, dynamicOptionsMap, isC1Unlocked, unlockC1, lockC1,
    handleUnitChange: gridHandleUnitChange, handleLoadTcnsData, restoreWorkbookData,
    loadFullPl1Catalog, loadRecommendedVtvls, setActiveSheet,
    updateCell, addRow, splitRow, deleteRow, saveSheetData,
    exportFullWorkbook, goToNextSheet, goToPrevSheet
  } = useExcelGridState(session?.unitCode || initialUnitCode);

  const activeMeta = EXCEL_SHEET_METAS[activeSheet];
  const activeRows = data[activeSheet] || [];

  const handleSave = useCallback(() => {
    saveSheetData(activeSheet);
    persistDataForSession(data);
    clearSheetDirty(activeSheet);
  }, [activeSheet, saveSheetData, persistDataForSession, data]);

  const handleSaveAndNext = useCallback(() => {
    handleSave();
    goToNextSheet();
  }, [handleSave, goToNextSheet]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSave]);

  const handleSelectSheetSafe = (targetKey: ExcelSheetKey) => {
    if (dirtySheets.has(activeSheet)) {
      handleSave();
    }
    setActiveSheet(targetKey);
  };

  const qualityReport = useMemo(() => {
    return validateWorkbookData(data, unitCode, currentUnit.nameVi);
  }, [data, unitCode, currentUnit.nameVi]);

  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden flex flex-col gap-3">
      {/* 1. KHỐI TIÊU ĐỀ & ĐIỀU KHIỂN CHUẨN KHOA HỌC (CARD 1) */}
      <ScientificWorkspaceCard
        activeSheet={activeSheet}
        currentUnit={currentUnit}
        unitCode={unitCode}
        activeStep={getStepFromSheet(activeSheet)}
        activeSheetIndex={activeSheetIndex}
        totalSheets={currentSheetOrder.length}
        rowsCount={activeRows.length}
        isDirty={dirtySheets.has(activeSheet)}
        lastSaved={lastSaved ? new Date() : null}
        qualityReport={qualityReport}
        session={session}
        orderMode={orderMode}
        canNext={activeSheetIndex < currentSheetOrder.length - 1}
        isExporting={isExporting}
        isC1Unlocked={isC1Unlocked}
        onSelectSheet={handleSelectSheetSafe}
        onUnitChange={(u) => { gridHandleUnitChange(u); updateSessionUnit(u); setDirtySheets(new Set()); }}
        onSwitchSession={switchSession}
        onToggleOrderMode={setOrderMode}
        onOpenGuidance={() => setShowGuidanceModal(true)}
        onOpenQualityModal={() => setShowQualityModal(true)}
        onSaveSheet={handleSave}
        onSaveAndNext={handleSaveAndNext}
        onExportWorkbook={exportFullWorkbook}
        onLoadTcnsData={handleLoadTcnsData}
        onLoadRecommendedVtvls={loadRecommendedVtvls}
        onOpenUnlockModal={() => setShowUnlockModal(true)}
      />

      {/* Dải 15 sheet cuộn ngang */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-xs font-semibold text-[#004776] shadow-2xs cursor-pointer shrink-0 transition-colors"
          title={isSidebarVisible ? 'Ẩn quy trình 8 bước để mở rộng bảng' : 'Hiện quy trình 8 bước'}
        >
          {isSidebarVisible ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
          <span>{isSidebarVisible ? 'Thu gọn' : 'Quy trình 8 bước'}</span>
        </button>

        <div className="flex-1 min-w-0">
          <ExcelSheetTabs
            activeSheet={activeSheet}
            sheetOrder={currentSheetOrder}
            orderMode={orderMode}
            dirtySheets={dirtySheets}
            onSelectSheet={handleSelectSheetSafe}
            onPrev={goToPrevSheet}
            onNext={goToNextSheet}
            canPrev={activeSheetIndex > 0}
            canNext={activeSheetIndex < currentSheetOrder.length - 1}
          />
        </div>
      </div>

      {/* 2. KHÔNG GIAN BẢNG DỮ LIỆU CHÍNH (CARD 2) */}
      <div className="flex flex-col lg:flex-row gap-3 items-start w-full max-w-full min-w-0">
        {isSidebarVisible && (
          <div className="w-full shrink-0 transition-all duration-200 lg:w-72">
            <WorkflowSidebar
              activeStep={getStepFromSheet(activeSheet)}
              onSelectStep={(s) => handleSelectSheetSafe(getSheetFromStep(s))}
              unitCode={unitCode}
              alwaysExpanded={true}
              isCollapsed={false}
              onToggleCollapse={() => {}}
            />
          </div>
        )}

        <div className="flex-1 min-w-0 w-full max-w-full flex flex-col gap-3 overflow-hidden">
          {activeSheet === 'C1' && (
            <C1AdminStatusBanner
              isUnlocked={isC1Unlocked}
              onOpenUnlockModal={() => setShowUnlockModal(true)}
              onLock={lockC1}
            />
          )}

          <ExcelTableRenderer
            meta={activeMeta}
            rows={activeRows}
            dynamicOptionsMap={dynamicOptionsMap}
            lastSaved={lastSaved}
            lastSavedSheet={lastSavedSheet}
            isC1Unlocked={isC1Unlocked}
            touchedCells={touchedCells}
            onCellTouch={markCellTouched}
            onCellChange={(rowId, field, val) => {
              markCellTouched(`${rowId}_${field}`);
              markSheetDirty(activeSheet);
              updateCell(activeSheet, rowId, field, val);
            }}
            onAddRow={() => { markSheetDirty(activeSheet); addRow(activeSheet); }}
            onSplitRow={(rowId) => { markSheetDirty(activeSheet); splitRow(activeSheet, rowId); }}
            onDeleteRow={(rowId) => { markSheetDirty(activeSheet); deleteRow(activeSheet, rowId); }}
            onSaveSheet={handleSave}
            onSaveAndNext={handleSaveAndNext}
            canNext={activeSheetIndex < currentSheetOrder.length - 1}
          />
        </div>
      </div>

      <GuidanceDrawerModal
        isOpen={showGuidanceModal}
        onClose={() => setShowGuidanceModal(false)}
        meta={activeMeta}
      />

      <C1AdminLockModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        onUnlock={unlockC1}
      />

      <DataQualityReportModal
        isOpen={showQualityModal}
        onClose={() => setShowQualityModal(false)}
        report={qualityReport}
        onSelectSheet={handleSelectSheetSafe}
      />

      <OperatorSessionModal
        isOpen={isModalOpen}
        currentSession={session}
        defaultUnitCode={unitCode}
        onSubmit={(em, u, tit) => {
          const { restoredData } = submitSession(em, u, tit);
          if (restoredData) restoreWorkbookData(restoredData, u);
          else gridHandleUnitChange(u);
          setDirtySheets(new Set());
        }}
        onClose={closeModal}
      />
    </div>
  );
}
