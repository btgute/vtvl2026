'use client';

import React from 'react';
import {
  ChevronDown, ArrowUpDown, Network, BarChart3,
  Download, Lock, Unlock, Lightbulb, SlidersHorizontal, RefreshCw, Save
} from 'lucide-react';
import { ExcelSheetKey, SheetOrderMode } from './excel-grid-types';
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from '@/components/ui/Popover';

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
  return (
    <Popover>
      <PopoverTrigger>
        <span
          className="h-9 px-3 text-[13.5px] font-semibold text-[#004776] hover:bg-[#e1edf8] rounded-xl inline-flex items-center gap-1.5 transition-colors border border-[#d8e3ef] bg-white"
          title="Mở menu chức năng mở rộng và công cụ tiện ích"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#006cee]" />
          <span>Công cụ</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#476885]" />
        </span>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-72 p-2 space-y-0.5">
        {onSaveSheet && (
          <PopoverClose onClick={onSaveSheet}>
            <div className="sm:hidden w-full text-left px-3 py-2 text-[13px] text-[#004776] hover:bg-[#f4f7fb] rounded-lg flex items-center gap-2.5 font-semibold">
              <Save className="w-4 h-4 text-[#006cee]" />
              <span>Lưu dữ liệu biểu này</span>
            </div>
          </PopoverClose>
        )}

        <PopoverClose onClick={() => onToggleOrderMode(orderMode === 'excel' ? 'technical' : 'excel')}>
          <div className="w-full text-left px-3 py-2 text-[13px] text-[#004776] hover:bg-[#f4f7fb] rounded-lg flex items-center justify-between gap-2 font-medium">
            <div className="flex items-center gap-2.5">
              <ArrowUpDown className="w-4 h-4 text-[#006cee]" />
              <span>Thứ tự biểu:</span>
            </div>
            <span className="font-bold text-xs text-[#006cee] bg-[#eef5ff] px-2 py-0.5 rounded-md border border-[#c7def4]">
              {orderMode === 'excel' ? 'Theo Excel' : 'Theo kỹ thuật'}
            </span>
          </div>
        </PopoverClose>

        {onOpenOrgTreeModal && (
          <PopoverClose onClick={onOpenOrgTreeModal}>
            <div className="w-full text-left px-3 py-2 text-[13px] text-[#004776] hover:bg-[#f4f7fb] rounded-lg flex items-center gap-2.5 font-medium">
              <Network className="w-4 h-4 text-[#006cee]" />
              <span>Sơ đồ VTVL dự kiến</span>
            </div>
          </PopoverClose>
        )}

        {onOpenChartModal && (
          <PopoverClose onClick={onOpenChartModal}>
            <div className="w-full text-left px-3 py-2 text-[13px] text-[#004776] hover:bg-[#f4f7fb] rounded-lg flex items-center gap-2.5 font-medium">
              <BarChart3 className="w-4 h-4 text-[#006cee]" />
              <span>Biểu đồ cơ cấu nhân lực</span>
            </div>
          </PopoverClose>
        )}

        <div className="my-1 border-t border-[#e8eff7]" />

        <PopoverClose onClick={onLoadTcnsData}>
          <div className="w-full text-left px-3 py-2 text-[13px] text-[#004776] hover:bg-[#f4f7fb] rounded-lg flex items-center gap-2.5 font-medium">
            <RefreshCw className="w-4 h-4 text-[#006cee]" />
            <span>Khôi phục dữ liệu mẫu TCNS</span>
          </div>
        </PopoverClose>

        <PopoverClose onClick={onLoadRecommendedVtvls}>
          <div className="w-full text-left px-3 py-2 text-[13px] text-[#004776] hover:bg-[#f4f7fb] rounded-lg flex items-center gap-2.5 font-medium">
            <Lightbulb className="w-4 h-4 text-[#8f4f00]" />
            <span>Nạp gợi ý VTVL chuẩn theo Đề án</span>
          </div>
        </PopoverClose>

        <PopoverClose onClick={() => { if (!isExporting) onExportWorkbook(); }}>
          <div className={`w-full text-left px-3 py-2 text-[13px] text-[#13653f] hover:bg-[#e3f5ec]/60 rounded-lg flex items-center gap-2.5 font-semibold ${isExporting ? 'opacity-50' : ''}`}>
            <Download className="w-4 h-4 text-[#13653f]" />
            <span>{isExporting ? 'Đang xuất gói Excel…' : 'Xuất bảng tính Excel'}</span>
          </div>
        </PopoverClose>

        {activeSheet === 'C1' && (
          <>
            <div className="my-1 border-t border-[#e8eff7]" />
            <PopoverClose onClick={onOpenUnlockModal}>
              <div className="w-full text-left px-3 py-2 text-[13px] text-[#8f4f00] hover:bg-[#fdf2e1]/60 rounded-lg flex items-center gap-2.5 font-semibold">
                {isC1Unlocked ? (
                  <>
                    <Unlock className="w-4 h-4 text-[#13653f]" />
                    <span>C1 đang mở khóa quản trị</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-[#8f4f00]" />
                    <span>Mở khóa chỉnh sửa C1</span>
                  </>
                )}
              </div>
            </PopoverClose>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
