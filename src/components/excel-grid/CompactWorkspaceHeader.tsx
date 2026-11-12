'use client';

import React from 'react';
import { ExcelSheetMeta } from './excel-grid-types';
import { HcmuteUnit } from '@/types/vtvl';
import {
  HelpCircle,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers
} from 'lucide-react';
import { DotPattern } from '@/components/ui/DotPattern';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface CompactWorkspaceHeaderProps {
  activeMeta: ExcelSheetMeta;
  currentUnit: HcmuteUnit;
  activeStep: number;
  activeSheetIndex: number;
  totalSheets: number;
  rowsCount: number;
  isDirty: boolean;
  lastSaved?: string;
  isSaving?: boolean;
  fixCount: number;
  onOpenGuidance: () => void;
  onOpenQualityModal: () => void;
}

export function CompactWorkspaceHeader({
  activeMeta,
  currentUnit,
  activeStep,
  activeSheetIndex,
  totalSheets,
  rowsCount,
  isDirty,
  lastSaved,
  isSaving,
  fixCount,
  onOpenGuidance,
  onOpenQualityModal
}: CompactWorkspaceHeaderProps) {
  return (
    <div className="relative overflow-hidden bg-white border border-[#cbd5e1] rounded-2xl p-4 sm:p-5 shadow-xs w-full max-w-full min-w-0 space-y-3.5">
      {/* Background DotPattern */}
      <DotPattern
        width={18}
        height={18}
        cr={1.2}
        className="text-[#006cee]/15 [mask-image:radial-gradient(ellipse_at_top_right,white,transparent_70%)]"
      />

      {/* DÒNG 1: Tên biểu hiện tại · Đơn vị · Bước & Tiến độ · Nút Hướng dẫn */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[#f1f5f9] pb-3">
        <div className="flex flex-wrap items-center gap-2.5 min-w-0">
          {/* Badge mã biểu */}
          <Badge variant="default" className="text-sm font-extrabold px-3 py-1 shadow-xs">
            {activeMeta.sheetName}
          </Badge>

          {/* Tên biểu - Chữ to, đậm, rõ nét */}
          <h1 className="text-base sm:text-xl font-bold text-[#004776] tracking-tight truncate max-w-[300px] sm:max-w-[480px] md:max-w-[620px]">
            {activeMeta.title}
          </h1>

          <span className="hidden sm:inline-block text-[#cbd5e1]">|</span>

          {/* Đơn vị */}
          <div className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#004776] bg-[#e1edf8] px-3 py-1 rounded-xl border border-[#cbd5e1] shrink-0">
            <Building2 className="w-4 h-4 text-[#006cee]" />
            <span className="text-[#006cee]">[{currentUnit.code}]</span>
            <span className="truncate max-w-[220px]">{currentUnit.nameVi}</span>
          </div>
        </div>

        {/* Nhóm bên phải: Tiến độ bước + Nút Hướng dẫn */}
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="secondary" className="px-3 py-1 text-xs font-bold gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#006cee]" />
            <span>Bước {activeStep}/8</span>
            <span className="text-[#94a3b8]">·</span>
            <span>Biểu {activeSheetIndex + 1}/{totalSheets}</span>
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenGuidance}
            className="text-xs font-bold border-[#cbd5e1] hover:border-[#006cee]"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#006cee]" />
            <span className="hidden sm:inline">Căn cứ HD 07</span>
          </Button>
        </div>
      </div>

      {/* DÒNG 2: Trạng thái lưu · Số dòng · Trạng thái QA / Cảnh báo */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 text-xs sm:text-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Trạng thái lưu */}
          {isSaving ? (
            <Badge variant="secondary" className="text-sky-800 bg-sky-50 border-sky-200 gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
              <span>Đang lưu máy chủ...</span>
            </Badge>
          ) : isDirty ? (
            <Badge variant="warning" className="gap-1.5 font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Có thay đổi chưa lưu</span>
            </Badge>
          ) : lastSaved ? (
            <Badge variant="success" className="gap-1.5 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đã lưu an toàn ({lastSaved})</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 font-medium text-[#20446c]">
              <Clock className="w-3 h-3" />
              <span>Sẵn sàng thao tác</span>
            </Badge>
          )}

          {/* Số dòng */}
          <span className="text-[#20446c] font-medium">
            Số hàng dữ liệu: <strong className="text-[#004776] font-bold tabular-nums">{rowsCount}</strong>
          </span>
        </div>

        {/* Trạng thái kiểm tra QA / Cảnh báo */}
        <div className="flex items-center gap-2">
          {fixCount > 0 ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={onOpenQualityModal}
              className="text-xs font-bold px-3 py-1 h-7"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{fixCount} cảnh báo cần xem</span>
            </Button>
          ) : (
            <Badge variant="success" className="font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dữ liệu hợp chuẩn</span>
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
