'use client';

import React from 'react';
import {
  CheckCircle2, RefreshCw, AlertTriangle, WifiOff,
  Save, User, Building2, Layers
} from 'lucide-react';
import { OperatorSession } from '@/services/telemetry/operator-session';
import { SyncStatusKind } from './useOperatorSession';

interface SyncStatusBarProps {
  session: OperatorSession | null;
  unitNameVi: string;
  revision: number;
  syncStatus: SyncStatusKind;
  lastSyncedAt: string | null;
  onSaveNow: () => void;
  onSwitchSession: () => void;
}

export function SyncStatusBar({
  session,
  unitNameVi,
  revision,
  syncStatus,
  lastSyncedAt,
  onSaveNow,
  onSwitchSession
}: SyncStatusBarProps) {
  if (!session) return null;

  return (
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
          <span className="truncate max-w-[240px]" title={unitNameVi}>
            {unitNameVi}
          </span>
        </div>

        <span className="hidden md:inline text-[#cbd5e1]">|</span>

        <div className="hidden md:flex items-center gap-1 text-[#64748b]">
          <Layers className="w-3.5 h-3.5 text-[#64748b]" />
          <span>Phiên bản: <strong>v{revision}</strong></span>
        </div>
      </div>

      {/* Trạng thái đồng bộ & nút Lưu ngay */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          {syncStatus === 'synced' && (
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Đã lưu máy chủ {lastSyncedAt ? `(${lastSyncedAt})` : ''}</span>
            </span>
          )}

          {syncStatus === 'saving' && (
            <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 font-bold text-[11px]">
              <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" />
              <span>Đang đồng bộ máy chủ...</span>
            </span>
          )}

          {syncStatus === 'unsaved' && (
            <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-bold text-[11px]">
              <Save className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Bản nháp cục bộ</span>
            </span>
          )}

          {syncStatus === 'offline' && (
            <span className="inline-flex items-center gap-1 text-orange-800 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200 font-bold text-[11px]">
              <WifiOff className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span>Chế độ ngoại tuyến (lưu tạm)</span>
            </span>
          )}

          {syncStatus === 'conflict' && (
            <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200 font-bold text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span>Xung đột phiên bản máy chủ</span>
            </span>
          )}
        </div>

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
  );
}

