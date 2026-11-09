'use client';

import React from 'react';
import { useExcelGridState } from './excel-grid-state';
import { EXCEL_SHEET_METAS } from './excel-sheet-metas';
import { ExcelSheetTabs } from './ExcelSheetTabs';
import { ExcelTableRenderer } from './ExcelTableRenderer';
import { HCMUTE_UNITS } from '@/configs/hcmute-units';
import {
  FileSpreadsheet,
  Download,
  Building2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Clock
} from 'lucide-react';

interface ExcelWorkbookViewerProps {
  initialUnitCode?: string;
}

export function ExcelWorkbookViewer({ initialUnitCode = 'TCNS' }: ExcelWorkbookViewerProps) {
  const {
    unitCode,
    currentUnit,
    orderMode,
    setOrderMode,
    currentSheetOrder,
    activeSheet,
    activeSheetIndex,
    data,
    lastSaved,
    lastSavedSheet,
    isExporting,
    dynamicOptionsMap,
    handleUnitChange,
    handleLoadTcnsData,
    loadFullPl1Catalog,
    loadRecommendedVtvls,
    setActiveSheet,
    updateCell,
    addRow,
    deleteRow,
    saveSheetData,
    saveAndGoNext,
    exportFullWorkbook,
    goToNextSheet,
    goToPrevSheet
  } = useExcelGridState(initialUnitCode);

  const activeMeta = EXCEL_SHEET_METAS[activeSheet];
  const activeRows = data[activeSheet] || [];

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Top action toolbar */}
      <div className="bg-white border border-[#cbd5e1] rounded-xl p-3.5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Unit selector */}
          <div className="flex items-center gap-2.5 min-w-[280px]">
            <Building2 className="w-5 h-5 text-[#004776] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                Đơn vị đang thao tác:
              </span>
              <select
                aria-label="Chọn đơn vị triển khai VTVL"
                value={unitCode}
                onChange={(e) => handleUnitChange(e.target.value)}
                className="font-bold text-[#004776] bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-2.5 py-1 text-sm focus:ring-2 focus:ring-[#004776] focus:outline-none"
              >
                {HCMUTE_UNITS.map((u) => (
                  <option key={u.code} value={u.code}>
                    [{u.code}] {u.nameVi}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick actions: Load TCNS template, Check, Export Excel */}
          <div className="flex flex-wrap items-center gap-2">
            {activeSheet === 'C1' && (
              <>
                <button
                  type="button"
                  onClick={loadRecommendedVtvls}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#004776] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg cursor-pointer transition-colors"
                  title={`Nạp danh mục VTVL chuẩn theo loại hình ${currentUnit.nameVi}`}
                >
                  <Building2 className="w-3.5 h-3.5 text-[#004776]" />
                  <span>Nạp VTVL chuẩn {currentUnit.code}</span>
                </button>
                <button
                  type="button"
                  onClick={loadFullPl1Catalog}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#004776] bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg cursor-pointer transition-colors"
                  title="Nạp toàn bộ 56 VTVL chuẩn theo Phụ lục I kèm Quyết định của Hiệu trưởng"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Nạp trọn bộ 56 VTVL (Phụ lục I)</span>
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
              <span>Kiểm tra chéo K_KiemTra</span>
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
              {orderMode === 'excel'
                ? 'Thứ tự sheet chuẩn tệp Excel (Văn bản 04):'
                : 'Trình tự kỹ thuật phụ thuộc dữ liệu (12 bước Mục II):'}
            </span>
            <span className="text-[#334155]">
              {orderMode === 'excel'
                ? '1. A1 → 2. A2 → 3. B1 → 4. B2_CT → 5. B2 → 6. C1 → 7. C2 → 8. C3 → 9. D1 → 10. D2 → 11. DM_SP → DU_BAO → 13. K → 14. T → 15. S'
                : '11. DM_SP (B.2) → 6. C1 (B.3) → 1. A1 (B.4) → 2. A2 (B.5) → 3. B1 (B.6) → 4. B2_CT (B.7) → 5. B2 → 7. C2 (B.8) → 9. D1 (B.9) → 8. C3 (B.10) → DU_BAO (B.11) → 10. D2 (B.12)'}
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

      {/* Main Spreadsheet grid view with Save and Next button */}
      <ExcelTableRenderer
        meta={activeMeta}
        rows={activeRows}
        dynamicOptionsMap={dynamicOptionsMap}
        lastSaved={lastSaved}
        lastSavedSheet={lastSavedSheet}
        onCellChange={(rowId, field, val) => updateCell(activeSheet, rowId, field, val)}
        onAddRow={() => addRow(activeSheet)}
        onDeleteRow={(rowId) => deleteRow(activeSheet, rowId)}
        onSaveSheet={() => saveSheetData(activeSheet)}
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
    </div>
  );
}

