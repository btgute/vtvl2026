'use client';

import React from 'react';
import { ExcelSheetKey, ExcelSheetMeta } from './excel-grid-types';
import { HcmuteUnit } from '@/types/vtvl';
import { OperatorSession } from '@/services/telemetry/operator-session';
import { ValidationReport } from '@/services/validation/vtvl-validation-types';
import { QD2266_GROUPED_UNITS_CATALOG } from '@/configs/hcmute-qd2266-missions';
import {
  Download, Building2, Sparkles, ShieldCheck, CheckCircle2, RefreshCw, TableProperties,
  UserCheck, Briefcase, ArrowLeftRight
} from 'lucide-react';

interface ExcelWorkbookToolbarProps {
  session: OperatorSession | null;
  unitCode: string;
  currentUnit: HcmuteUnit;
  isRestoredSession: boolean;
  activeSheet: ExcelSheetKey;
  activeMeta: ExcelSheetMeta;
  isC1Unlocked: boolean;
  isExporting: boolean;
  qualityReport: ValidationReport;
  isDirty?: boolean;
  lastSaved?: string;
  onSwitchSession: () => void;
  onUnitChange: (code: string) => void;
  onOpenUnlockModal: () => void;
  onLoadRecommendedVtvls: () => void;
  onLoadFullPl1Catalog: () => void;
  onLoadTcnsData: () => void;
  onSaveSheet: () => void;
  onSelectSheet: (key: ExcelSheetKey) => void;
  onShowQualityModal: () => void;
  onExportWorkbook: () => void;
}

