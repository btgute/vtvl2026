'use client';

import React, { useState, useMemo } from 'react';
import { useExcelGridState } from './excel-grid-state';
import { EXCEL_SHEET_METAS } from './excel-sheet-metas';
import { ExcelSheetTabs } from './ExcelSheetTabs';
import { ExcelTableRenderer } from './ExcelTableRenderer';
import { C1AdminStatusBanner, C1AdminLockModal } from './C1AdminLockModal';
import { DataQualityReportModal } from './DataQualityReportModal';
import { OperatorSessionModal } from './OperatorSessionModal';
import { useOperatorSession } from './useOperatorSession';
import { validateWorkbookData } from '@/services/validation';
import { HCMUTE_UNITS } from '@/configs/hcmute-units';
import { QD2266_28_UNITS_CATALOG } from '@/configs/hcmute-qd2266-missions';
import { FileSpreadsheet, Download, Building2, Sparkles, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';

interface ExcelWorkbookViewerProps {
  initialUnitCode?: string;
}

export function ExcelWorkbookViewer({ initialUnitCode = 'TCNS' }: ExcelWorkbookViewerProps) {
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const {
    session, isModalOpen, touchedCells, isRestoredSession,
    markCellTouched, submitSession, switchSession, persistDataForSession
  } = useOperatorSession();
  const {
    unitCode, currentUnit, orderMode, setOrderMode, currentSheetOrder,
    activeSheet, activeSheetIndex, data, lastSaved, lastSavedSheet,
    isExporting, dynamicOptionsMap, isC1Unlocked, unlockC1, lockC1,
    handleUnitChange, handleLoadTcnsData, restoreWorkbookData,
    loadFullPl1Catalog, loadRecommendedVtvls, setActiveSheet,
    updateCell, addRow, splitRow, deleteRow, saveSheetData, saveAndGoNext,
    exportFullWorkbook, goToNextSheet, goToPrevSheet
  } = useExcelGridState(initialUnitCode);

  const activeMeta = EXCEL_SHEET_METAS[activeSheet];
  const activeRows = data[activeSheet] || [];

  const handleSessionSubmit = (em: string, uCode: string, tit: string) => {
    const { restoredData } = submitSession(em, uCode, tit);
    if (restoredData) {
      restoreWorkbookData(restoredData, uCode);
    } else {
      handleUnitChange(uCode);
    }
  };

  const handleSave = () => {
    saveSheetData(activeSheet);
    persistDataForSession(data);
  };

  const qualityReport = useMemo(() => {
    return validateWorkbookData(data, unitCode, currentUnit.nameVi);
  }, [data, unitCode, currentUnit.nameVi]);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Top action toolbar */}
      <div className="bg-white border border-[#cbd5e1] rounded-xl p-3.5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Operator identification & Unit selector */}
          <div className="flex flex-wrap items-center gap-2">
            {session ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#004776]/5 border border-[#004776]/20 text-xs">
                <span className="font-bold text-[#004776]">👤 {session.email}</span>
                <span className="text-[#cbd5e1]">|</span>
                <span className="text-[#334155] font-semibold">🏢 {session.unitNameVi}</span>
                <span className="text-[#cbd5e1]">|</span>
                <span className="text-[#64748b]">🏷️ {session.title}</span>
                <button
                  type="button"
                  onClick={switchSession}
                  className="ml-1 text-[11px] font-bold text-[#004776] hover:underline cursor-pointer"
                  title="Đổi tài khoản email hoặc đơn vị công tác"
                >
                  (Đổi)
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={switchSession}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-xs animate-pulse"
              >
                ⚠️ Điền email &amp; đơn vị để bắt đầu
              </button>
            )}

            {isRestoredSession && (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200">
                Đã khôi phục phiên trước
              </span>
            )}
          </div>

          {/* Quick actions: Load TCNS template, Check, Export Excel */}
          <div className="flex flex-wrap items-center gap-2">
            {activeSheet === 'A1' && (
              <div className="flex items-center gap-1.5 bg-[#f1f5f9] px-2 py-1 rounded-lg border border-[#cbd5e1]">
                <span className="text-xs font-bold text-[#004776]">Đơn vị QĐ 2266:</span>
                <select
                  value={unitCode}
                  onChange={(e) => handleUnitChange(e.target.value)}
                  className="bg-white border border-[#cbd5e1] rounded px-2 py-0.5 text-xs font-bold text-[#004776] cursor-pointer"
                >
                  {QD2266_28_UNITS_CATALOG.map((u) => (
                    <option key={u.code} value={u.code}>
                      PL{u.plNum < 10 ? `0${u.plNum}` : u.plNum} · {u.code} – {u.nameVi}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {activeSheet === 'C1' && (
              <>
                <button
                  type="button"
                  onClick={() => (!isC1Unlocked ? setShowUnlockModal(true) : loadRecommendedVtvls())}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#004776] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg cursor-pointer transition-colors"
                  title={`Nạp danh mục VTVL chuẩn theo loại hình ${currentUnit.nameVi}`}
                >
                  <Building2 className="w-3.5 h-3.5 text-[#004776]" />
                  <span>Nạp VTVL chuẩn {currentUnit.code}</span>
                </button>
                <button
                  type="button"
                  onClick={() => (!isC1Unlocked ? setShowUnlockModal(true) : loadFullPl1Catalog())}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#004776] bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg cursor-pointer transition-colors"
                  title="Nạp toàn bộ 56 VTVL chuẩn theo Phụ lục I kèm Quyết định của Hiệu trưởng"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Nạp trọn bộ 56 VTVL (PL1)</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleLoadTcnsData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#004776] bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-lg cursor-pointer transition-colors"
              title="Nạp toàn bộ 39 nhiệm vụ và 200 công việc mẫu của Phòng Tổ chức - Nhân sự"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Nạp mẫu chuẩn TCNS</span>
            </button>

            <button
              type="button"
              onClick={() => saveSheetData(activeSheet)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer transition-colors shadow-2xs"
              title="Lưu lại bảng tính của biểu hiện tại"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Lưu biểu {activeMeta.shortLabel}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSheet('K')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer border transition-colors ${
                activeSheet === 'K'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Kiểm tra chéo K</span>
            </button>

            <button
              type="button"
              onClick={() => setShowQualityModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#004776] bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg cursor-pointer transition-colors shadow-2xs"
              title="Bộ máy kiểm soát chất lượng dữ liệu 15 sheet theo chuẩn Hướng dẫn số 07-HD/BTCTW"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Kiểm tra chất lượng (QA)</span>
              {qualityReport.summary.fixCount > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-600 text-white font-bold">
                  {qualityReport.summary.fixCount}
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-600 text-white font-bold">
                  {qualityReport.summary.scorePercent}đ
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={exportFullWorkbook}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#004776] hover:bg-[#00385c] rounded-lg cursor-pointer shadow-2xs transition-colors disabled:opacity-50"
            >
              {isExporting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isExporting ? 'Đang tạo...' : 'Xuất tệp Excel (.xlsx)'}</span>
            </button>
          </div>
        </div>

        {/* Status bar: Order workflow hint and auto-save */}
        <div className="mt-2.5 pt-2 border-t border-[#e2e8f0] flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748b]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-[#004776]">
              {orderMode === 'excel' ? 'Thứ tự sheet chuẩn file Excel:' : 'Trình tự kỹ thuật 12 bước:'}
            </span>
            <span className="text-[#334155]">
              {orderMode === 'excel'
                ? '1. A1 → 2. A2 → 3. B1 → 4. B2_CT → 5. B2 → 6. C1 → 7. C2 → 8. C3 → 9. D1 → 10. D2 → 11. DM_SP → DU_BAO → 13. K → 14. T → 15. S'
                : '11. DM_SP → 6. C1 → 1. A1 → 2. A2 → 3. B1 → 4. B2_CT → 5. B2 → 7. C2 → 9. D1 → 8. C3 → DU_BAO → 10. D2'}
            </span>
          </div>
          {lastSaved && (
            <div className="flex items-center gap-1 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đã lưu thành công lúc {lastSaved}</span>
            </div>
          )}
        </div>
      </div>

      {/* C1 Admin protection banner when viewing C1 */}
      {activeSheet === 'C1' && (
        <C1AdminStatusBanner
          isUnlocked={isC1Unlocked}
          onOpenUnlockModal={() => setShowUnlockModal(true)}
          onLock={lockC1}
        />
      )}

      {/* Main Spreadsheet grid view with Save and Next button */}
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
          updateCell(activeSheet, rowId, field, val);
        }}
        onAddRow={() => addRow(activeSheet)}
        onSplitRow={(rowId) => splitRow(activeSheet, rowId)}
        onDeleteRow={(rowId) => deleteRow(activeSheet, rowId)}
        onSaveSheet={handleSave}
        onSaveAndNext={saveAndGoNext}
        canNext={activeSheetIndex < currentSheetOrder.length - 1}
      />

      {/* Bottom Excel Sheet Tabs Bar */}
      <ExcelSheetTabs
        activeSheet={activeSheet}
        sheetOrder={currentSheetOrder}
        orderMode={orderMode}
        onToggleOrderMode={setOrderMode}
        onSelectSheet={setActiveSheet}
        onPrev={goToPrevSheet}
        onNext={goToNextSheet}
        canPrev={activeSheetIndex > 0}
        canNext={activeSheetIndex < currentSheetOrder.length - 1}
      />

      {/* Admin Unlock Modal for Biểu 6. C1_VTVL */}
      <C1AdminLockModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        onUnlock={unlockC1}
      />

      {/* Data Quality Checker Modal */}
      <DataQualityReportModal
        isOpen={showQualityModal}
        onClose={() => setShowQualityModal(false)}
        report={qualityReport}
        onSelectSheet={setActiveSheet}
      />

      {/* Operator Session Gate Modal */}
      <OperatorSessionModal
        isOpen={isModalOpen}
        currentSession={session}
        onSubmit={handleSessionSubmit}
        onClose={session ? () => switchSession() : undefined}
      />
    </div>
  );
}

