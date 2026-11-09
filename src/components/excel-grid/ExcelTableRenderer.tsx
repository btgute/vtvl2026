'use client';

import React from 'react';
import { ExcelSheetMeta, GenericGridRow } from './excel-grid-types';
import { Plus, Trash2, Info, FunctionSquare, Save, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ExcelTableRendererProps {
  meta: ExcelSheetMeta;
  rows: GenericGridRow[];
  dynamicOptionsMap?: Record<string, string[]>;
  lastSaved?: string;
  lastSavedSheet?: string;
  isC1Unlocked?: boolean;
  onCellChange: (rowId: string, field: string, value: string | number) => void;
  onAddRow: () => void;
  onDeleteRow: (rowId: string) => void;
  onSaveSheet: () => void;
  onSaveAndNext: () => void;
  canNext?: boolean;
}

export function ExcelTableRenderer({
  meta,
  rows,
  dynamicOptionsMap,
  lastSaved,
  lastSavedSheet,
  isC1Unlocked = false,
  onCellChange,
  onAddRow,
  onDeleteRow,
  onSaveSheet,
  onSaveAndNext,
  canNext = true
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
          <Info className="w-3.5 h-3.5 text-[#004776]" />
          <span>{meta.guideDesc}</span>
        </div>
      </div>

      {/* Spreadsheet scroll area */}
      <div className="flex-1 overflow-auto max-h-[580px] select-text">
        <table className="w-full text-xs border-collapse">
          {/* Row 1: Excel column letters (A, B, C...) */}
          <thead>
            <tr className="bg-[#f1f5f9] text-[#64748b] border-b border-[#cbd5e1]">
              <th className="w-12 min-w-[48px] py-1 text-center font-bold border-r border-[#cbd5e1] select-none bg-[#e2e8f0]">
                #
              </th>
              {meta.columns.map((col) => (
                <th
                  key={col.colLetter}
                  style={{ width: col.width || '140px', minWidth: col.width || '140px' }}
                  className="py-1 px-2 text-center font-bold border-r border-[#cbd5e1] select-none text-[#475569]"
                >
                  {col.colLetter}
                </th>
              ))}
              <th className="w-10 min-w-[40px] py-1 text-center border-r border-[#cbd5e1] select-none">
                ...
              </th>
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
                  className="py-2 px-2 text-left font-bold border-r border-[#cbd5e1] align-top"
                  title={col.isFormula ? `Công thức tính: ${col.formulaHint}` : undefined}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate">{col.headerName}</span>
                    {col.isFormula && (
                      <span
                        className="inline-flex items-center text-[10px] text-blue-700 bg-blue-50 px-1 rounded border border-blue-200"
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
                    <td className="w-12 py-1.5 text-center font-bold text-[#64748b] bg-[#f1f5f9] border-r border-[#cbd5e1] select-none">
                      {rowNum}
                    </td>

                    {/* Data cells */}
                    {meta.columns.map((col) => {
                      const val = row[col.field];
                      const isComputed = col.isFormula || col.readOnly || isC1Locked;

                      if (col.type === 'status') {
                        const isOk = val === 'ĐẠT' || val === 'Hoàn thành';
                        return (
                          <td key={col.field} className="py-1 px-2 border-r border-[#cbd5e1] text-center">
                            <span
                              className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded ${
                                isOk
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}
                            >
                              {String(val ?? 'CHƯA ĐẠT')}
                            </span>
                          </td>
                        );
                      }

                      if (isComputed) {
                        return (
                          <td
                            key={col.field}
                            className="py-1 px-2 border-r border-[#cbd5e1] bg-[#f8fafc] font-medium text-[#004776]"
                            title={col.formulaHint}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate">{val !== undefined ? String(val) : '—'}</span>
                              {col.formulaHint && (
                                <FunctionSquare
                                  className="w-3 h-3 text-[#94a3b8] shrink-0 opacity-40 group-hover:opacity-100"
                                  aria-hidden="true"
                                />
                              )}
                            </div>
                          </td>
                        );
                      }

                      const dynamicOptions = col.dynamicOptionsKey && dynamicOptionsMap?.[col.dynamicOptionsKey];
                      const selectOptions = dynamicOptions && dynamicOptions.length > 0
                        ? dynamicOptions
                        : (col.selectOptions || []);

                      if (col.type === 'select' || (dynamicOptions && dynamicOptions.length > 0)) {
                        return (
                          <td key={col.field} className="py-0.5 px-1 border-r border-[#cbd5e1]">
                            <select
                              value={String(val ?? '')}
                              onChange={(e) => onCellChange(row.id, col.field, e.target.value)}
                              className="w-full h-7 px-1.5 rounded border border-[#cbd5e1] bg-white text-[#004776] text-xs focus:ring-1 focus:ring-[#004776] focus:border-[#004776]"
                            >
                              <option value="">-- Chọn --</option>
                              {selectOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </td>
                        );
                      }

                      return (
                        <td key={col.field} className="py-0.5 px-1 border-r border-[#cbd5e1]">
                          <input
                            type={col.type === 'number' ? 'number' : 'text'}
                            value={val !== undefined ? String(val) : ''}
                            onChange={(e) =>
                              onCellChange(
                                row.id,
                                col.field,
                                col.type === 'number' ? Number(e.target.value) : e.target.value
                              )
                            }
                            className="w-full h-7 px-1.5 rounded border border-transparent hover:border-[#cbd5e1] focus:border-[#004776] bg-transparent focus:bg-white text-[#004776] text-xs focus:ring-1 focus:ring-[#004776]"
                          />
                        </td>
                      );
                    })}

                    {/* Delete row button */}
                    <td className="w-10 py-1 text-center border-r border-[#cbd5e1]">
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
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table bottom footer with Add Row & Save Buttons */}
      <div className="px-4 py-2.5 bg-[#f8fafc] border-t border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {!isC1Locked && (
            <button
              type="button"
              onClick={onAddRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#004776] text-white rounded-md hover:bg-[#00385c] cursor-pointer shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm dòng mới</span>
            </button>
          )}

          {/* User requested Save Button before moving sheets */}
          <button
            type="button"
            onClick={onSaveSheet}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md cursor-pointer shadow-2xs transition-colors"
            title="Lưu lại toàn bộ dữ liệu biểu hiện tại vào bộ nhớ"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu biểu {meta.sheetName}</span>
          </button>

          {canNext && (
            <button
              type="button"
              onClick={onSaveAndNext}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#004776] bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-md cursor-pointer shadow-2xs transition-colors"
              title="Lưu dữ liệu và tự động liên thông sang sheet tiếp theo"
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
              <span>Đã lưu lúc {lastSaved}</span>
            </span>
          )}
          <span>Tổng số: <strong>{rows.length}</strong> dòng</span>
        </div>
      </div>
    </div>
  );
}
