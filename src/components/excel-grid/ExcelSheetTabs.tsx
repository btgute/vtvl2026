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
    <div className="w-full bg-[#f8fafc] border-b border-[var(--border-subtle)] select-none overflow-hidden">
      <div className="flex items-center gap-1 px-2.5">
        {/* Navigation arrows */}
        <div className="flex items-center gap-0.5 shrink-0 pr-1.5 py-1 border-r border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={onPrev}
            disabled={!canPrev}
            aria-label="Sheet trước"
            title="Biểu tính trước đó"
            className="w-7 h-7 inline-flex items-center justify-center rounded-md hover:bg-white text-[#004776] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!canNext}
            aria-label="Sheet tiếp theo"
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
                className={`group relative inline-flex items-center gap-1.5 px-3 h-10 text-xs transition-all shrink-0 cursor-pointer border-b-[3px] ${
                  isActive
                    ? 'bg-white text-[#004776] border-[#004776] font-semibold'
                    : 'bg-transparent text-[#476885] border-transparent font-medium hover:bg-white/70 hover:text-[#004776]'
                }`}
              >
                {isTechnical ? (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] inline-flex items-center justify-center font-semibold ${
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
                    className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#004776]' : 'text-[#64748b]'}`}
                  />
                )}

                <span className="whitespace-nowrap">{meta.sheetName}</span>

                {isDirty && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--warn)] shrink-0" title="Sheet có thay đổi chưa lưu" />
                )}
                {key === 'K' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--ok)] shrink-0" title="Chỉ tiêu kiểm soát K" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
