'use client';

import React, { useState, useMemo } from 'react';
import { ExcelSheetMeta, GenericGridRow } from './excel-grid-types';
import { ExcelDataCell } from './ExcelDataCell';
import { ExcelRowCardEditor } from './ExcelRowCardEditor';
import { Plus, Trash2, Save, ArrowRight, CheckCircle2, Copy, Search, X } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const isJustSaved = lastSavedSheet === meta.key && Boolean(lastSaved);
  const isC1Locked = meta.key === 'C1' && !isC1Unlocked;

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter((r) =>
      Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(term))
    );
  }, [rows, searchTerm]);

  return (
    <div className="flex flex-col h-full bg-white border border-[#cbd5e1] rounded-xl shadow-2xs overflow-hidden w-full max-w-full min-w-0">
      {/* Sheet description banner */}
      <div className="px-3.5 py-2.5 bg-[#f8fafc] border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs font-bold bg-[#004776] text-white rounded">
            {meta.sheetName}
          </span>
          <span className="text-xs font-semibold text-[#004776]">{meta.title}</span>
        </div>

        {/* Quick search input on Desktop & Tablet */}
        <div className="hidden md:flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#64748b]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Lọc nhanh dòng..."
              className="pl-8 pr-7 py-1 text-xs rounded-lg border border-[#cbd5e1] bg-white text-[#004776] w-48 focus:ring-1 focus:ring-[#004776] outline-hidden"
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm('')} className="absolute right-2 top-1.5 text-[#94a3b8] hover:text-[#004776]">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <span className="text-[11px] text-[#64748b]">
            <strong>{filteredRows.length}</strong>/{rows.length} dòng
          </span>
        </div>
      </div>

      {/* MOBILE PRESENTATION: Row Card Editor (< 768px) */}
      <div className="block md:hidden p-3 bg-[#f8fafc]/50">
        <ExcelRowCardEditor
          meta={meta}
          rows={rows}
          dynamicOptionsMap={dynamicOptionsMap}
          isC1Locked={isC1Locked}
          touchedCells={touchedCells}
          onCellTouch={onCellTouch}
          onCellChange={onCellChange}
          onAddRow={onAddRow}
          onSplitRow={onSplitRow}
          onDeleteRow={onDeleteRow}
        />
      </div>

      {/* TABLET & DESKTOP PRESENTATION: Full Spreadsheet Grid (>= 768px) */}
      <div className="hidden md:block flex-1 overflow-x-auto overflow-y-auto max-h-[580px] select-text w-full max-w-full">
        <table className="w-full text-xs border-collapse">
          {/* Sticky header */}
          <thead className="sticky top-0 z-10 shadow-xs">
            {/* Row 1: Excel column letters (A, B, C...) */}
            <tr className="bg-[#f1f5f9] text-[#64748b] border-b border-[#cbd5e1]">
              <th className="w-12 min-w-[48px] py-1 text-center font-bold border-r border-[#cbd5e1] select-none bg-[#e2e8f0]">#</th>
              {meta.columns.map((col) => (
                <th key={col.colLetter} style={{ width: col.width || '140px', minWidth: col.width || '140px' }} className="py-1 px-2 text-center font-bold border-r border-[#cbd5e1] select-none text-[#475569]">{col.colLetter}</th>
              ))}
              <th className="w-14 min-w-[56px] py-1 text-center border-r border-[#cbd5e1] select-none">...</th>
            </tr>

            {/* Row 2: Header title names */}
            <tr className="bg-[#f8fafc] text-[#004776] border-b-2 border-[#cbd5e1]">
              <th className="w-12 py-2 text-center font-bold border-r border-[#cbd5e1] select-none">Dòng</th>
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
                      <span className="inline-flex items-center text-[10px] text-blue-700 bg-blue-50 px-1 rounded border border-blue-200 mt-0.5 shrink-0" title={col.formulaHint}>
                        =fx
                      </span>
                    )}
                  </div>
                </th>
              ))}
              <th className="w-14 py-2 text-center font-bold border-r border-[#cbd5e1]">Xóa</th>
            </tr>
          </thead>

          {/* Table body */}
          <tbody className="divide-y divide-[#e2e8f0]">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={meta.columns.length + 2} className="py-10 text-center text-[#64748b] bg-[#fafafa]">
                  {searchTerm ? 'Không tìm thấy dòng khớp từ khóa tìm kiếm.' : 'Chưa có dòng dữ liệu nào. Bấm "+ Thêm dòng mới" để bắt đầu.'}
                </td>
              </tr>
            ) : (
              filteredRows.map((row, rIdx) => {
                const rowNum = rIdx + 1;
                return (
                  <tr key={row.id} className="odd:bg-white even:bg-[#fafcff] hover:bg-sky-50/50 transition-colors group">
                    <td className="w-12 py-1.5 text-center font-bold text-[#64748b] bg-[#f1f5f9] border-r border-[#cbd5e1] select-none align-top">
                      {rowNum}
                    </td>

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

                    <td className="w-14 py-1 text-center border-r border-[#cbd5e1] align-top">
                      <div className="flex items-center justify-center gap-1">
                        {meta.key === 'A1' && (
                          <button
                            type="button"
                            onClick={() => onSplitRow?.(row.id)}
                            aria-label={`Tách nhiệm vụ dòng ${rowNum}`}
                            title="Tách nhiệm vụ"
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
      <div className="px-3.5 py-2.5 bg-[#f8fafc] border-t border-[#e2e8f0] flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {!isC1Locked && (
            <button
              type="button"
              onClick={onAddRow}
              className="inline-flex items-center gap-1 min-h-[38px] px-3.5 text-xs font-bold bg-[#004776] text-white rounded-xl hover:bg-[#00385c] active:scale-95 cursor-pointer shadow-2xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{meta.key === 'A1' ? 'Thêm nhiệm vụ' : 'Thêm dòng mới'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onSaveSheet}
            className="inline-flex items-center gap-1 min-h-[38px] px-4 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 rounded-xl cursor-pointer shadow-2xs transition-all"
            title="Lưu lại toàn bộ dữ liệu biểu hiện tại"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu biểu {meta.sheetName}</span>
          </button>

          {canNext && (
            <button
              type="button"
              onClick={onSaveAndNext}
              className="inline-flex items-center gap-1 min-h-[38px] px-3.5 text-xs font-bold text-[#004776] bg-blue-50 hover:bg-[#004776] hover:text-white border border-[#004776]/30 rounded-xl cursor-pointer shadow-2xs transition-all"
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
          <span>Tổng: <strong>{rows.length}</strong> dòng</span>
        </div>
      </div>
    </div>
  );
}
