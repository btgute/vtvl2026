'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  ChevronDown,
  ShieldCheck,
  Save,
  ArrowRight,
  MoreHorizontal,
  RefreshCw,
  Sparkles,
  Download,
  KeyRound,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { ExcelSheetKey, SheetOrderMode } from './excel-grid-types';
import { OperatorSession } from '@/services/telemetry/operator-session';

interface WorkspaceActionsRowProps {
  activeSheet: ExcelSheetKey;
  session: OperatorSession | null;
  rowsCount: number;
  isDirty: boolean;
  lastSaved: Date | null;
  orderMode: SheetOrderMode;
  canNext: boolean;
  isExporting: boolean;
  isC1Unlocked: boolean;
  onSwitchSession: () => void;
  onToggleOrderMode: (mode: SheetOrderMode) => void;
  onOpenQualityModal: () => void;
  onSaveSheet: () => void;
  onSaveAndNext: () => void;
  onExportWorkbook: () => void;
  onLoadTcnsData: () => void;
  onLoadRecommendedVtvls: () => void;
  onOpenUnlockModal: () => void;
}

export function WorkspaceActionsRow({
  activeSheet,
  session,
  rowsCount,
  isDirty,
  lastSaved,
  orderMode,
  canNext,
  isExporting,
  isC1Unlocked,
  onSwitchSession,
  onToggleOrderMode,
  onOpenQualityModal,
  onSaveSheet,
  onSaveAndNext,
  onExportWorkbook,
  onLoadTcnsData,
  onLoadRecommendedVtvls,
  onOpenUnlockModal
}: WorkspaceActionsRowProps) {
  const [showOrderMenu, setShowOrderMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const orderMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (orderMenuRef.current && !orderMenuRef.current.contains(target)) setShowOrderMenu(false);
      if (moreMenuRef.current && !moreMenuRef.current.contains(target)) setShowMoreMenu(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5">
      {/* Bên trái: Người dùng & trạng thái dòng */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#475569]">
        <div className="inline-flex items-center gap-1.5 bg-[#f8fafc] px-2.5 py-1 rounded-lg border border-[#e2e8f0]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-[#004776]">{session?.email || 'hoavm@hcmute.edu.vn'}</span>
          <span className="text-[#94a3b8]">·</span>
          <span>{session?.title || 'Nhân viên'}</span>
          <span className="text-[#cbd5e1]">|</span>
          <button
            type="button"
            onClick={onSwitchSession}
            className="font-bold text-[#004776] hover:underline cursor-pointer"
          >
            Đổi
          </button>
        </div>

        <span className="text-[#cbd5e1] hidden sm:inline">|</span>

        <div className="inline-flex items-center gap-1.5">
          <span className="text-[#64748b]">
            {isDirty ? (
              <span className="text-amber-700 font-semibold">Chưa lưu thay đổi · {rowsCount} dòng</span>
            ) : lastSaved ? (
              <span>Đã lưu lúc {lastSaved.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} · {rowsCount} dòng</span>
            ) : (
              <span>Sẵn sàng thao tác · {rowsCount} dòng</span>
            )}
          </span>
        </div>
      </div>

      {/* Bên phải: Dropdown Thứ tự biểu · Kiểm tra dữ liệu · Lưu biểu · Lưu & sang biểu tiếp · ⋯ */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Dropdown Thứ tự biểu */}
        <div className="relative" ref={orderMenuRef}>
          <button
            type="button"
            onClick={() => setShowOrderMenu(!showOrderMenu)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-xs font-semibold text-[#004776] cursor-pointer transition-colors shadow-2xs"
          >
            <Layers className="w-3.5 h-3.5 text-[#004776]" />
            <span>Thứ tự biểu: {orderMode === 'technical' ? 'Luồng kỹ thuật' : 'Theo file Excel'}</span>
            <ChevronDown className="w-3 h-3 text-[#64748b]" />
          </button>

          {showOrderMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl border border-[#cbd5e1] shadow-xl z-50 py-1.5">
              <button
                type="button"
                onClick={() => { onToggleOrderMode('excel'); setShowOrderMenu(false); }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#f8fafc] cursor-pointer ${
                  orderMode === 'excel' ? 'bg-[#f0f9ff] text-[#004776] font-bold' : 'text-[#334155]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#004776]" />
                  <span>Theo file Excel (1..15)</span>
                </span>
                {orderMode === 'excel' && <Check className="w-3.5 h-3.5 text-[#004776]" />}
              </button>
              <button
                type="button"
                onClick={() => { onToggleOrderMode('technical'); setShowOrderMenu(false); }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#f8fafc] cursor-pointer ${
                  orderMode === 'technical' ? 'bg-[#f0f9ff] text-[#004776] font-bold' : 'text-[#334155]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[#004776]" />
                  <span>Luồng kỹ thuật (12 bước)</span>
                </span>
                {orderMode === 'technical' && <Check className="w-3.5 h-3.5 text-[#004776]" />}
              </button>
            </div>
          )}
        </div>

        {/* Kiểm tra dữ liệu */}
        <button
          type="button"
          onClick={onOpenQualityModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-xs font-semibold text-[#004776] cursor-pointer transition-colors shadow-2xs"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#004776]" />
          <span>Kiểm tra dữ liệu</span>
        </button>

        {/* Lưu biểu */}
        <button
          type="button"
          onClick={onSaveSheet}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-xs font-semibold text-[#004776] cursor-pointer transition-colors shadow-2xs"
        >
          <Save className="w-3.5 h-3.5 text-[#004776]" />
          <span>Lưu biểu</span>
        </button>

        {/* Lưu & sang biểu tiếp theo */}
        <button
          type="button"
          onClick={onSaveAndNext}
          disabled={!canNext}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#004776] hover:bg-[#00385c] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <span>Lưu & sang biểu tiếp</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {/* Menu thao tác khác ⋯ */}
        <div className="relative" ref={moreMenuRef}>
          <button
            type="button"
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            aria-label="Thêm thao tác khác"
            className="w-8 h-8 inline-flex items-center justify-center bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[#004776] cursor-pointer transition-colors shadow-2xs"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-xl border border-[#cbd5e1] shadow-xl z-50 py-1.5">
              <button
                type="button"
                onClick={() => { onLoadTcnsData(); setShowMoreMenu(false); }}
                className="w-full text-left px-3.5 py-2 text-xs text-[#334155] hover:bg-[#f8fafc] flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#004776]" />
                <span>Nạp mẫu chuẩn TCNS</span>
              </button>
              <button
                type="button"
                onClick={() => { onLoadRecommendedVtvls(); setShowMoreMenu(false); }}
                className="w-full text-left px-3.5 py-2 text-xs text-[#334155] hover:bg-[#f8fafc] flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Nạp gợi ý danh mục VTVL</span>
              </button>
              {activeSheet === 'C1' && !isC1Unlocked && (
                <button
                  type="button"
                  onClick={() => { onOpenUnlockModal(); setShowMoreMenu(false); }}
                  className="w-full text-left px-3.5 py-2 text-xs text-[#334155] hover:bg-[#f8fafc] flex items-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  <span>Mở khóa chỉnh sửa C1</span>
                </button>
              )}
              <div className="border-t border-[#f1f5f9] my-1" />
              <button
                type="button"
                onClick={() => { onExportWorkbook(); setShowMoreMenu(false); }}
                disabled={isExporting}
                className="w-full text-left px-3.5 py-2 text-xs text-[#004776] font-semibold hover:bg-[#f0f9ff] flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#004776]" />
                <span>{isExporting ? 'Đang xuất...' : 'Xuất tệp Excel (.xlsx)'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
