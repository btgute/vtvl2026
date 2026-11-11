'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  const filterRef = useRef<HTMLDivElement>(null);
  const densityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilterMenu(false);
      }
      if (densityRef.current && !densityRef.current.contains(e.target as Node)) {
        setShowDensityMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const isFiltered = filterMode !== 'all';

  return (
    <div className="px-3 sm:px-4 py-1.5 min-h-[44px] bg-white border-b border-[#cbd5e1] flex flex-wrap items-center justify-between gap-2">
      {/* KHỐI TRÁI: Primary button nhỏ + Thêm dòng & Text phụ Tổng số dòng */}
      <div className="flex flex-wrap items-center gap-2.5">
        {!isC1Locked && onAddRow && (
          <button
            type="button"
            onClick={onAddRow}
            className="inline-flex items-center gap-1.5 h-8 px-3 font-semibold text-xs text-white bg-[#004776] hover:bg-[#00385c] rounded-lg cursor-pointer transition-colors shadow-2xs"
            title="Thêm một dòng mới vào biểu hiện tại"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>{meta.key === 'A1' ? '+ Thêm nhiệm vụ' : '+ Thêm dòng mới'}</span>
          </button>
        )}

        <span className="text-xs text-[#64748b]">
          Tổng số: <strong className="font-semibold text-[#004776]">{rowsCount}</strong> dòng
          {selectedCount > 0 && (
            <span className="ml-1 text-[#005fa3] font-medium">({selectedCount} đã chọn)</span>
          )}
        </span>

        {onMobileViewModeChange && (
          <div className="inline-flex md:hidden items-center rounded-lg border border-[#cbd5e1] bg-[#f8fafc] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => onMobileViewModeChange('table')}
              className={`px-2 py-0.5 rounded-md font-medium cursor-pointer transition-colors ${
                mobileViewMode === 'table' ? 'bg-[#004776] text-white font-semibold' : 'text-[#004776]'
              }`}
            >
              Bảng
            </button>
            <button
              type="button"
              onClick={() => onMobileViewModeChange('cards')}
              className={`px-2 py-0.5 rounded-md font-medium cursor-pointer transition-colors ${
                mobileViewMode === 'cards' ? 'bg-[#004776] text-white font-semibold' : 'text-[#004776]'
              }`}
            >
              Phiếu
            </button>
          </div>
        )}
      </div>

      {/* KHỐI PHẢI: Ô tìm kiếm + 3 Ghost buttons icon (Lọc, Cột/Mật độ, Toàn màn hình) */}
      <div className="flex items-center gap-1.5 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-initial">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm trong biểu…"
            className="h-8 pl-8 pr-7 text-xs rounded-lg border border-[#cbd5e1] bg-white text-[#004776] w-full sm:w-48 lg:w-56 focus:ring-2 focus:ring-[#004776]/20 focus:border-[#004776] outline-hidden"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Xóa tìm kiếm"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#004776] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 1. Icon Lọc (Ghost button) */}
        <div className="relative" ref={filterRef}>
          <button
            type="button"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            aria-label="Lọc dữ liệu"
            title="Lọc dòng: Tất cả / Đã sửa / Chưa hoàn tất"
            className={`w-9 h-8 inline-flex items-center justify-center rounded-lg text-[#004776] hover:bg-slate-100 cursor-pointer transition-colors relative ${
              isFiltered ? 'bg-sky-50 text-[#005fa3] font-bold' : ''
            }`}
          >
            <Filter className="w-4 h-4" />
            {isFiltered && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#005fa3]" />
            )}
          </button>
          {showFilterMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-[#cbd5e1] shadow-lg z-30 py-1 text-xs animate-in fade-in duration-100">
              <div className="px-3 py-1 text-[11px] font-bold text-[#64748b] border-b border-slate-100">
                Bộ lọc dòng dữ liệu
              </div>
              {(['all', 'touched', 'incomplete'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { onFilterModeChange(m); setShowFilterMenu(false); }}
                  className={`w-full text-left px-3 py-2 hover:bg-[#f8fafc] cursor-pointer ${
                    filterMode === m ? 'font-semibold text-[#004776] bg-[#f0f9ff]' : 'text-[#476885]'
                  }`}
                >
                  {m === 'all' ? 'Tất cả dòng' : m === 'touched' ? 'Chỉ dòng đã sửa' : 'Chỉ dòng chưa hoàn tất'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Icon Chọn cột / Mật độ (Ghost button) */}
        <div className="relative" ref={densityRef}>
          <button
            type="button"
            onClick={() => setShowDensityMenu(!showDensityMenu)}
            aria-label="Tùy chỉnh mật độ hiển thị bảng"
            title="Tùy chỉnh mật độ: Thoải mái hoặc Gọn"
            className="w-9 h-8 inline-flex items-center justify-center rounded-lg text-[#004776] hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          {showDensityMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-[#cbd5e1] shadow-lg z-30 py-1 text-xs animate-in fade-in duration-100">
              <div className="px-3 py-1 text-[11px] font-bold text-[#64748b] border-b border-slate-100">
                Mật độ hiển thị ô
              </div>
              <button
                type="button"
                onClick={() => { onDensityChange('comfortable'); setShowDensityMenu(false); }}
                className={`w-full text-left px-3 py-2 hover:bg-[#f8fafc] cursor-pointer ${
                  density === 'comfortable' ? 'font-semibold text-[#004776] bg-[#f0f9ff]' : 'text-[#476885]'
                }`}
              >
                Mật độ: Thoải mái
              </button>
              <button
                type="button"
                onClick={() => { onDensityChange('compact'); setShowDensityMenu(false); }}
                className={`w-full text-left px-3 py-2 hover:bg-[#f8fafc] cursor-pointer ${
                  density === 'compact' ? 'font-semibold text-[#004776] bg-[#f0f9ff]' : 'text-[#476885]'
                }`}
              >
                Mật độ: Gọn (nhiều dữ liệu)
              </button>
            </div>
          )}
        </div>

        {/* 3. Icon Toàn màn hình (Ghost button) */}
        <button
          type="button"
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình'}
          title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình'}
          className="w-9 h-8 inline-flex items-center justify-center rounded-lg text-[#004776] hover:bg-slate-100 cursor-pointer transition-colors"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
