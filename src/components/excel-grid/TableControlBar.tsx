'use client';

import React, { useState } from 'react';
import { Search, Filter, SlidersHorizontal, Maximize2, Minimize2, X, Plus } from 'lucide-react';
import { ExcelSheetMeta } from './excel-grid-types';

interface TableControlBarProps {
  meta: ExcelSheetMeta;
  rowsCount: number;
  selectedCount?: number;
  isC1Locked?: boolean;
  searchTerm: string;
  filterMode: 'all' | 'touched' | 'incomplete';
  density: 'compact' | 'comfortable';
  isFullscreen: boolean;
  mobileViewMode?: 'table' | 'cards';
  onMobileViewModeChange?: (mode: 'table' | 'cards') => void;
  onAddRow?: () => void;
  onSearchChange: (val: string) => void;
  onFilterModeChange: (mode: 'all' | 'touched' | 'incomplete') => void;
  onDensityChange: (density: 'compact' | 'comfortable') => void;
  onToggleFullscreen: () => void;
}

export function TableControlBar({
  meta,
  rowsCount,
  selectedCount = 0,
  isC1Locked = false,
  searchTerm,
  filterMode,
  density,
  isFullscreen,
  mobileViewMode = 'table',
  onMobileViewModeChange,
  onAddRow,
  onSearchChange,
  onFilterModeChange,
  onDensityChange,
  onToggleFullscreen
}: TableControlBarProps) {
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showDensityMenu, setShowDensityMenu] = useState(false);

  return (
    <div className="px-3 sm:px-4 py-2.5 bg-white border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2.5">
      <div className="flex flex-wrap items-center gap-2">
        {!isC1Locked && onAddRow && (
          <button
            type="button"
            onClick={onAddRow}
            className="inline-flex items-center gap-1.5 h-10 sm:h-9 px-3 font-medium text-xs text-white bg-[#004776] hover:bg-[#00385c] rounded-lg cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{meta.key === 'A1' ? 'Thêm nhiệm vụ' : 'Thêm dòng mới'}</span>
          </button>
        )}
        <span className="text-xs text-[#476885] tabular-nums">
          Tổng số: <strong className="font-semibold text-[#004776]">{rowsCount}</strong> dòng
          {selectedCount > 0 && <span className="ml-1.5 text-[#004776] font-medium">({selectedCount} đã chọn)</span>}
        </span>
        {onMobileViewModeChange && (
          <div className="inline-flex md:hidden items-center rounded-lg border border-[#cbd5e1] bg-[#f8fafc] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => onMobileViewModeChange('table')}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                mobileViewMode === 'table' ? 'bg-[#004776] text-white font-semibold' : 'text-[#004776]'
              }`}
            >
              Dạng bảng
            </button>
            <button
              type="button"
              onClick={() => onMobileViewModeChange('cards')}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                mobileViewMode === 'cards' ? 'bg-[#004776] text-white font-semibold' : 'text-[#004776]'
              }`}
            >
              Phiếu nhập
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-initial">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-3 sm:top-2.5 text-[#94a3b8]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm trong biểu..."
            className="h-10 sm:h-9 pl-8 pr-7 text-sm sm:text-xs rounded-lg border border-[#cbd5e1] bg-white text-[#004776] w-full sm:w-52 focus:ring-2 focus:ring-[#004776]/20 focus:border-[#004776] outline-hidden"
          />
          {searchTerm && (
            <button type="button" onClick={() => onSearchChange('')} aria-label="Xóa tìm kiếm" className="absolute right-2 top-3 sm:top-2.5 text-[#94a3b8]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="inline-flex items-center gap-1.5 h-10 sm:h-9 px-2.5 text-xs font-medium rounded-lg border border-[#cbd5e1] bg-white text-[#004776] hover:bg-[#f8fafc] cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Lọc</span>
          </button>
          {showFilterMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg border border-[#cbd5e1] shadow-md z-30 py-1 text-xs">
              {(['all', 'touched', 'incomplete'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { onFilterModeChange(m); setShowFilterMenu(false); }}
                  className={`w-full text-left px-3 py-2 sm:py-1.5 hover:bg-[#f8fafc] ${filterMode === m ? 'font-semibold text-[#004776] bg-[#f0f9ff]' : 'text-[#476885]'}`}
                >
                  {m === 'all' ? 'Tất cả dòng' : m === 'touched' ? 'Đã sửa' : 'Chưa hoàn tất'}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDensityMenu(!showDensityMenu)}
            className="inline-flex items-center gap-1.5 h-10 sm:h-9 px-2.5 text-xs font-medium rounded-lg border border-[#cbd5e1] bg-white text-[#004776] hover:bg-[#f8fafc] cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Mật độ</span>
          </button>
          {showDensityMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg border border-[#cbd5e1] shadow-md z-30 py-1 text-xs">
              <button
                type="button"
                onClick={() => { onDensityChange('comfortable'); setShowDensityMenu(false); }}
                className={`w-full text-left px-3 py-2 sm:py-1.5 hover:bg-[#f8fafc] ${density === 'comfortable' ? 'font-semibold text-[#004776] bg-[#f0f9ff]' : 'text-[#476885]'}`}
              >
                Mật độ: Thoải mái
              </button>
              <button
                type="button"
                onClick={() => { onDensityChange('compact'); setShowDensityMenu(false); }}
                className={`w-full text-left px-3 py-2 sm:py-1.5 hover:bg-[#f8fafc] ${density === 'compact' ? 'font-semibold text-[#004776] bg-[#f0f9ff]' : 'text-[#476885]'}`}
              >
                Mật độ: Gọn
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình'}
          className="w-10 h-10 sm:w-9 sm:h-9 inline-flex items-center justify-center rounded-lg border border-[#cbd5e1] bg-white text-[#004776] hover:bg-[#f8fafc] cursor-pointer"
          title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
