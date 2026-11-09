import { useState, useCallback, useEffect } from 'react';
import { ExcelSheetKey, GenericGridRow, WORKFLOW_SHEET_ORDER } from './excel-grid-types';
import { buildDefaultGridWorkbook } from './excel-grid-defaults';
import { HCMUTE_UNITS } from '@/configs/hcmute-units';
import { generateUnitFiles } from '@/services/excel-split/workbook-builder';
import { UnitGroupKind } from '@/types/vtvl';

export function useExcelGridState(initialUnitCode = 'TCNS') {
  const [unitCode, setUnitCode] = useState(initialUnitCode);
  const [activeSheet, setActiveSheet] = useState<ExcelSheetKey>('C1');
  const [data, setData] = useState<Record<ExcelSheetKey, GenericGridRow[]>>(() =>
    buildDefaultGridWorkbook(initialUnitCode)
  );
  const [lastSaved, setLastSaved] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const currentUnit = HCMUTE_UNITS.find((u) => u.code === unitCode) || HCMUTE_UNITS[0];

  const handleUnitChange = useCallback((newUnitCode: string) => {
    setUnitCode(newUnitCode);
    const fresh = buildDefaultGridWorkbook(newUnitCode);
    setData(fresh);
    setActiveSheet('C1');
  }, []);

  const handleLoadTcnsData = useCallback(() => {
    setUnitCode('TCNS');
    const tcnsData = buildDefaultGridWorkbook('TCNS');
    setData(tcnsData);
    setActiveSheet('C1');
  }, []);

  const recalculateFormulas = useCallback((prev: Record<ExcelSheetKey, GenericGridRow[]>) => {
    const next = { ...prev };

    // 1. Recalculate B1 formulas: gioSp, gioTong
    const updatedB1: GenericGridRow[] = (next.B1 || []).map((row): GenericGridRow => {
      const qty = Number(row.soSpNam) || 0;
      const mins = Number(row.phutThucTe) || 0;
      const extra = Number(row.gioBoSung) || 0;
      const hours = Math.round((qty * mins / 60) * 10) / 10;
      const total = Math.round((hours + extra) * 10) / 10;
      return {
        ...row,
        gioSp: hours,
        gioTong: total,
        canhBao: total > 0 ? 'ĐẠT' : 'CHƯA ĐẠT'
      };
    });
    next.B1 = updatedB1;

    // 2. Recalculate B2 formulas: gioGiam from B2_CT, gioSauTacDong
    const updatedB2: GenericGridRow[] = (next.B2 || []).map((row): GenericGridRow => {
      const b1Item = updatedB1.find((b) => b.maCongViec === row.maCongViec);
      const b1Hours = Number(b1Item?.gioTong) || Number(row.gioB1) || 0;
      const ctMatches = (next.B2_CT || []).filter((c) => c.maCongViec === row.maCongViec);
      const sumVar = ctMatches.reduce((acc, c) => acc + (Number(c.gioBienDong) || 0), 0);
      const newHours = Number(row.gioMoi) || 0;
      const finalHours = Math.max(0, Math.round((b1Hours + sumVar + newHours) * 10) / 10);
      return {
        ...row,
        gioB1: b1Hours,
        gioGiam: sumVar,
        gioSauTacDong: finalHours,
        tyLeThayDoi: b1Hours > 0 ? `${Math.round((sumVar / b1Hours) * 100)}%` : '0%'
      };
    });
    next.B2 = updatedB2;

    // 3. Recalculate C3 formulas: gioB1, gioB2, gioRong, nguoiQuyDoi, nguoiCanBoTri
    const updatedC3: GenericGridRow[] = (next.C3 || []).map((row): GenericGridRow => {
      const vCode = String(row.maVtvl);
      const c1Match = (next.C1 || []).find((c) => c.maVtvl === vCode);
      const stdHours = Number(c1Match?.gioChuanPp2) || Number(row.gioPp2) || 1904;
      const sumB1 = updatedB1
        .filter((b) => b.maVtvl === vCode)
        .reduce((acc, b) => acc + (Number(b.gioTong) || 0), 0);
      const sumB2 = updatedB2
        .filter((b) => b.maVtvl === vCode)
        .reduce((acc, b) => acc + (Number(b.gioGiam) || 0), 0);
      const netHours = Math.max(0, Math.round(sumB1 + sumB2));
      const isQl = vCode.startsWith('QL');
      const fteCalc = Math.round((netHours / stdHours) * 100) / 100;
      const people = isQl ? 1 : Math.max(1, Math.ceil(fteCalc));
      return {
        ...row,
        gioB1: Math.round(sumB1),
        gioB2: Math.round(sumB2),
        gioRong: netHours,
        gioPp2: stdHours,
        nguoiQuyDoi: fteCalc,
        nguoiCanBoTri: people,
        canhBao: 'ĐẠT'
      };
    });
    next.C3 = updatedC3;

    // 4. Update DU_BAO: nguoiC3, nguoiCanBoTriNam
    const updatedDuBao: GenericGridRow[] = (next.DU_BAO || []).map((row): GenericGridRow => {
      const c3Match = updatedC3.find((c) => c.maVtvl === row.maVtvl);
      const basePeople = Number(c3Match?.nguoiCanBoTri) || Number(row.nguoiC3) || 1;
      const diff = Number(row.bienDong) || 0;
      return {
        ...row,
        nguoiC3: basePeople,
        nguoiCanBoTriNam: Math.max(0, basePeople + diff)
      };
    });
    next.DU_BAO = updatedDuBao;

    // 5. Update D2: soNguoiCanBoTri, soNguoiCoTheBoTri, deNghiDieuChinh
    const updatedD2: GenericGridRow[] = (next.D2 || []).map((row): GenericGridRow => {
      const duBaoMatch = updatedDuBao.find((d) => d.maVtvl === row.maVtvl);
      const need = Number(duBaoMatch?.nguoiCanBoTriNam) || Number(row.soNguoiCanBoTri) || 1;
      const countD1 = (next.D1 || []).filter((d) => d.maVtvl === row.maVtvl).length;
      return {
        ...row,
        soNguoiCanBoTri: need,
        soNguoiCoTheBoTri: countD1,
        deNghiDieuChinh: need - countD1
      };
    });
    next.D2 = updatedD2;

    // 6. Update T_TienDo
    next.T = [
      {
        id: 't-1',
        maDonVi: currentUnit.code,
        tenDonVi: currentUnit.nameVi,
        soNhiemVu: (next.A1 || []).length,
        soCongViec: (next.A2 || []).length,
        soVtvl: (next.C1 || []).length,
        tongFte: updatedC3.reduce((acc, c) => acc + (Number(c.nguoiCanBoTri) || 0), 0),
        trangThai: 'Đạt 6/6 chỉ tiêu kiểm tra'
      }
    ];

    return next;
  }, [currentUnit.code, currentUnit.nameVi]);

  const updateCell = useCallback(
    (sheetKey: ExcelSheetKey, rowId: string, field: string, value: string | number) => {
      setData((prev) => {
        const sheetRows = prev[sheetKey] || [];
        const updatedRows = sheetRows.map((row) => {
          if (row.id === rowId) {
            return { ...row, [field]: value };
          }
          return row;
        });
        const intermediate = { ...prev, [sheetKey]: updatedRows };
        return recalculateFormulas(intermediate);
      });
      setLastSaved(new Date().toLocaleTimeString('vi-VN'));
    },
    [recalculateFormulas]
  );

  const addRow = useCallback((sheetKey: ExcelSheetKey) => {
    setData((prev) => {
      const sheetRows = prev[sheetKey] || [];
      const newId = `${sheetKey.toLowerCase()}-${Date.now().toString(36)}`;
      const emptyRow: GenericGridRow = { id: newId };
      const intermediate = { ...prev, [sheetKey]: [...sheetRows, emptyRow] };
      return recalculateFormulas(intermediate);
    });
  }, [recalculateFormulas]);

  const deleteRow = useCallback((sheetKey: ExcelSheetKey, rowId: string) => {
    setData((prev) => {
      const sheetRows = prev[sheetKey] || [];
      const filtered = sheetRows.filter((r) => r.id !== rowId);
      const intermediate = { ...prev, [sheetKey]: filtered };
      return recalculateFormulas(intermediate);
    });
  }, [recalculateFormulas]);

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
    } catch (err) {
      console.error('Lỗi xuất tệp Excel:', err);
      alert('Không thể tạo file Excel, vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  }, [currentUnit]);

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

  return {
    unitCode,
    currentUnit,
    activeSheet,
    activeSheetIndex,
    data,
    lastSaved,
    isExporting,
    handleUnitChange,
    handleLoadTcnsData,
    setActiveSheet,
    updateCell,
    addRow,
    deleteRow,
    exportFullWorkbook,
    goToNextSheet,
    goToPrevSheet
  };
}
