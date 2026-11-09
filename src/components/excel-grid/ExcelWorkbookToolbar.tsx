'use client';

import React from 'react';
import { ExcelSheetKey, ExcelSheetMeta } from './excel-grid-types';
import { HcmuteUnit } from '@/types/vtvl';
import { OperatorSession } from '@/services/telemetry/operator-session';
import { ValidationReport } from '@/services/validation/vtvl-validation-types';
import { QD2266_28_UNITS_CATALOG } from '@/configs/hcmute-qd2266-missions';
import {
  Download, Building2, Sparkles, ShieldCheck, CheckCircle2, RefreshCw
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
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Operator identification & Unit selector */}
      <div className="flex flex-wrap items-center gap-2">
        {session ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#004776]/5 border border-[#004776]/20 text-xs">
            <span className="font-bold text-[#004776]">👤 {session.email}</span>
            <span className="text-[#cbd5e1]">|</span>
            <span className="text-[#334155] font-semibold">🏢 {session.unitNameVi}</span>
            <span className="text-[#cbd5e1]">|</span>
            <span className="text-[#64748b]">🏷️ {session.title}</span>
            <button
              type="button"
              onClick={onSwitchSession}
              className="ml-1 text-[11px] font-bold text-[#004776] hover:underline cursor-pointer"
              title="Đổi tài khoản email hoặc đơn vị công tác"
            >
              (Đổi)
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onSwitchSession}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-xs animate-pulse"
          >
            ⚠️ Điền email &amp; đơn vị để bắt đầu
          </button>
        )}

        {isRestoredSession && (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200">
            Đã khôi phục phiên trước
          </span>
        )}
      </div>

      {/* Quick actions: Unit Selector, VTVL Templates, Save, QA & Export */}
      <div className="flex flex-wrap items-center gap-2">
        {activeSheet === 'A1' && (
          <div className="flex items-center gap-1.5 bg-[#f1f5f9] px-2 py-1 rounded-lg border border-[#cbd5e1]">
            <span className="text-xs font-bold text-[#004776]">Đơn vị QĐ 2266:</span>
            <select
              value={unitCode}
              onChange={(e) => onUnitChange(e.target.value)}
              className="bg-white border border-[#cbd5e1] rounded px-2 py-0.5 text-xs font-bold text-[#004776] cursor-pointer"
            >
              {QD2266_28_UNITS_CATALOG.map((u) => (
                <option key={u.code} value={u.code}>
                  PL{u.plNum < 10 ? `0${u.plNum}` : u.plNum} · {u.code} – {u.nameVi}
                </option>
              ))}
            </select>
          </div>
        )}

        {activeSheet === 'C1' && (
          <>
            <button
              type="button"
              onClick={() => (!isC1Unlocked ? onOpenUnlockModal() : onLoadRecommendedVtvls())}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#004776] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg cursor-pointer transition-colors"
              title={`Nạp danh mục VTVL chuẩn theo loại hình ${currentUnit.nameVi}`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#004776]" />
              <span>Nạp VTVL chuẩn {currentUnit.code}</span>
            </button>
            <button
              type="button"
              onClick={() => (!isC1Unlocked ? onOpenUnlockModal() : onLoadFullPl1Catalog())}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#004776] bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg cursor-pointer transition-colors"
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#004776] bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-lg cursor-pointer transition-colors"
          title="Nạp toàn bộ 39 nhiệm vụ và 200 công việc mẫu của Phòng Tổ chức - Nhân sự"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Nạp mẫu chuẩn TCNS</span>
        </button>

        <button
          type="button"
          onClick={onSaveSheet}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer transition-colors shadow-2xs"
          title="Lưu lại bảng tính của biểu hiện tại"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Lưu biểu {activeMeta.shortLabel}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectSheet('K')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer border transition-colors ${
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#004776] bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg cursor-pointer transition-colors shadow-2xs"
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
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#004776] hover:bg-[#00385c] rounded-lg cursor-pointer shadow-2xs transition-colors disabled:opacity-50"
        >
          {isExporting ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>{isExporting ? 'Đang tạo...' : 'Xuất tệp Excel (.xlsx)'}</span>
        </button>
      </div>
    </div>
  );
}
