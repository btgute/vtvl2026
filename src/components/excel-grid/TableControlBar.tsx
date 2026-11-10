'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, Search, Filter, SlidersHorizontal, Maximize2, Minimize2, X } from 'lucide-react';
import { ExcelSheetMeta } from './excel-grid-types';

interface TableControlBarProps {
  meta: ExcelSheetMeta;
  rowsCount: number;
  searchTerm: string;
  filterMode: 'all' | 'touched' | 'incomplete';
  density: 'compact' | 'comfortable';
  isFullscreen: boolean;
  onSearchChange: (val: string) => void;
  onFilterModeChange: (mode: 'all' | 'touched' | 'incomplete') => void;
  onDensityChange: (density: 'compact' | 'comfortable') => void;
  onToggleFullscreen: () => void;
}

export function TableControlBar({
  meta,
  rowsCount,
  searchTerm,
  filterMode,
  density,
  isFullscreen,
  onSearchChange,
  onFilterModeChange,
  onDensityChange,
  onToggleFullscreen
}: TableControlBarProps) {
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showDensityMenu, setShowDensityMenu] = useState(false);

  const shortName = meta.sheetName.includes('.') ? meta.sheetName.split('.')[1].trim() : meta.sheetName;

  return (
    <div className="px-3.5 py-2.5 bg-white border-b border-[#f1f5f9] flex flex-wrap items-center justify-between gap-2.5">
      <div className="flex items-center gap-2">
        <FileSpreadsheet className="w-4 h-4 text-[#004776]" />
        <h2 className="text-sm sm:text-base font-bold text-[#004776]">
          Dữ liệu {shortName}
        </h2>
        <span className="text-xs text-[#94a3b8] font-normal">({rowsCount} dòng)</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#94a3b8]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm..."
            className="pl-8 pr-7 py-1 text-xs rounded-lg border border-[#cbd5e1] bg-white text-[#004776] w-36 sm:w-48 focus:ring-1 focus:ring-[#004776] outline-hidden"
          />
          {searchTerm && (
            <button type="button" onClick={() => onSearchChange('')} className="absolute right-2 top-1.5 text-[#94a3b8]">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-[#cbd5e1] bg-white text-[#004776] hover:bg-[#f8fafc] cursor-pointer"
          >
            <Filter className="w-3 h-3" />
            <span>Lọc</span>
          </button>
          {showFilterMenu && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg border border-[#cbd5e1] shadow-lg z-30 py-1 text-xs">
              {(['all', 'touched', 'incomplete'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { onFilterModeChange(m); setShowFilterMenu(false); }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-[#f8fafc] ${filterMode === m ? 'font-bold text-[#004776] bg-[#f0f9ff]' : 'text-[#475569]'}`}
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
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-[#cbd5e1] bg-white text-[#004776] hover:bg-[#f8fafc] cursor-pointer"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Cột</span>
          </button>
          {showDensityMenu && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg border border-[#cbd5e1] shadow-lg z-30 py-1 text-xs">
              <button
                type="button"
                onClick={() => { onDensityChange('comfortable'); setShowDensityMenu(false); }}
                className={`w-full text-left px-3 py-1.5 hover:bg-[#f8fafc] ${density === 'comfortable' ? 'font-bold text-[#004776] bg-[#f0f9ff]' : 'text-[#475569]'}`}
              >
                Mật độ: Thoải mái
              </button>
              <button
                type="button"
                onClick={() => { onDensityChange('compact'); setShowDensityMenu(false); }}
                className={`w-full text-left px-3 py-1.5 hover:bg-[#f8fafc] ${density === 'compact' ? 'font-bold text-[#004776] bg-[#f0f9ff]' : 'text-[#475569]'}`}
              >
                Mật độ: Gọn
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleFullscreen}
          className="w-7 h-7 inline-flex items-center justify-center rounded-lg border border-[#cbd5e1] bg-white text-[#004776] hover:bg-[#f8fafc] cursor-pointer"
          title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
