'use client';

import React, { useRef, useEffect } from 'react';
import {
  ExcelSheetKey,
  SheetOrderMode,
  EXCEL_NATURAL_SHEET_ORDER,
  WORKFLOW_SHEET_ORDER
} from './excel-grid-types';
import { EXCEL_SHEET_METAS } from './excel-sheet-metas';
import { ChevronLeft, ChevronRight, FileSpreadsheet, Layers, ListOrdered } from 'lucide-react';

interface ExcelSheetTabsProps {
  activeSheet: ExcelSheetKey;
  onSelectSheet: (key: ExcelSheetKey) => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  sheetOrder?: ExcelSheetKey[];
  orderMode?: SheetOrderMode;
  onToggleOrderMode?: (mode: SheetOrderMode) => void;
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
  onToggleOrderMode
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
    <div className="w-full bg-[#f1f5f9] border-t-2 border-[#cbd5e1] select-none shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-1 px-2 py-1.5">
        <div className="flex items-center gap-1 overflow-hidden min-w-0 flex-1">
          {/* Navigation arrows */}
          <div className="flex items-center gap-0.5 shrink-0 pr-1.5 border-r border-[#cbd5e1]">
            <button
              type="button"
              onClick={onPrev}
              disabled={!canPrev}
              aria-label="Sheet trước"
              title="Biểu tính trước đó"
              className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-white text-[#004776] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!canNext}
              aria-label="Sheet tiếp theo"
              title="Biểu tính tiếp theo"
              className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-white text-[#004776] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable list of sheets */}
          <div
            ref={scrollRef}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth py-0.5"
            role="tablist"
            aria-label="Danh sách các sheet nghiệp vụ theo chuẩn Excel"
          >
            {displayOrder.map((key, index) => {
              const meta = EXCEL_SHEET_METAS[key];
              const isActive = activeSheet === key;

              return (
                <button
                  key={key}
                  role="tab"
                  data-tab-key={key}
                  aria-selected={isActive}
                  onClick={() => onSelectSheet(key)}
                  className={`group relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-t-md transition-all shrink-0 cursor-pointer border ${
                    isActive
                      ? 'bg-white text-[#004776] border-[#cbd5e1] border-b-transparent shadow-xs font-bold'
                      : 'bg-[#e2e8f0]/80 text-[#475569] border-transparent hover:bg-white/80 hover:text-[#004776]'
                  }`}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute top-0 left-0 right-0 h-[3px] bg-[#004776] rounded-t-sm"
                    />
                  )}

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
                  {key === 'K' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Chỉ tiêu kiểm soát" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* View mode toggle switch */}
        {onToggleOrderMode && (
          <div className="flex items-center gap-1 bg-[#e2e8f0] p-0.5 rounded-md text-[11px] shrink-0 font-medium border border-[#cbd5e1]">
            <button
              type="button"
              onClick={() => onToggleOrderMode('excel')}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded transition-all cursor-pointer ${
                orderMode === 'excel'
                  ? 'bg-white text-[#004776] font-bold shadow-2xs'
                  : 'text-[#64748b] hover:text-[#004776]'
              }`}
              title="Sắp xếp theo thứ tự số sheet tự nhiên của file Excel (1. A1 -> 15. S)"
            >
              <ListOrdered className="w-3 h-3" />
              <span>Theo file Excel (1..15)</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleOrderMode('technical')}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded transition-all cursor-pointer ${
                orderMode === 'technical'
                  ? 'bg-white text-[#004776] font-bold shadow-2xs'
                  : 'text-[#64748b] hover:text-[#004776]'
              }`}
              title="Sắp xếp theo thứ tự 12 bước liên kết kỹ thuật trong Hướng dẫn chuẩn nhập dữ liệu"
            >
              <Layers className="w-3 h-3" />
              <span>Luồng kỹ thuật (12 bước)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

