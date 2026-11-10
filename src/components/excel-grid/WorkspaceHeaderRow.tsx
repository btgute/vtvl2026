'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Building2, ChevronDown, Layers, AlertTriangle, HelpCircle, ShieldCheck, Check } from 'lucide-react';
import { ExcelSheetKey, SheetOrderMode, EXCEL_NATURAL_SHEET_ORDER, WORKFLOW_SHEET_ORDER } from './excel-grid-types';
import { EXCEL_SHEET_METAS } from './excel-sheet-metas';
import { HCMUTE_UNITS } from '@/configs/hcmute-units';
import { HcmuteUnit } from '@/types/vtvl';
import { ValidationReport } from '@/services/validation';

interface WorkspaceHeaderRowProps {
  activeSheet: ExcelSheetKey;
  currentUnit: HcmuteUnit;
  unitCode: string;
  activeStep: number;
  activeSheetIndex: number;
  totalSheets: number;
  orderMode: SheetOrderMode;
  qualityReport: ValidationReport;
  onSelectSheet: (key: ExcelSheetKey) => void;
  onUnitChange: (code: string) => void;
  onOpenGuidance: () => void;
  onOpenQualityModal: () => void;
}

export function WorkspaceHeaderRow({
  activeSheet,
  currentUnit,
  unitCode,
  activeStep,
  activeSheetIndex,
  totalSheets,
  orderMode,
  qualityReport,
  onSelectSheet,
  onUnitChange,
  onOpenGuidance,
  onOpenQualityModal
}: WorkspaceHeaderRowProps) {
  const [showSheetMenu, setShowSheetMenu] = useState(false);
  const [showUnitMenu, setShowUnitMenu] = useState(false);
  const [unitSearch, setUnitSearch] = useState('');

  const sheetMenuRef = useRef<HTMLDivElement>(null);
  const unitMenuRef = useRef<HTMLDivElement>(null);

  const activeMeta = EXCEL_SHEET_METAS[activeSheet];
  const fixCount = qualityReport.summary.fixCount;
  const sheetOrder = orderMode === 'technical' ? WORKFLOW_SHEET_ORDER : EXCEL_NATURAL_SHEET_ORDER;

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (sheetMenuRef.current && !sheetMenuRef.current.contains(target)) setShowSheetMenu(false);
      if (unitMenuRef.current && !unitMenuRef.current.contains(target)) setShowUnitMenu(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const filteredUnits = HCMUTE_UNITS.filter(
    (u: HcmuteUnit) => u.nameVi.toLowerCase().includes(unitSearch.toLowerCase()) || u.code.toLowerCase().includes(unitSearch.toLowerCase())
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-[#f1f5f9]">
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 min-w-0">
        {/* Badge mã biểu kèm dropdown chọn nhanh 15 biểu */}
        <div className="relative" ref={sheetMenuRef}>
          <button
            type="button"
            onClick={() => setShowSheetMenu(!showSheetMenu)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#004776] text-white rounded-lg text-xs sm:text-sm font-bold shadow-2xs hover:bg-[#00385c] cursor-pointer transition-colors"
            title="Nhấn để đổi nhanh biểu khác trong 15 sheet"
          >
            <span>{activeMeta.sheetName}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {showSheetMenu && (
            <div className="absolute left-0 top-full mt-1.5 w-72 bg-white rounded-xl border border-[#cbd5e1] shadow-xl z-50 py-1.5 max-h-80 overflow-y-auto">
              <div className="px-3 py-1.5 text-[11px] font-bold text-[#64748b] border-b border-[#f1f5f9] uppercase tracking-wider">
                Chọn biểu tính (15 biểu HD 07)
              </div>
              {sheetOrder.map((key, idx) => {
                const m = EXCEL_SHEET_METAS[key];
                const isCurrent = key === activeSheet;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { onSelectSheet(key); setShowSheetMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between gap-2 hover:bg-[#f8fafc] cursor-pointer ${
                      isCurrent ? 'bg-[#f0f9ff] text-[#004776] font-bold' : 'text-[#334155]'
                    }`}
                  >
                    <span className="truncate">{idx + 1}. {m.title}</span>
                    {isCurrent && <Check className="w-3.5 h-3.5 text-[#004776] shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Tên biểu đầy đủ */}
        <h1 className="text-sm sm:text-base font-bold text-[#004776] truncate max-w-[280px] sm:max-w-md" title={activeMeta.title}>
          {activeMeta.title}
        </h1>

        <span className="hidden sm:inline text-[#cbd5e1] font-light">|</span>

        {/* Đơn vị thực hiện (Pill tương tác đổi đơn vị) */}
        <div className="relative" ref={unitMenuRef}>
          <button
            type="button"
            onClick={() => setShowUnitMenu(!showUnitMenu)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded-lg text-xs font-semibold text-[#004776] cursor-pointer transition-colors max-w-[220px] sm:max-w-xs truncate"
            title="Đổi đơn vị công tác"
          >
            <Building2 className="w-3.5 h-3.5 text-[#004776] shrink-0" />
            <span className="truncate">[{unitCode}] {currentUnit.nameVi}</span>
            <ChevronDown className="w-3 h-3 text-[#64748b] shrink-0" />
          </button>

          {showUnitMenu && (
            <div className="absolute left-0 top-full mt-1.5 w-80 bg-white rounded-xl border border-[#cbd5e1] shadow-xl z-50 p-2">
              <input
                type="text"
                value={unitSearch}
                onChange={(e) => setUnitSearch(e.target.value)}
                placeholder="Tìm đơn vị..."
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#cbd5e1] mb-1.5 focus:ring-1 focus:ring-[#004776] outline-hidden"
              />
              <div className="max-h-60 overflow-y-auto space-y-0.5">
                {filteredUnits.map((u: HcmuteUnit) => (
                  <button
                    key={u.code}
                    type="button"
                    onClick={() => { onUnitChange(u.code); setShowUnitMenu(false); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs truncate flex items-center justify-between ${
                      u.code === unitCode ? 'bg-[#f0f9ff] text-[#004776] font-bold' : 'hover:bg-[#f8fafc] text-[#334155]'
                    }`}
                  >
                    <span className="truncate">[{u.code}] {u.nameVi}</span>
                    {u.code === unitCode && <Check className="w-3.5 h-3.5 text-[#004776] shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chỉ báo bước & biểu */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs font-medium text-[#475569]">
          <Layers className="w-3.5 h-3.5 text-[#004776]" />
          <span>Bước {activeStep}/8 · Biểu {activeSheetIndex + 1}/{totalSheets}</span>
        </div>

        {/* Cảnh báo QA */}
        {fixCount > 0 ? (
          <button
            type="button"
            onClick={onOpenQualityModal}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 cursor-pointer transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>{fixCount} mục cần xem</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenQualityModal}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-700 cursor-pointer transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dữ liệu hợp lệ</span>
          </button>
        )}
      </div>

      {/* Nút hướng dẫn */}
      <button
        type="button"
        onClick={onOpenGuidance}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-xs font-semibold text-[#004776] cursor-pointer transition-colors shrink-0"
      >
        <HelpCircle className="w-4 h-4 text-[#004776]" />
        <span>Hướng dẫn</span>
      </button>
    </div>
  );
}
