import { useState, useCallback, useMemo, useEffect } from 'react';
import { ExcelSheetKey, GenericGridRow, WORKFLOW_SHEET_ORDER } from './excel-grid-types';
import { buildDefaultGridWorkbook } from './excel-grid-defaults';
import { recalculateGridFormulas } from './excel-grid-formulas';
import { getNextMissionCode, getNextTaskCode, escapeRegExp } from './excel-grid-code-helpers';
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

      const updatedRows = sheetRows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row));
      return recalculateGridFormulas({ ...prev, [sheetKey]: updatedRows }, currentUnit.code, currentUnit.nameVi);
    });
  }, [currentUnit.code, currentUnit.nameVi]);

  const addRow = useCallback((sheetKey: ExcelSheetKey) => {
    setData((prev) => {
      const sheetRows = prev[sheetKey] || [];
      const newId = `${sheetKey.toLowerCase()}-${Date.now().toString(36)}`;
      let newRow: GenericGridRow = { id: newId };

      if (sheetKey === 'A1') {
        const nextCode = getNextMissionCode(sheetRows, currentUnit.code);
        newRow = {
          id: newId,
          maNhiemVu: nextCode,
          tenNhiemVu: `Nhiệm vụ mới (${nextCode})`,
          coQuan: currentUnit.nameVi,
          canCu: 'QĐ 2266/QĐ-ĐHCNKT',
          ky: '2025–2026',
          trangThai: 'Tiếp tục thực hiện',
          nguon: 'QĐ 2266'
        };
      } else if (sheetKey === 'A2') {
        const existingA2 = prev.A2 || [];
        const lastRow = existingA2[existingA2.length - 1];
        const targetMission = (lastRow?.maNhiemVu as string) || (prev.A1 && (prev.A1[0]?.maNhiemVu as string)) || `${currentUnit.code}.NV01`;
        const nextTaskCode = getNextTaskCode(existingA2, targetMission);
        const defaultVtvl = (lastRow?.maVtvl as string) || (prev.C1 && (prev.C1[0]?.maVtvl as string)) || 'CM63';
        newRow = {
          id: newId,
          maCongViec: nextTaskCode,
          maNhiemVu: targetMission,
          maVtvl: defaultVtvl,
          tenCongViec: `Công việc mới (${nextTaskCode})`,
          sanPham: 'Sản phẩm hoàn thành',
          dvt: 'Hồ sơ / Báo cáo',
          chatLuong: 'Đạt chuẩn quy định',
          canCu: 'QĐ 2266 & Mô tả công việc'
        };
      } else if (sheetKey === 'C1') {
        const existingC1 = prev.C1 || [];
        const nextVtvl = `CM${63 + existingC1.length}`;
        newRow = {
          id: newId,
          maVtvl: nextVtvl,
          tenVtvl: `Vị trí việc làm chuyên môn ${existingC1.length + 1}`,
          loaiNhanLuc: 'Viên chức',
          quyetDinh: 'QĐ 2266 / NĐ 232',
          gioChuanPp2: 1904,
          canCuQuyGio: '40h/tuần',
          trangThai: 'tiếp tục sử dụng',
          gioRieng: 0,
          xacNhanGioRieng: 'Không',
          cheDoLamViec: 'Phổ biến (40 giờ/tuần)',
          kiemTra: 'ĐẠT'
        };
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
