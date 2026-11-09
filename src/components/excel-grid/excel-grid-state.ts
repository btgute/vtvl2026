import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ExcelSheetKey,
  GenericGridRow,
  SheetOrderMode,
  EXCEL_NATURAL_SHEET_ORDER,
  TECHNICAL_DEPENDENCY_ORDER
} from './excel-grid-types';
import { buildDefaultGridWorkbook } from './excel-grid-defaults';
import { recalculateGridFormulas } from './excel-grid-formulas';
import { getNextMissionCode, getNextTaskCode, buildNewGridRow } from './excel-grid-code-helpers';
import {
  findPl1Item,
  getPl1CareerLevel,
  buildFullPl1C1Rows,
  buildFullPl1C2Rows,
  buildRecommendedC1Rows
} from '@/configs/hcmute-pl1-builder';
import { PL1_VTVL_CATALOG } from '@/configs/hcmute-pl1-catalog';
import { HCMUTE_UNITS } from '@/configs/hcmute-units';
import { generateUnitFiles } from '@/services/excel-split/workbook-builder';
import { UnitGroupKind } from '@/types/vtvl';

export function useExcelGridState(initialUnitCode = 'TCNS') {
  const [unitCode, setUnitCode] = useState(initialUnitCode);
  const [orderMode, setOrderMode] = useState<SheetOrderMode>('excel');
  const [activeSheet, setActiveSheet] = useState<ExcelSheetKey>('A1');
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
    setActiveSheet('A1');
  }, []);

  const handleLoadTcnsData = useCallback(() => {
    setUnitCode('TCNS');
    const tcnsData = buildDefaultGridWorkbook('TCNS');
    setData(tcnsData);
    setActiveSheet('A1');
    if (typeof window !== 'undefined') {
      localStorage.setItem('hcmute_vtvl_grid_TCNS', JSON.stringify(tcnsData));
    }
  }, []);

  const updateCell = useCallback((sheetKey: ExcelSheetKey, rowId: string, field: string, value: string | number) => {
    setData((prev) => {
      const sheetRows = prev[sheetKey] || [];

      // 1. Khi đổi mã nhiệm vụ ở A1 -> đồng bộ mã nhiệm vụ và prefix mã công việc ở A2
      if (sheetKey === 'A1' && field === 'maNhiemVu') {
        const oldRow = sheetRows.find((r) => r.id === rowId);
        const oldMission = String(oldRow?.maNhiemVu || '');
        const newMission = String(value);
        const updatedA1 = sheetRows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row));

        if (oldMission && newMission && oldMission !== newMission && prev.A2) {
          const syncedA2 = prev.A2.map((t) => {
            if (String(t.maNhiemVu) === oldMission) {
              const oldTaskCode = String(t.maCongViec || '');
              const taskSuffixMatch = oldTaskCode.match(/CV\d+/i);
              const suffix = taskSuffixMatch ? taskSuffixMatch[0] : 'CV01';
              return { ...t, maNhiemVu: newMission, maCongViec: `${newMission}.${suffix}` };
            }
            return t;
          });
          return recalculateGridFormulas({ ...prev, A1: updatedA1, A2: syncedA2 }, currentUnit.code, currentUnit.nameVi);
        }
        return recalculateGridFormulas({ ...prev, A1: updatedA1 }, currentUnit.code, currentUnit.nameVi);
      }

      // 2. Khi đổi mã nhiệm vụ ở A2 -> tự động sinh lại mã công việc theo nhiệm vụ mới
      if (sheetKey === 'A2' && field === 'maNhiemVu') {
        const newMission = String(value);
        const nextTaskCode = getNextTaskCode(sheetRows, newMission, rowId);
        const updatedRows = sheetRows.map((row) =>
          row.id === rowId ? { ...row, maNhiemVu: newMission, maCongViec: nextTaskCode } : row
        );
        return recalculateGridFormulas({ ...prev, A2: updatedRows }, currentUnit.code, currentUnit.nameVi);
      }

      // 3. Khi đổi mã VTVL ở C1 -> tra cứu tên chuẩn từ Phụ lục I và đồng bộ sang C2
      if (sheetKey === 'C1' && field === 'maVtvl') {
        const newVtvl = String(value);
        const pl1Item = findPl1Item(newVtvl);
        const isQl = pl1Item?.pl1Code.startsWith('QL') ?? newVtvl.includes('QL');
        const oldRow = sheetRows.find((r) => r.id === rowId);
        const oldVtvl = String(oldRow?.maVtvl || '');
        const updatedC1 = sheetRows.map((row) =>
          row.id === rowId
            ? {
                ...row,
                maVtvl: newVtvl,
                tenVtvl: pl1Item ? (pl1Item.titleOrRole || pl1Item.positionName) : row.tenVtvl,
                canCuQuyGio: isQl ? 'PP1 – theo cơ cấu và chức danh quản lý' : 'Mức chung 1.904 giờ – quy định về thời giờ làm việc'
              }
            : row
        );
        const existingC2 = prev.C2 || [];
        const updatedC2 = existingC2.map((c2) =>
          String(c2.maVtvl) === oldVtvl
            ? {
                ...c2,
                maVtvl: newVtvl,
                tenVtvl: pl1Item ? (pl1Item.titleOrRole || pl1Item.positionName) : c2.tenVtvl,
                bacNgheNghiep: getPl1CareerLevel(newVtvl)
              }
            : c2
        );
        return recalculateGridFormulas({ ...prev, C1: updatedC1, C2: updatedC2 }, currentUnit.code, currentUnit.nameVi);
      }

      const updatedRows = sheetRows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row));
      return recalculateGridFormulas({ ...prev, [sheetKey]: updatedRows }, currentUnit.code, currentUnit.nameVi);
    });
  }, [currentUnit.code, currentUnit.nameVi]);

  const addRow = useCallback((sheetKey: ExcelSheetKey) => {
    setData((prev) => {
      const sheetRows = prev[sheetKey] || [];
      const { newRow, extraC2Row } = buildNewGridRow(sheetKey, prev, currentUnit);

      if (sheetKey === 'C1') {
        const nextC1 = [...sheetRows, newRow];
        const nextC2 = extraC2Row ? [...(prev.C2 || []), extraC2Row] : prev.C2;
        return recalculateGridFormulas({ ...prev, C1: nextC1, C2: nextC2 }, currentUnit.code, currentUnit.nameVi);
      }

      return recalculateGridFormulas({ ...prev, [sheetKey]: [...sheetRows, newRow] }, currentUnit.code, currentUnit.nameVi);
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

  const currentSheetOrder = useMemo(() => {
    return orderMode === 'technical' ? TECHNICAL_DEPENDENCY_ORDER : EXCEL_NATURAL_SHEET_ORDER;
  }, [orderMode]);

  const activeSheetIndex = currentSheetOrder.indexOf(activeSheet);
  const goToNextSheet = useCallback(() => {
    if (activeSheetIndex < currentSheetOrder.length - 1) {
      setActiveSheet(currentSheetOrder[activeSheetIndex + 1]);
    }
  }, [activeSheetIndex, currentSheetOrder]);

  const goToPrevSheet = useCallback(() => {
    if (activeSheetIndex > 0) {
      setActiveSheet(currentSheetOrder[activeSheetIndex - 1]);
    }
  }, [activeSheetIndex, currentSheetOrder]);

  const saveAndGoNext = useCallback(() => {
    saveSheetData(activeSheet);
    goToNextSheet();
  }, [saveSheetData, activeSheet, goToNextSheet]);

  const dynamicOptionsMap = useMemo(() => ({
    vtvlList: Array.from(new Set((data.C1 || []).map((r) => String(r.maVtvl || '')).filter(Boolean))),
    missionList: Array.from(new Set((data.A1 || []).map((r) => String(r.maNhiemVu || '')).filter(Boolean))),
    taskList: Array.from(new Set((data.A2 || []).map((r) => String(r.maCongViec || '')).filter(Boolean))),
    productList: Array.from(new Set((data.DM_SP || []).map((r) => String(r.maSpChuan || '')).filter(Boolean))),
    pl1VtvlList: PL1_VTVL_CATALOG.map((item) => `${currentUnit.code}.${item.pl1Code}`)
  }), [data.C1, data.A1, data.A2, data.DM_SP, currentUnit.code]);

  const loadFullPl1Catalog = useCallback(() => {
    setData((prev) => {
      const fullC1 = buildFullPl1C1Rows(currentUnit.code);
      const fullC2 = buildFullPl1C2Rows(fullC1);
      return recalculateGridFormulas({ ...prev, C1: fullC1, C2: fullC2 }, currentUnit.code, currentUnit.nameVi);
    });
  }, [currentUnit.code, currentUnit.nameVi]);

  const loadRecommendedVtvls = useCallback(() => {
    setData((prev) => {
      const recC1 = buildRecommendedC1Rows(currentUnit.code, currentUnit.group);
      const recC2 = buildFullPl1C2Rows(recC1);
      return recalculateGridFormulas({ ...prev, C1: recC1, C2: recC2 }, currentUnit.code, currentUnit.nameVi);
    });
  }, [currentUnit.code, currentUnit.nameVi, currentUnit.group]);

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
  };
}
