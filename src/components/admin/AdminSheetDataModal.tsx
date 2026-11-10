'use client';

import React, { useState } from 'react';
import { X, FileSpreadsheet, Download, Table2, Layers, Calendar, User, Building } from 'lucide-react';
import { EmailSessionRecord } from '@/services/telemetry/operator-session';
import { EXCEL_NATURAL_SHEET_ORDER, ExcelSheetKey } from '@/components/excel-grid/excel-grid-types';
import { EXCEL_SHEET_METAS } from '@/components/excel-grid/excel-sheet-metas';
import { generateUnitFiles } from '@/services/excel-split/workbook-builder';
import { findHcmuteUnit } from '@/configs/hcmute-units';
import { UnitGroupKind } from '@/types/vtvl';

interface AdminSheetDataModalProps {
  session: EmailSessionRecord | null;
  onClose: () => void;
}

export function AdminSheetDataModal({ session, onClose }: AdminSheetDataModalProps) {
  const [selectedSheet, setSelectedSheet] = useState<ExcelSheetKey>('A1');
  const [isExporting, setIsExporting] = useState(false);

  if (!session) return null;

  const currentSheetMeta = EXCEL_SHEET_METAS[selectedSheet];
  const sheetRows = session.data?.[selectedSheet] || [];
  const columns = currentSheetMeta?.columns || [];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const unitInfo = findHcmuteUnit(session.unitCode);
      await generateUnitFiles({
        kind: unitInfo.group as UnitGroupKind,
        unitCode: session.unitCode,
        unitNameVi: session.unitNameVi,
        unitNameEn: unitInfo.nameEn || '',
        period: '01/10/2025–30/9/2026',
        exportDate: new Date().toISOString().slice(0, 10),
        includeZipPerPosition: false,
        ngachOverrides: {}
      });
    } catch {
      alert('Không thể tạo file Excel cho phiên này, vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none"
    >
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-[#cbd5e1] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-linear-to-r from-[#004776] to-[#00385c] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <Table2 className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Chi tiết bảng biểu phiên làm việc
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white/20 text-white">
                  {session.unitCode}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/80 mt-0.5">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {session.email} ({session.title})
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" />
                  {session.unitNameVi}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Lưu lúc: {session.lastSavedAt}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Đang xuất...' : 'Xuất Excel'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Thanh chọn sheet biểu (15 sheet) */}
        <div className="bg-[#f8fafc] border-b border-[#cbd5e1] px-4 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
          {EXCEL_NATURAL_SHEET_ORDER.map((key) => {
            const meta = EXCEL_SHEET_METAS[key];
            const isActive = selectedSheet === key;
            const count = session.data?.[key]?.length || 0;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedSheet(key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                  isActive
                    ? 'bg-[#004776] text-white border-[#004776] font-bold shadow-2xs'
                    : 'bg-white text-[#004776] border-[#cbd5e1] hover:bg-[#e2e8f0]'
                }`}
              >
                <span>{meta.shortLabel}</span>
                <span
                  className={`text-[10px] px-1 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#64748b]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Thông tin sheet hiện tại */}
        <div className="px-5 py-2.5 bg-slate-50/70 border-b border-[#cbd5e1] flex items-center justify-between text-xs text-[#004776]">
          <div className="font-semibold flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#004776]/10 font-bold rounded">
              Biểu {currentSheetMeta.shortLabel}
            </span>
            <span>{currentSheetMeta.title}</span>
          </div>
          <div className="text-[#64748b]">
            Tổng số dòng: <strong>{sheetRows.length}</strong> · Số cột: <strong>{columns.length}</strong>
          </div>
        </div>

        {/* Vùng xem dữ liệu bảng tính */}
        <div className="flex-1 overflow-auto p-4 bg-slate-100/50">
          {sheetRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-[#64748b]">
              <FileSpreadsheet className="w-12 h-12 text-[#cbd5e1] mb-2" />
              <p className="font-semibold text-sm text-[#004776]">
                Chưa có dữ liệu nhập riêng cho biểu {currentSheetMeta.shortLabel}
              </p>
              <p className="text-xs text-[#64748b] mt-1">
                Biểu này đang sử dụng thiết lập định biên ngầm định của Ban Tổ chức Trung ương.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#cbd5e1] shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#cbd5e1]">
                      <th className="p-2.5 font-bold text-[#004776] border-r border-[#cbd5e1] w-12 text-center">
                        STT
                      </th>
                      {columns.map((col) => (
                        <th
                          key={col.field}
                          className="p-2.5 font-bold text-[#004776] border-r border-[#cbd5e1] whitespace-nowrap"
                        >
                          {col.headerName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sheetRows.map((row, idx) => (
                      <tr
                        key={row.id || idx}
                        className="border-b border-[#cbd5e1]/70 hover:bg-blue-50/40 transition-colors"
                      >
                        <td className="p-2 text-center text-[#64748b] font-medium border-r border-[#cbd5e1] bg-[#f8fafc]/50">
                          {idx + 1}
                        </td>
                        {columns.map((col) => (
                          <td
                            key={col.field}
                            className="p-2 text-[#004776] border-r border-[#cbd5e1]/70 max-w-xs truncate"
                            title={String(row[col.field] ?? '')}
                          >
                            {String(row[col.field] ?? '') || '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#f8fafc] border-t border-[#cbd5e1] flex items-center justify-between">
          <span className="text-xs text-[#64748b]">
            Dữ liệu được lưu trữ tự động trong nhật ký phiên của hệ thống VTVL 360
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-[#004776] bg-white border border-[#cbd5e1] hover:bg-[#e2e8f0] rounded-lg transition-colors cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
}