export function ExcelWorkbookToolbar({
  session,
  unitCode,
  currentUnit,
  isRestoredSession,
  activeSheet,
  activeMeta,
  isC1Unlocked,
  isExporting,
  qualityReport,
  isDirty,
  lastSaved,
  onSwitchSession,
  onUnitChange,
  onOpenUnlockModal,
  onLoadRecommendedVtvls,
  onLoadFullPl1Catalog,
  onLoadTcnsData,
  onSaveSheet,
  onSelectSheet,
  onShowQualityModal,
  onExportWorkbook
}: ExcelWorkbookToolbarProps) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 w-full">
      {/* Group Left: Title Badge + Operator Session + Dirty State */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Title badge: Bảng tính Excel 15 sheet */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#004776]/10 text-[#004776] border border-[#004776]/25 shrink-0 shadow-2xs">
          <TableProperties className="w-4 h-4 text-[#004776]" />
          <span>Bảng tính Excel 15 sheet</span>
        </div>

        {/* Operator identification */}
        {session ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-linear-to-r from-blue-50/80 via-white to-sky-50/80 border border-[#004776]/30 shadow-2xs hover:border-[#004776]/60 transition-all text-xs shrink-0">
            <span className="relative flex h-2 w-2 shrink-0" title="Tài khoản cán bộ đang xác thực &amp; đồng bộ">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>

            <div className="inline-flex items-center gap-1.5 font-bold text-[#004776]" title="Email công vụ người thực hiện">
              <span className="w-5 h-5 rounded-md bg-[#004776]/10 flex items-center justify-center shrink-0">
                <UserCheck className="w-3.5 h-3.5 text-[#004776]" />
              </span>
              <span className="font-mono tracking-tight">{session.email}</span>
            </div>

            <span className="h-3.5 w-px bg-[#004776]/20 shrink-0" />

            <div className="inline-flex items-center gap-1.5 font-bold text-[#004776]" title="Đơn vị công tác">
              <span className="w-5 h-5 rounded-md bg-[#004776]/10 flex items-center justify-center shrink-0">
                <Building2 className="w-3.5 h-3.5 text-[#004776]" />
              </span>
              <span>{session.unitNameVi || currentUnit.nameVi}</span>
            </div>

            <span className="h-3.5 w-px bg-[#004776]/20 shrink-0" />

            <div className="inline-flex items-center gap-1.5 font-semibold text-[#004776]/85" title="Chức vụ người điền">
              <span className="w-5 h-5 rounded-md bg-[#004776]/10 flex items-center justify-center shrink-0">
                <Briefcase className="w-3.5 h-3.5 text-[#004776]" />
              </span>
              <span>{session.title}</span>
            </div>

            <button
              type="button"
              onClick={onSwitchSession}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold text-white bg-[#004776] hover:bg-[#00385c] active:scale-95 transition-all shadow-2xs cursor-pointer shrink-0 ml-1"
              title="Đổi tài khoản email hoặc đơn vị công tác"
            >
              <ArrowLeftRight className="w-3 h-3 text-white" />
              <span>Đổi</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onSwitchSession}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors shrink-0 animate-pulse"
          >
            <UserCheck className="w-4 h-4" />
            <span>Khai báo email &amp; đơn vị để bắt đầu</span>
          </button>
        )}

        {/* Dirty State Indicator */}
        {isDirty ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 shadow-2xs shrink-0 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span>Chưa lưu</span>
          </span>
        ) : lastSaved ? (
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 shrink-0">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Đã lưu lúc {lastSaved}</span>
          </span>
        ) : null}

        {isRestoredSession && (
          <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 shrink-0">
            Đã khôi phục phiên trước
          </span>
        )}
      </div>

      {/* Group Right: Unit Selector & Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Unit Selector */}
        <div className="flex items-center gap-1.5 bg-[#f1f5f9] px-2.5 py-1 rounded-xl border border-[#cbd5e1]">
          <span className="text-xs font-bold text-[#004776] shrink-0">Đơn vị:</span>
          <select
            value={unitCode}
            onChange={(e) => onUnitChange(e.target.value)}
            className="bg-white border border-[#cbd5e1] rounded-lg px-2.5 py-1 text-xs font-bold text-[#004776] cursor-pointer max-w-[240px] sm:max-w-[320px]"
            title="Chọn Khoa, Viện, Phòng ban hoặc Trung tâm để tải dữ liệu"
          >
            {QD2266_GROUPED_UNITS_CATALOG.map((group) => (
              <optgroup key={group.groupLabel} label={group.groupLabel}>
                {group.units.map((u) => (
                  <option key={u.code} value={u.code}>
                    [{u.code}] {u.nameVi} {u.plLabel ? `(${u.plLabel})` : ''}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {activeSheet === 'C1' && (
          <>
            <button
              type="button"
              onClick={() => (!isC1Unlocked ? onOpenUnlockModal() : onLoadRecommendedVtvls())}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#004776] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl cursor-pointer transition-colors"
              title={`Nạp danh mục VTVL chuẩn theo loại hình ${currentUnit.nameVi}`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#004776]" />
              <span>Nạp VTVL chuẩn {currentUnit.code}</span>
            </button>
            <button
              type="button"
              onClick={() => (!isC1Unlocked ? onOpenUnlockModal() : onLoadFullPl1Catalog())}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#004776] bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl cursor-pointer transition-colors"
              title="Nạp toàn bộ 56 VTVL chuẩn theo Phụ lục I kèm Quyết định của Hiệu trưởng"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Nạp trọn bộ 56 VTVL (PL1)</span>
            </button>
          </>
        )}

        <button
          type="button"
          onClick={onLoadTcnsData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#004776] bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-xl cursor-pointer transition-colors"
          title="Nạp toàn bộ 39 nhiệm vụ và 200 công việc mẫu của Phòng Tổ chức - Nhân sự"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Nạp mẫu chuẩn TCNS</span>
        </button>

        <button
          type="button"
          onClick={onSaveSheet}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl cursor-pointer transition-colors shadow-2xs"
          title="Lưu lại bảng tính của biểu hiện tại"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Lưu biểu {activeMeta.shortLabel}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectSheet('K')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer border transition-colors ${
            activeSheet === 'K'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-300'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Kiểm tra chéo K</span>
        </button>

        <button
          type="button"
          onClick={onShowQualityModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#004776] bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl cursor-pointer transition-colors shadow-2xs"
          title="Bộ máy kiểm soát chất lượng dữ liệu 15 sheet theo chuẩn Hướng dẫn số 07-HD/BTCTW"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          <span>Kiểm tra chất lượng (QA)</span>
          {qualityReport.summary.fixCount > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-600 text-white font-bold">
              {qualityReport.summary.fixCount}
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-600 text-white font-bold">
              {qualityReport.summary.scorePercent}đ
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onExportWorkbook}
          disabled={isExporting}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#004776] hover:bg-[#00385c] rounded-xl cursor-pointer shadow-2xs transition-colors disabled:opacity-50"
        >
          {isExporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          <span>{isExporting ? 'Đang tạo...' : 'Xuất tệp Excel (.xlsx)'}</span>
        </button>
      </div>
    </div>
  );
}
