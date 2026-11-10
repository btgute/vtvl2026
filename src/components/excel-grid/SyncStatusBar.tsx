'use client';

import React from 'react';
import {
  CheckCircle2, RefreshCw, AlertTriangle, WifiOff,
  Save, User, Building2, Layers, AlertCircle, Database
} from 'lucide-react';
import { OperatorSession } from '@/services/telemetry/operator-session';
import { SyncStatusKind, DataSourceKind, ApiSyncError } from './useOperatorSession';

interface SyncStatusBarProps {
  session: OperatorSession | null;
  unitNameVi: string;
  revision: number;
  syncStatus: SyncStatusKind;
  dataSource?: DataSourceKind;
  apiError?: ApiSyncError | null;
  lastSyncedAt: string | null;
  onSaveNow: () => void;
  onSwitchSession: () => void;
  onRetry?: () => void;
}

export function SyncStatusBar({
  session,
  unitNameVi,
  revision,
  syncStatus,
  dataSource = 'sample',
  apiError,
  lastSyncedAt,
  onSaveNow,
  onSwitchSession,
  onRetry
}: SyncStatusBarProps) {
  if (!session) return null;

  return (
    <div className="space-y-1.5">
      <div className="bg-white border-y border-[#cbd5e1] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
        {/* Thông tin người thực hiện & đơn vị */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[#004776]">
          <div className="flex items-center gap-1.5 font-bold">
            <User className="w-3.5 h-3.5 text-[#004776]/70 shrink-0" />
            <span className="truncate max-w-[200px]" title={session.email}>
              {session.email}
            </span>
            <span className="text-[11px] font-normal text-[#64748b]">
              ({session.title || 'Người thực hiện'})
            </span>
          </div>

          <span className="hidden sm:inline text-[#cbd5e1]">|</span>

          <div className="flex items-center gap-1.5 font-semibold">
            <Building2 className="w-3.5 h-3.5 text-[#004776]/70 shrink-0" />
            <span className="bg-[#004776]/10 px-1.5 py-0.5 rounded text-[11px] font-bold">
              {session.unitCode}
            </span>
            <span className="truncate max-w-[220px]" title={unitNameVi}>
              {unitNameVi}
            </span>
          </div>

          <span className="hidden md:inline text-[#cbd5e1]">|</span>

          <div className="hidden md:flex items-center gap-1 text-[#64748b]">
            <Layers className="w-3.5 h-3.5 text-[#64748b]" />
            <span>Phiên bản: <strong>v{revision}</strong></span>
          </div>
        </div>

        {/* Trạng thái nguồn dữ liệu & đồng bộ */}
        <div className="flex flex-wrap items-center gap-2">
          {dataSource === 'sample' && (
            <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-300 font-semibold text-[11px]">
              <Database className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>Dữ liệu mẫu ban đầu — chưa tạo hồ sơ máy chủ</span>
            </span>
          )}

          {dataSource === 'local_draft' && (
            <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-bold text-[11px]">
              <Save className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Bản nháp trên thiết bị — chưa đồng bộ máy chủ</span>
            </span>
          )}

          {dataSource === 'server_created' && (
            <span className="inline-flex items-center gap-1 text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 font-bold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Đã tạo hồ sơ máy chủ (v1) — sẵn sàng nhập liệu</span>
            </span>
          )}

          {dataSource === 'server_restored' && (
            <span className="inline-flex items-center gap-1 text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 font-bold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Hồ sơ đã khôi phục từ máy chủ (v{revision})</span>
            </span>
          )}

          {dataSource === 'server_synced' && (
            <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Đã đồng bộ revision {revision} {lastSyncedAt ? `lúc ${lastSyncedAt}` : ''}</span>
            </span>
          )}

          {syncStatus === 'saving' && (
            <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 text-[11px] font-semibold">
              <RefreshCw className="w-3 h-3 text-blue-600 animate-spin shrink-0" />
              <span>Đang lưu...</span>
            </span>
          )}

          {syncStatus === 'conflict' && (
            <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-1 rounded-lg border border-red-200 text-[11px] font-bold">
              <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
              <span>Xung đột revision</span>
            </span>
          )}

          {syncStatus === 'offline' && (
            <span className="inline-flex items-center gap-1 text-orange-800 bg-orange-50 px-2 py-1 rounded-lg border border-orange-200 text-[11px] font-semibold">
              <WifiOff className="w-3 h-3 text-orange-600 shrink-0" />
              <span>Ngoại tuyến (lưu tạm)</span>
            </span>
          )}

          <button
            type="button"
            onClick={onSaveNow}
            disabled={syncStatus === 'saving'}
            className="inline-flex items-center gap-1 px-3 py-1 bg-[#004776] hover:bg-[#00385c] text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            title="Lưu ngay lập tức dữ liệu 15 biểu lên máy chủ"
          >
            <Save className="w-3 h-3" />
            <span>Lưu máy chủ</span>
          </button>

          <button
            type="button"
            onClick={onSwitchSession}
            className="px-2.5 py-1 text-[#004776] hover:bg-slate-100 border border-[#cbd5e1] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Đổi phiên
          </button>
        </div>
      </div>

      {/* Hiển thị lỗi API rõ ràng và nút thử lại (Không nuốt lỗi) */}
      {apiError && (
        <div className="bg-red-50 border border-red-200 px-4 py-1.5 flex items-center justify-between text-xs text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>
              <strong>Lỗi đồng bộ ({apiError.code}):</strong> {apiError.message}
            </span>
          </div>
          {apiError.retryable && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Thử lại</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
