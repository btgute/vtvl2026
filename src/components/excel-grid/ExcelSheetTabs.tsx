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
    <div className="w-full bg-[#f8fafc] border-b border-[#cbd5e1] select-none">
      {/* 1. MOBILE & TABLET: Dropdown */}
      <div className="flex md:hidden items-center justify-between px-3 py-2 bg-[#f8fafc]">
        <div className="relative w-full" ref={mobileMenuRef}>
          <button
            type="button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-expanded={showMobileMenu}
            aria-haspopup="listbox"
            className="w-full flex items-center justify-between gap-2 px-3.5 h-10 bg-white border border-[#cbd5e1] rounded-xl text-sm font-bold text-[#004776] shadow-xs cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <FileSpreadsheet className="w-4 h-4 text-[#006cee] shrink-0" />
              <span className="truncate">
                Biểu {activeIndex + 1}/{displayOrder.length} · {activeMeta.sheetName}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-[#20446c] shrink-0" />
          </button>

          {showMobileMenu && (
            <div
              role="listbox"
              className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-2xl border border-[#cbd5e1] shadow-xl z-50 py-2 max-h-72 overflow-y-auto animate-in fade-in duration-100"
            >
              <div className="px-3.5 py-1.5 text-xs font-bold text-[#20446c] border-b border-slate-100">
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
                    className={`w-full text-left px-3.5 py-2.5 text-sm flex items-center justify-between gap-2 cursor-pointer ${
                      isAct ? 'bg-[#e1edf8] text-[#006cee] font-bold' : 'text-[#004776] hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">
                      {idx + 1}. {m.sheetName} — {m.title}
                    </span>
                    {isAct && <Check className="w-4 h-4 text-[#006cee] shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 2. DESKTOP: Dải Tab Underline cao 44px cuộn ngang, chữ to rõ */}
      <div className="hidden md:flex items-center gap-1.5 px-3 min-h-[44px]">
        {/* Nút mũi tên trái/phải */}
        <div className="flex items-center gap-1 shrink-0 pr-2 py-1 border-r border-[#cbd5e1]">
          <button
            type="button"
            onClick={onPrev}
            disabled={!canPrev}
            aria-label="Biểu trước"
            title="Biểu tính trước đó"
            className="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-white text-[#004776] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!canNext}
            aria-label="Biểu tiếp theo"
            title="Biểu tính tiếp theo"
            className="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-white text-[#004776] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable underline tabs */}
        <div
          ref={scrollRef}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth"
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
                className={`group relative inline-flex items-center gap-2 px-3.5 h-11 text-sm transition-all shrink-0 cursor-pointer border-b-[3px] ${
                  isActive
                    ? 'bg-white text-[#006cee] border-[#006cee] font-bold shadow-2xs'
                    : 'bg-transparent text-[#20446c] border-transparent font-semibold hover:text-[#004776] hover:bg-white/60'
                }`}
              >
                {isTechnical ? (
                  <span
                    className={`px-1.5 py-0.5 rounded text-xs inline-flex items-center justify-center font-bold ${
                      isActive
                        ? 'bg-[#006cee] text-white'
                        : 'bg-[#cbd5e1] text-[#004776] group-hover:bg-[#004776] group-hover:text-white'
                    }`}
                  >
                    B.{index + 1}
                  </span>
                ) : (
                  <FileSpreadsheet
                    className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#006cee]' : 'text-[#20446c]'}`}
                  />
                )}

                <span className="whitespace-nowrap">{meta.sheetName}</span>

                {isDirty && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Sheet có thay đổi chưa lưu" />
                )}
                {key === 'K' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" title="Chỉ tiêu kiểm soát K" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
