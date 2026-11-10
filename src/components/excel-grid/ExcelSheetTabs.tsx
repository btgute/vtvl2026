'use client';

import React, { useRef, useEffect } from 'react';
import {
  ExcelSheetKey, SheetOrderMode, EXCEL_NATURAL_SHEET_ORDER, WORKFLOW_SHEET_ORDER
} from './excel-grid-types';
import { EXCEL_SHEET_METAS } from './excel-sheet-metas';
import { ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';

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

  useEffect(() => {
    if (!scrollRef.current) return;
    const activeTab = scrollRef.current.querySelector<HTMLElement>(`[data-tab-key="${activeSheet}"]`);
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeSheet]);

  const displayOrder = sheetOrder.length > 0 ? sheetOrder : WORKFLOW_SHEET_ORDER;
  const isTechnical = orderMode === 'technical';

  return (
    <div className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl select-none shadow-2xs overflow-hidden">
      <div className="flex items-center justify-between gap-1.5 px-2.5 py-1.5">
        <div className="flex items-center gap-1.5 overflow-hidden min-w-0 flex-1">
          {/* Navigation arrows */}
          <div className="flex items-center gap-0.5 shrink-0 pr-1.5 border-r border-[#cbd5e1]">
            <button
              type="button"
              onClick={onPrev}
              disabled={!canPrev}
              aria-label="Sheet trước"
              title="Biểu tính trước đó"
              className="w-7 h-7 inline-flex items-center justify-center rounded-md hover:bg-white text-[#004776] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed border border-transparent hover:border-[#cbd5e1] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!canNext}
              aria-label="Sheet tiếp theo"
              title="Biểu tính tiếp theo"
              className="w-7 h-7 inline-flex items-center justify-center rounded-md hover:bg-white text-[#004776] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed border border-transparent hover:border-[#cbd5e1] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable list of sheets */}
          <div
            ref={scrollRef}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5"
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
                  className={`group relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer border ${
                    isActive
                      ? 'bg-white text-[#004776] border-[#004776] shadow-xs font-bold ring-2 ring-[#004776]/10'
                      : 'bg-[#f1f5f9] text-[#475569] border-[#cbd5e1]/80 hover:bg-white hover:text-[#004776] hover:border-[#004776]/50'
                  }`}
                >
                  {/* Indicator: B.{n} in Technical mode, FileSpreadsheet in Excel mode */}
                  {isTechnical ? (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] inline-flex items-center justify-center font-bold ${
                        isActive
                          ? 'bg-[#004776] text-white'
                          : 'bg-[#cbd5e1] text-[#334155] group-hover:bg-[#004776] group-hover:text-white'
                      }`}
                      title={`Bước kỹ thuật ${index + 1}`}
                    >
                      B.{index + 1}
                    </span>
                  ) : (
                    <FileSpreadsheet
                      className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#004776]' : 'text-[#64748b]'}`}
                    />
                  )}

                  <span className="whitespace-nowrap">{meta.sheetName}</span>

                  {/* Dirty Dot or Control indicator */}
                  {isDirty && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-pulse" title="Sheet có thay đổi chưa lưu" />
                  )}
                  {key === 'K' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Chỉ tiêu kiểm soát K" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
