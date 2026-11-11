'use client';

import React from 'react';
import { Eye, Download, LogIn, Trash2, Calendar, User } from 'lucide-react';
import { AdminDisplaySession } from './AdminSessionsTab';

interface AdminSessionTableRowProps {
  session: AdminDisplaySession;
  index: number;
  isRecentlyUpdated: boolean;
  viewingId: string | null;
  exportingEmail: string | null;
  onView: (session: AdminDisplaySession) => void;
  onExport: (session: AdminDisplaySession) => void;
  onOpen: (session: AdminDisplaySession) => void;
  onDelete: (session: AdminDisplaySession) => void;
}

export function AdminSessionTableRow({
  session: s,
  index: idx,
  isRecentlyUpdated,
  viewingId,
  exportingEmail,
  onView,
  onExport,
  onOpen,
  onDelete
}: AdminSessionTableRowProps) {
  const rowKey = s.id || s.email;
  const isViewingThis = viewingId === rowKey;
  const isExportingThis = exportingEmail === s.email;

  return (
    <tr
      className={`h-[48px] sm:h-[52px] border-b border-[#cbd5e1]/70 transition-colors ${
        isRecentlyUpdated
          ? 'bg-blue-50/70 border-l-4 border-l-[#004776]'
          : 'hover:bg-blue-50/30'
      }`}
    >
      <td className="p-2.5 text-center text-[#64748b] font-medium border-r border-[#cbd5e1] bg-[#f8fafc]/50">
        {idx + 1}
      </td>

      <td className="p-2.5 font-bold text-[#004776] border-r border-[#cbd5e1]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#004776]/10 flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5 text-[#004776]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="truncate max-w-[200px]">{s.email}</span>
              {isRecentlyUpdated && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Vừa cập nhật</span>
                </span>
              )}
            </div>
            <div className="text-[10px] font-normal text-[#64748b] truncate">
              {s.title || 'Người thực hiện'}
            </div>
          </div>
        </div>
      </td>

      <td className="p-2.5 text-[#004776] border-r border-[#cbd5e1]">
        <div className="flex items-center gap-1.5">
          <span className="font-bold px-1.5 py-0.5 rounded bg-[#004776]/10 text-[#004776] text-[11px]">
            {s.unitCode}
          </span>
          <span className="truncate max-w-[170px]" title={s.unitNameVi}>
            {s.unitNameVi}
          </span>
        </div>
      </td>

      <td className="p-2.5 text-[#64748b] border-r border-[#cbd5e1]">
        <div className="text-[11px] font-medium">{s.reportingPeriod || '2025–2026'}</div>
        <div className="text-[10px] text-[#004776] font-bold">
          Revision v{s.currentRevision || 1}
        </div>
      </td>

      <td className="p-2.5 border-r border-[#cbd5e1]">
        <div className="text-[11px] text-[#004776] font-bold">{s.totalRows || 0} dòng</div>
        <div className="text-[10px] text-[#64748b]">{s.populatedSheetsCount || 0}/15 sheet</div>
      </td>

      <td className="p-2.5 text-[#64748b] border-r border-[#cbd5e1] whitespace-nowrap">
        <span className="flex items-center gap-1 text-[11px]">
          <Calendar className="w-3 h-3 text-[#004776]" />
          <span>{s.lastSavedAt || '—'}</span>
        </span>
      </td>

      <td className="p-2.5 text-center sticky right-0 bg-white/95 backdrop-blur-xs border-l border-[#cbd5e1]/60">
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => onView(s)}
            disabled={isViewingThis}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#004776] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="Xem dữ liệu 15 biểu"
          >
            <Eye className={`w-3.5 h-3.5 ${isViewingThis ? 'animate-spin' : ''}`} />
            <span>{isViewingThis ? '...' : 'Xem'}</span>
          </button>
          <button
            type="button"
            onClick={() => onExport(s)}
            disabled={isExportingThis}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="Xuất file Excel từ dữ liệu đã điền"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingThis ? '...' : 'Xuất'}</span>
          </button>
          <button
            type="button"
            onClick={() => onOpen(s)}
            className="p-1.5 text-[#004776] hover:bg-[#e2e8f0] rounded-lg transition-colors cursor-pointer border border-[#cbd5e1]"
            title="Mở hồ sơ trên giao diện Bảng tính"
          >
            <LogIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(s)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-red-200"
            title="Xóa hồ sơ máy chủ"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
