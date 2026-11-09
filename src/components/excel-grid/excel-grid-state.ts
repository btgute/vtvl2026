import { useState, useCallback, useMemo, useEffect } from 'react';
import { ExcelSheetKey, GenericGridRow, WORKFLOW_SHEET_ORDER } from './excel-grid-types';
import { buildDefaultGridWorkbook } from './excel-grid-defaults';
import { recalculateGridFormulas } from './excel-grid-formulas';
import { HCMUTE_UNITS } from '@/configs/hcmute-units';
import { generateUnitFiles } from '@/services/excel-split/workbook-builder';
import { UnitGroupKind } from '@/types/vtvl';

export function useExcelGridState(initialUnitCode = 'TCNS') {
  const [unitCode, setUnitCode] = useState(initialUnitCode);
  const [activeSheet, setActiveSheet] = useState<ExcelSheetKey>('C1');
  const [data, setData] = useState<Record<ExcelSheetKey, GenericGridRow[]>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`hcmute_vtvl_grid_${initialUnitCode}`);
        if (stored) return JSON.parse(stored);
      } catch { /* ignore */ }
    }
    return buildDefaultGridWorkbook(initialUnitCode);
  });
  const [lastSaved, setLastSaved] = useState<string>('');
  const [lastSavedSheet, setLastSavedSheet] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const currentUnit = HCMUTE_UNITS.find((u) => u.code === unitCode) || HCMUTE_UNITS[0];

  const handleUnitChange = useCallback((newUnitCode: string) => {
    setUnitCode(newUnitCode);
    let fresh = buildDefaultGridWorkbook(newUnitCode);
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`hcmute_vtvl_grid_${newUnitCode}`);
        if (stored) fresh = JSON.parse(stored);
      } catch { /* ignore */ }
    }
    setData(fresh);
    setActiveSheet('C1');
  }, []);

  const handleLoadTcnsData = useCallback(() => {
    setUnitCode('TCNS');
    const tcnsData = buildDefaultGridWorkbook('TCNS');
    setData(tcnsData);
    setActiveSheet('C1');
    if (typeof window !== 'undefined') {
      localStorage.setItem('hcmute_vtvl_grid_TCNS', JSON.stringify(tcnsData));
    }
  }, []);

  const updateCell = useCallback((sheetKey: ExcelSheetKey, rowId: string, field: string, value: string | number) => {
    setData((prev) => {
      const sheetRows = prev[sheetKey] || [];
      const updatedRows = sheetRows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row));
      return recalculateGridFormulas({ ...prev, [sheetKey]: updatedRows }, currentUnit.code, currentUnit.nameVi);
    });
  }, [currentUnit.code, currentUnit.nameVi]);

  const addRow = useCallback((sheetKey: ExcelSheetKey) => {
    setData((prev) => {
      const sheetRows = prev[sheetKey] || [];
      const newId = `${sheetKey.toLowerCase()}-${Date.now().toString(36)}`;
      return recalculateGridFormulas({ ...prev, [sheetKey]: [...sheetRows, { id: newId }] }, currentUnit.code, currentUnit.nameVi);
    });
  }, [currentUnit.code, currentUnit.nameVi]);

  const deleteRow = useCallback((sheetKey: ExcelSheetKey, rowId: string) => {
    setData((prev) => {
      const sheetRows = (prev[sheetKey] || []).filter((r) => r.id !== rowId);
      return recalculateGridFormulas({ ...prev, [sheetKey]: sheetRows }, currentUnit.code, currentUnit.nameVi);
    });
  }, [currentUnit.code, currentUnit.nameVi]);

  const saveSheetData = useCallback((sheetKey: ExcelSheetKey) => {
    const timeStr = new Date().toLocaleTimeString('vi-VN');
    const dateStr = new Date().toISOString().slice(0, 10);
    setData((prev) => {
      const synced = recalculateGridFormulas(prev, currentUnit.code, currentUnit.nameVi);
      // Append or update in S_NhatKy
      const sRows = [...(synced.S || [])];
      const logEntry: GenericGridRow = {
        id: `s-${Date.now()}`,
        ky: '2025–2026',
        bieu: `Biểu ${sheetKey}`,
        ma: currentUnit.code,
        noiDung: `Lưu cập nhật biểu ${sheetKey} lúc ${timeStr}`,
        nguon: 'Giao diện Bảng tính Excel HCM-UTE',
        nguoiXacNhan: `Tổ công tác VTVL [${currentUnit.code}]`,
        ngay: dateStr,
        phienBan: 'v1.x'
      };
      synced.S = [logEntry, ...sRows.slice(0, 19)];

      if (typeof window !== 'undefined') {
        localStorage.setItem(`hcmute_vtvl_grid_${currentUnit.code}`, JSON.stringify(synced));
      }
      return synced;
    });
    setLastSaved(timeStr);
    setLastSavedSheet(sheetKey);
    return timeStr;
  }, [currentUnit.code, currentUnit.nameVi]);

  const activeSheetIndex = WORKFLOW_SHEET_ORDER.indexOf(activeSheet);
  const goToNextSheet = useCallback(() => {
    if (activeSheetIndex < WORKFLOW_SHEET_ORDER.length - 1) {
      setActiveSheet(WORKFLOW_SHEET_ORDER[activeSheetIndex + 1]);
    }
  }, [activeSheetIndex]);

  const goToPrevSheet = useCallback(() => {
    if (activeSheetIndex > 0) {
      setActiveSheet(WORKFLOW_SHEET_ORDER[activeSheetIndex - 1]);
    }
  }, [activeSheetIndex]);

  const saveAndGoNext = useCallback(() => {
    saveSheetData(activeSheet);
    goToNextSheet();
  }, [saveSheetData, activeSheet, goToNextSheet]);

  const dynamicOptionsMap = useMemo(() => ({
    vtvlList: Array.from(new Set((data.C1 || []).map((r) => String(r.maVtvl || '')).filter(Boolean))),
    missionList: Array.from(new Set((data.A1 || []).map((r) => String(r.maNhiemVu || '')).filter(Boolean))),
    taskList: Array.from(new Set((data.A2 || []).map((r) => String(r.maCongViec || '')).filter(Boolean))),
    productList: Array.from(new Set((data.DM_SP || []).map((r) => String(r.maSpChuan || '')).filter(Boolean)))
  }), [data.C1, data.A1, data.A2, data.DM_SP]);

  const exportFullWorkbook = useCallback(async () => {
    setIsExporting(true);
    try {
      await generateUnitFiles({
        kind: currentUnit.group as UnitGroupKind,
        unitCode: currentUnit.code,
        unitNameVi: currentUnit.nameVi,
        unitNameEn: currentUnit.nameEn,
        period: '2025–2026',
        exportDate: new Date().toISOString().slice(0, 10),
        includeZipPerPosition: false,
        ngachOverrides: {}
      });
    } catch {
      alert('Không thể tạo file Excel, vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  }, [currentUnit]);

  return {
    unitCode,
    currentUnit,
    activeSheet,
    activeSheetIndex,
    data,
    lastSaved,
    lastSavedSheet,
    isExporting,
    dynamicOptionsMap,
    handleUnitChange,
    handleLoadTcnsData,
    setActiveSheet,
    updateCell,
    addRow,
    deleteRow,
    saveSheetData,
    saveAndGoNext,
    exportFullWorkbook,
    goToNextSheet,
    goToPrevSheet
  };
}
