'use client';

import React, { useRef, useEffect } from 'react';
import {
  ChevronDown, ArrowUpDown, Network, BarChart3,
  Download, Lock, Unlock, Lightbulb, SlidersHorizontal, RefreshCw, Save
} from 'lucide-react';
import { ExcelSheetKey, SheetOrderMode } from './excel-grid-types';

interface ExcelCommandToolsMenuProps {
  activeSheet: ExcelSheetKey;
  orderMode: SheetOrderMode;
  isExporting: boolean;
  isC1Unlocked: boolean;
  onToggleOrderMode: (mode: SheetOrderMode) => void;
  onOpenOrgTreeModal?: () => void;
  onOpenChartModal?: () => void;
  onSaveSheet?: () => void;
  onLoadTcnsData: () => void;
  onLoadRecommendedVtvls: () => void;
  onExportWorkbook: () => void;
  onOpenUnlockModal: () => void;
}

export function ExcelCommandToolsMenu({
  activeSheet,
  orderMode,
  isExporting,
  isC1Unlocked,
  onToggleOrderMode,
  onOpenOrgTreeModal,
  onOpenChartModal,
  onSaveSheet,
  onLoadTcnsData,
  onLoadRecommendedVtvls,
  onExportWorkbook,
  onOpenUnlockModal
}: ExcelCommandToolsMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="h-8.5 px-2 sm:px-3 text-xs font-semibold text-[#004776] hover:bg-slate-200/60 rounded-lg inline-flex items-center gap-1 sm:gap-1.5 cursor-pointer transition-colors border border-[#cbd5e1]/60 lg:border-transparent lg:hover:border-[#cbd5e1]"
        title="Mở menu chức năng mở rộng và công cụ tiện ích"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-[#005fa3]" />
        <span>Công cụ</span>
        <ChevronDown className="w-3.5 h-3.5 text-[#64748b]" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl border border-[#cbd5e1] shadow-xl z-50 py-1.5 animate-in fade-in duration-100"
        >
          {/* Nhóm 1: Điều hướng & Sơ đồ */}
          {onSaveSheet && (
            <button
              type="button"
              role="menuitem"
              onClick={() => { onSaveSheet(); setIsOpen(false); }}
              className="sm:hidden w-full text-left px-3.5 py-2 text-xs text-[#004776] hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
            >
              <Save className="w-3.5 h-3.5 text-[#005fa3]" />
              <span>Lưu dữ liệu biểu này</span>
            </button>
          )}

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onToggleOrderMode(orderMode === 'excel' ? 'technical' : 'excel');
              setIsOpen(false);
            }}
            className="w-full text-left px-3.5 py-2 text-xs text-[#004776] hover:bg-slate-50 flex items-center justify-between gap-2 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#005fa3]" />
              <span>Thứ tự biểu:</span>
            </div>
            <span className="font-bold text-[11px] text-[#005fa3] bg-sky-50 px-2 py-0.5 rounded border border-sky-200/60">
              {orderMode === 'excel' ? 'Theo file Excel' : 'Theo kỹ thuật'}
            </span>
          </button>

          {onOpenOrgTreeModal && (
            <button
              type="button"
              role="menuitem"
              onClick={() => { onOpenOrgTreeModal(); setIsOpen(false); }}
              className="w-full text-left px-3.5 py-2 text-xs text-[#004776] hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
            >
              <Network className="w-3.5 h-3.5 text-[#005fa3]" />
              <span>Sơ đồ VTVL dự kiến</span>
            </button>
          )}

          {onOpenChartModal && (
            <button
              type="button"
              role="menuitem"
              onClick={() => { onOpenChartModal(); setIsOpen(false); }}
              className="w-full text-left px-3.5 py-2 text-xs text-[#004776] hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#005fa3]" />
              <span>Biểu đồ cơ cấu nhân lực (C1–D2)</span>
            </button>
          )}

          <div className="my-1 border-t border-[#f1f5f9]" />

          {/* Nhóm 2: Dữ liệu mẫu & Xuất Excel */}
          <button
            type="button"
            role="menuitem"
            onClick={() => { onLoadTcnsData(); setIsOpen(false); }}
            className="w-full text-left px-3.5 py-2 text-xs text-[#004776] hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#005fa3]" />
            <span>Khôi phục dữ liệu mẫu TCNS</span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => { onLoadRecommendedVtvls(); setIsOpen(false); }}
            className="w-full text-left px-3.5 py-2 text-xs text-[#004776] hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>Nạp gợi ý VTVL chuẩn theo Đề án</span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => { onExportWorkbook(); setIsOpen(false); }}
            disabled={isExporting}
            className="w-full text-left px-3.5 py-2 text-xs text-emerald-800 hover:bg-emerald-50/60 flex items-center gap-2 cursor-pointer font-medium disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isExporting ? 'Đang xuất gói Excel…' : 'Xuất bảng tính Excel (.xlsx)'}</span>
          </button>

          {/* Nhóm 3: Biểu C1 quản trị */}
          {activeSheet === 'C1' && (
            <>
              <div className="my-1 border-t border-[#f1f5f9]" />
              <button
                type="button"
                role="menuitem"
                onClick={() => { onOpenUnlockModal(); setIsOpen(false); }}
                className="w-full text-left px-3.5 py-2 text-xs text-amber-800 hover:bg-amber-50/60 flex items-center gap-2 cursor-pointer font-medium"
              >
                {isC1Unlocked ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>C1 đang mở khóa quản trị</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Mở khóa chỉnh sửa C1</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
