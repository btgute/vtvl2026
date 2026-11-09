'use client';

import React from 'react';
import { ExcelSheetMeta, GenericGridRow } from './excel-grid-types';
import { ExcelDataCell } from './ExcelDataCell';
import { Plus, Trash2, Info, Save, ArrowRight, CheckCircle2, Copy } from 'lucide-react';

interface ExcelTableRendererProps {
  meta: ExcelSheetMeta;
  rows: GenericGridRow[];
  dynamicOptionsMap?: Record<string, string[]>;
  lastSaved?: string;
  lastSavedSheet?: string;
  isC1Unlocked?: boolean;
  touchedCells?: Set<string>;
  onCellTouch?: (cellKey: string) => void;
  onCellChange: (rowId: string, field: string, value: string | number) => void;
  onAddRow: () => void;
  onSplitRow?: (rowId: string) => void;
  onDeleteRow: (rowId: string) => void;
  onSaveSheet: () => void;
  onSaveAndNext: () => void;
  canNext?: boolean;
}

export function ExcelTableRenderer({
  meta, rows, dynamicOptionsMap, lastSaved, lastSavedSheet,
  isC1Unlocked = false, touchedCells, onCellTouch, onCellChange,
  onAddRow, onSplitRow, onDeleteRow, onSaveSheet, onSaveAndNext, canNext = true
}: ExcelTableRendererProps) {
  const isJustSaved = lastSavedSheet === meta.key && Boolean(lastSaved);
  const isC1Locked = meta.key === 'C1' && !isC1Unlocked;

  return (
    <div className="flex flex-col h-full bg-white border border-[#cbd5e1] rounded-lg shadow-xs overflow-hidden">
      {/* Sheet description banner */}
      <div className="px-4 py-2.5 bg-[#f8fafc] border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs font-bold bg-[#004776] text-white rounded">
            {meta.sheetName}
          </span>
          <span className="text-xs font-semibold text-[#004776]">{meta.title}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#64748b]">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" /> Cần điền/điều chỉnh
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" /> Đã thao tác
          </span>
        </div>
      </div>

      {/* Spreadsheet scroll area */}
      <div className="flex-1 overflow-auto max-h-[580px] select-text">
        <table className="w-full text-xs border-collapse">
          {/* Row 1: Excel column letters (A, B, C...) */}
          <thead>
            <tr className="bg-[#f1f5f9] text-[#64748b] border-b border-[#cbd5e1]">
              <th className="w-12 min-w-[48px] py-1 text-center font-bold border-r border-[#cbd5e1] select-none bg-[#e2e8f0]">#</th>
              {meta.columns.map((col) => (
                <th key={col.colLetter} style={{ width: col.width || '140px', minWidth: col.width || '140px' }} className="py-1 px-2 text-center font-bold border-r border-[#cbd5e1] select-none text-[#475569]">{col.colLetter}</th>
              ))}
              <th className="w-14 min-w-[56px] py-1 text-center border-r border-[#cbd5e1] select-none">...</th>
            </tr>

            {/* Row 2: Header title names */}
            <tr className="bg-[#f8fafc] text-[#004776] border-b-2 border-[#cbd5e1]">
              <th className="w-12 py-2 text-center font-bold border-r border-[#cbd5e1] select-none">
                Dòng
              </th>
              {meta.columns.map((col) => (
                <th
                  key={col.field}
                  style={{ width: col.width || '140px', minWidth: col.width || '140px' }}
                  className="py-2 px-2 text-left font-bold border-r border-[#cbd5e1] align-top whitespace-normal"
                  title={col.isFormula ? `Công thức tính: ${col.formulaHint}` : undefined}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="break-words leading-tight">{col.headerName}</span>
                    {col.isFormula && (
                      <span
                        className="inline-flex items-center text-[10px] text-blue-700 bg-blue-50 px-1 rounded border border-blue-200 mt-0.5 shrink-0"
                        title={col.formulaHint}
                      >
                        =fx
                      </span>
                    )}
                  </div>
                </th>
              ))}
              <th className="w-10 py-2 text-center font-bold border-r border-[#cbd5e1]">Xóa</th>
            </tr>
          </thead>

          {/* Table body */}
          <tbody className="divide-y divide-[#e2e8f0]">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={meta.columns.length + 2}
                  className="py-10 text-center text-[#64748b] bg-[#fafafa]"
                >
                  Chưa có dòng dữ liệu nào. Bấm <strong>"+ Thêm dòng"</strong> để bắt đầu nhập.
                </td>
              </tr>
            ) : (
              rows.map((row, rIdx) => {
                const rowNum = rIdx + 1;
                return (
                  <tr key={row.id} className="hover:bg-[#f8fafc] transition-colors group">
                    {/* Row header with row number */}
                    <td className="w-12 py-1.5 text-center font-bold text-[#64748b] bg-[#f1f5f9] border-r border-[#cbd5e1] select-none align-top">
                      {rowNum}
                    </td>

                    {/* Data cells without any truncation */}
                    {meta.columns.map((col) => {
                      const val = row[col.field];
                      const isComputed = col.isFormula || col.readOnly || isC1Locked;
                      const cellKey = `${row.id}_${col.field}`;
                      const isTouched = touchedCells?.has(cellKey) ?? false;
                      const dynamicOptions = col.dynamicOptionsKey && dynamicOptionsMap?.[col.dynamicOptionsKey];

                      return (
                        <ExcelDataCell
                          key={col.field}
                          col={col}
                          val={val}
                          rowId={row.id}
                          isComputed={isComputed}
                          isTouched={isTouched}
                          cellKey={cellKey}
                          dynamicOptions={dynamicOptions}
                          onCellTouch={onCellTouch}
                          onCellChange={onCellChange}
                        />
                      );
                    })}

                    {/* Action buttons (Tách & Xóa) */}
                    <td className="w-14 py-1 text-center border-r border-[#cbd5e1] align-top">
                      <div className="flex items-center justify-center gap-1">
                        {meta.key === 'A1' && (
                          <button
                            type="button"
                            onClick={() => onSplitRow?.(row.id)}
                            aria-label={`Tách nhiệm vụ dòng ${rowNum}`}
                            title="Tách nhiệm vụ (nhân bản sang mã mới để chia nhỏ các ý gạch đầu dòng)"
                            className="w-6 h-6 inline-flex items-center justify-center rounded text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {!isC1Locked && (
                          <button
                            type="button"
                            onClick={() => onDeleteRow(row.id)}
                            aria-label={`Xóa dòng ${rowNum}`}
                            title="Xóa dòng này"
                            className="w-6 h-6 inline-flex items-center justify-center rounded text-rose-500 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table bottom footer with Add Row & Save Buttons */}
      <div className="px-4 py-2 bg-[#f8fafc] border-t border-[#e2e8f0] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!isC1Locked && (
            <button
              type="button"
              onClick={onAddRow}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#004776] text-white rounded-md hover:bg-[#00385c] cursor-pointer shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{meta.key === 'A1' ? 'Thêm nhiệm vụ mới' : 'Thêm dòng mới'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onSaveSheet}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md cursor-pointer shadow-2xs transition-colors"
            title="Lưu lại toàn bộ dữ liệu biểu hiện tại"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu biểu {meta.sheetName}</span>
          </button>

          {canNext && (
            <button
              type="button"
              onClick={onSaveAndNext}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#004776] bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-md cursor-pointer shadow-2xs transition-colors"
              title="Lưu dữ liệu và sang sheet tiếp theo"
            >
              <span>Lưu &amp; Sang sheet tiếp theo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-[#64748b]">
          {isJustSaved && (
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đã lưu {lastSaved}</span>
            </span>
          )}
          <span>Tổng số: <strong>{rows.length}</strong> dòng</span>
        </div>
      </div>
    </div>
  );
}
