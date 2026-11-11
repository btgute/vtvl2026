'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Building2, ChevronDown, Layers, AlertTriangle, HelpCircle, ShieldCheck, Check } from 'lucide-react';
import { ExcelSheetKey, SheetOrderMode, EXCEL_NATURAL_SHEET_ORDER, WORKFLOW_SHEET_ORDER } from './excel-grid-types';
import { EXCEL_SHEET_METAS } from './excel-sheet-metas';
import { getActiveHcmuteUnits } from '@/configs/hcmute-units';
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
  const [availableUnits, setAvailableUnits] = useState<HcmuteUnit[]>(() => getActiveHcmuteUnits());

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
    const handleUnitsUpdated = () => {
      setAvailableUnits(getActiveHcmuteUnits());
    };
    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('vtvl-units-updated', handleUnitsUpdated);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('vtvl-units-updated', handleUnitsUpdated);
    };
  }, []);

  const filteredUnits = availableUnits.filter(
    (u: HcmuteUnit) => u.nameVi.toLowerCase().includes(unitSearch.toLowerCase()) || u.code.toLowerCase().includes(unitSearch.toLowerCase())
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 min-h-[52px] sm:min-h-[56px] px-3 sm:px-4 py-2 sm:py-2.5 border-b border-[#f1f5f9] bg-white min-w-0">
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
        {/* 1. Dropdown mã biểu: Nút màu xanh thương hiệu #005fa3 */}
        <div className="relative shrink-0" ref={sheetMenuRef}>
          <button
            type="button"
            onClick={() => setShowSheetMenu(!showSheetMenu)}
            className="inline-flex items-center gap-1.5 h-8.5 px-3 bg-[#005fa3] text-white rounded-lg text-xs font-bold hover:bg-[#004776] cursor-pointer transition-colors shadow-2xs"
            title="Đổi nhanh biểu khác trong 15 biểu mẫu"
            aria-expanded={showSheetMenu}
            aria-haspopup="listbox"
          >
            <span>{activeMeta.sheetName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-white/80" />
          </button>

          {showSheetMenu && (
            <div className="absolute left-0 top-full mt-1.5 w-[min(19rem,calc(100vw-2rem))] bg-white rounded-lg border border-[#cbd5e1] shadow-lg z-50 py-1.5 max-h-80 overflow-y-auto">
              <div className="px-3 py-1.5 text-xs font-semibold text-[#476885] border-b border-[#f1f5f9]">
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
                    className={`w-full text-left px-3 py-2.5 sm:py-2 text-xs flex items-center justify-between gap-2 hover:bg-[#f8fafc] cursor-pointer ${
                      isCurrent ? 'bg-[#f0f9ff] text-[#004776] font-semibold' : 'text-[#004776] font-normal'
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

        {/* 2. Tiêu đề biểu (rút gọn text, ellipsis và tooltip) */}
        <h1
          className="text-sm sm:text-base font-semibold text-[#004776] leading-snug truncate max-w-[220px] sm:max-w-xs md:max-w-md lg:max-w-lg min-w-0"
          title={activeMeta.title}
        >
          {activeMeta.title}
        </h1>

        <span className="hidden sm:inline text-[#cbd5e1]">|</span>

        {/* 3. Dropdown đơn vị: [Mã] Tên đơn vị */}
        <div className="relative min-w-0 shrink-0" ref={unitMenuRef}>
          <button
            type="button"
            onClick={() => setShowUnitMenu(!showUnitMenu)}
            className="inline-flex items-center gap-1.5 h-8.5 px-2.5 bg-white hover:bg-slate-50 border border-[#cbd5e1] rounded-lg text-xs font-semibold text-[#004776] cursor-pointer transition-colors max-w-[200px] sm:max-w-xs truncate"
            title={`[${unitCode}] ${currentUnit.nameVi} — Nhấp để đổi đơn vị công tác`}
            aria-expanded={showUnitMenu}
            aria-haspopup="listbox"
          >
            <Building2 className="w-3.5 h-3.5 text-[#004776] shrink-0" />
            <span className="truncate font-semibold">[{unitCode}] {currentUnit.nameVi}</span>
            <ChevronDown className="w-3 h-3 text-[#64748b] shrink-0" />
          </button>

          {showUnitMenu && (
            <div className="absolute left-0 top-full mt-1.5 w-[min(20rem,calc(100vw-2rem))] bg-white rounded-lg border border-[#cbd5e1] shadow-lg z-50 p-2">
              <input
                type="text"
                value={unitSearch}
                onChange={(e) => setUnitSearch(e.target.value)}
                placeholder="Tìm mã hoặc tên đơn vị..."
                className="w-full h-8.5 px-2.5 text-xs rounded-lg border border-[#cbd5e1] mb-1.5 focus:ring-2 focus:ring-[#004776]/20 focus:border-[#004776] outline-hidden"
              />
              <div className="max-h-60 overflow-y-auto space-y-0.5">
                {filteredUnits.map((u: HcmuteUnit) => (
                  <button
                    key={u.code}
                    type="button"
                    onClick={() => { onUnitChange(u.code); setShowUnitMenu(false); }}
                    className={`w-full text-left px-2.5 py-2 sm:py-1.5 rounded-md text-xs truncate flex items-center justify-between ${
                      u.code === unitCode ? 'bg-[#f0f9ff] text-[#004776] font-semibold' : 'hover:bg-[#f8fafc] text-[#004776] font-normal'
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

        {/* 4. Trạng thái Bước & Biểu (nền nhạt) */}
        <span className="hidden md:inline-flex items-center gap-1.5 h-8 px-2.5 bg-slate-50 border border-slate-200/80 rounded-md text-xs font-medium text-[#64748b] shrink-0">
          <Layers className="w-3.5 h-3.5 text-[#004776] shrink-0" />
          <span className="whitespace-nowrap">Bước {activeStep}/8 · Biểu {activeSheetIndex + 1}/{totalSheets}</span>
        </span>

        {/* 5. Cảnh báo QA nền đỏ nhạt */}
        {fixCount > 0 ? (
          <button
            type="button"
            onClick={onOpenQualityModal}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 bg-red-50 hover:bg-red-100/80 border border-red-200/80 rounded-md text-xs font-semibold text-red-700 cursor-pointer transition-colors shrink-0"
            title="Xem chi tiết các điểm cần bổ sung hoặc xem lại"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="whitespace-nowrap">{fixCount} mục cần xem</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenQualityModal}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-md text-xs font-semibold text-emerald-700 cursor-pointer transition-colors shrink-0"
            title="Dữ liệu biểu mẫu hoàn tất và đạt chuẩn"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="whitespace-nowrap">Dữ liệu hợp lệ</span>
          </button>
        )}
      </div>

      {/* 6. Liên kết Hướng dẫn bên phải */}
      <button
        type="button"
        onClick={onOpenGuidance}
        className="inline-flex items-center gap-1.5 h-8.5 px-3 text-xs font-semibold text-[#005fa3] hover:text-[#004776] hover:bg-sky-50 rounded-lg transition-colors cursor-pointer shrink-0"
        title="Xem căn cứ pháp lý, hướng dẫn chuẩn HD 07 và lưu ý biểu này"
      >
        <HelpCircle className="w-4 h-4 text-[#005fa3] shrink-0" />
        <span>Hướng dẫn</span>
      </button>
    </div>
  );
}
