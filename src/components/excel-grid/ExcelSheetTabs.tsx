'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  ExcelSheetKey, SheetOrderMode, EXCEL_NATURAL_SHEET_ORDER, WORKFLOW_SHEET_ORDER
} from './excel-grid-types';
import { EXCEL_SHEET_METAS } from './excel-sheet-metas';
import { ChevronLeft, ChevronRight, FileSpreadsheet, ChevronDown, Check } from 'lucide-react';

interface ExcelSheetTabsProps {
  activeSheet: ExcelSheetKey;
  onSelectSheet: (key: ExcelSheetKey) => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  sheetOrder?: ExcelSheetKey[];
  orderMode?: SheetOrderMode;
  dirtySheets?: Set<ExcelSheetKey>;
}

export function ExcelSheetTabs({
  activeSheet,
  onSelectSheet,
  onPrev,
  onNext,
  canPrev,
  canNext,
  sheetOrder = EXCEL_NATURAL_SHEET_ORDER,
  orderMode = 'excel',
  dirtySheets
}: ExcelSheetTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    if (!scrollRef.current) return;
    const activeTab = scrollRef.current.querySelector<HTMLElement>(`[data-tab-key="${activeSheet}"]`);
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeSheet]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const displayOrder = sheetOrder.length > 0 ? sheetOrder : WORKFLOW_SHEET_ORDER;
  const isTechnical = orderMode === 'technical';
  const activeIndex = displayOrder.indexOf(activeSheet);
  const activeMeta = EXCEL_SHEET_METAS[activeSheet];

  return (
    <div className="w-full bg-[#f8fafc] border-b border-[#f1f5f9] select-none">
      {/* 1. MOBILE & TABLET: Dropdown gọn Biểu X/15 · Mã biểu */}
      <div className="flex md:hidden items-center justify-between px-3 py-1.5 bg-[#f8fafc]">
        <div className="relative w-full" ref={mobileMenuRef}>
          <button
            type="button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-expanded={showMobileMenu}
            aria-haspopup="listbox"
            className="w-full flex items-center justify-between gap-2 px-3 h-8.5 bg-white border border-[#cbd5e1] rounded-lg text-xs font-semibold text-[#004776] shadow-2xs cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#005fa3] shrink-0" />
              <span className="truncate">
                Biểu {activeIndex + 1}/{displayOrder.length} · {activeMeta.sheetName}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
          </button>

          {showMobileMenu && (
            <div
              role="listbox"
              className="absolute left-0 top-full mt-1 w-full bg-white rounded-xl border border-[#cbd5e1] shadow-xl z-50 py-1.5 max-h-72 overflow-y-auto animate-in fade-in duration-100"
            >
              <div className="px-3 py-1 text-[11px] font-bold text-[#64748b] border-b border-slate-100">
                15 biểu mẫu theo chuẩn Hướng dẫn số 07
              </div>
              {displayOrder.map((key, idx) => {
                const m = EXCEL_SHEET_METAS[key];
                const isAct = activeSheet === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="option"
                    aria-selected={isAct}
                    onClick={() => { onSelectSheet(key); setShowMobileMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between gap-2 cursor-pointer ${
                      isAct ? 'bg-[#f0f9ff] text-[#004776] font-bold' : 'text-[#476885] hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">
                      {idx + 1}. {m.sheetName} — {m.title}
                    </span>
                    {isAct && <Check className="w-3.5 h-3.5 text-[#004776] shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 2. DESKTOP: Dải Tab Underline cao ~38–40px cuộn ngang */}
      <div className="hidden md:flex items-center gap-1 px-2.5 min-h-[38px] sm:min-h-[40px]">
        {/* Nút mũi tên trái/phải */}
        <div className="flex items-center gap-0.5 shrink-0 pr-1.5 py-1 border-r border-[#e2e8f0]">
          <button
            type="button"
            onClick={onPrev}
            disabled={!canPrev}
            aria-label="Biểu trước"
            title="Biểu tính trước đó"
            className="w-7 h-7 inline-flex items-center justify-center rounded-md hover:bg-white text-[#004776] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!canNext}
            aria-label="Biểu tiếp theo"
            title="Biểu tính tiếp theo"
            className="w-7 h-7 inline-flex items-center justify-center rounded-md hover:bg-white text-[#004776] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable underline tabs */}
        <div
          ref={scrollRef}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          className="flex items-center gap-0.5 overflow-x-auto no-scrollbar scroll-smooth"
          role="tablist"
          aria-label="Danh sách các biểu mẫu 15 sheet theo chuẩn Hướng dẫn 07"
        >
          {displayOrder.map((key, index) => {
            const meta = EXCEL_SHEET_METAS[key];
            const isActive = activeSheet === key;
            const isDirty = dirtySheets?.has(key);

            return (
              <button
                key={key}
                role="tab"
                data-tab-key={key}
                aria-selected={isActive}
                onClick={() => onSelectSheet(key)}
                className={`group relative inline-flex items-center gap-1.5 px-3 h-9.5 text-xs transition-all shrink-0 cursor-pointer border-b-[2.5px] ${
                  isActive
                    ? 'bg-white text-[#004776] border-[#004776] font-bold'
                    : 'bg-transparent text-[#64748b] border-transparent font-medium hover:text-[#004776] hover:bg-slate-50/70'
                }`}
              >
                {isTechnical ? (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] inline-flex items-center justify-center font-bold ${
                      isActive
                        ? 'bg-[#004776] text-white'
                        : 'bg-[#e2e8f0] text-[#476885] group-hover:bg-[#004776] group-hover:text-white'
                    }`}
                    title={`Bước kỹ thuật ${index + 1}`}
                  >
                    B.{index + 1}
                  </span>
                ) : (
                  <FileSpreadsheet
                    className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#005fa3]' : 'text-[#94a3b8]'}`}
                  />
                )}

                <span className="whitespace-nowrap">{meta.sheetName}</span>

                {isDirty && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Sheet có thay đổi chưa lưu" />
                )}
                {key === 'K' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" title="Chỉ tiêu kiểm soát K" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
