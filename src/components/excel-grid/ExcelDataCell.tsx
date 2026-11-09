'use client';

import React from 'react';
import { ExcelColumnDef } from './excel-grid-types';
import { FunctionSquare } from 'lucide-react';

interface ExcelDataCellProps {
  col: ExcelColumnDef;
  val: string | number | boolean | undefined;
  rowId: string;
  isComputed: boolean;
  isTouched: boolean;
  cellKey: string;
  dynamicOptions?: string[];
  onCellTouch?: (key: string) => void;
  onCellChange: (rowId: string, field: string, val: string | number) => void;
}

export function ExcelDataCell({
  col,
  val,
  rowId,
  isComputed,
  isTouched,
  cellKey,
  dynamicOptions,
  onCellTouch,
  onCellChange
}: ExcelDataCellProps) {
  const cellStyle = isTouched
    ? 'border-emerald-500 bg-emerald-50/80 text-[#004776] focus:ring-emerald-500 focus:border-emerald-600'
    : 'border-red-400 bg-red-50/70 text-[#004776] focus:ring-red-500 focus:border-red-600';

  const colStyle = {
    minWidth: col.width || '150px',
    width: col.width || '150px'
  };

  // 1. Status type cell
  if (col.type === 'status') {
    const isOk = val === 'ĐẠT' || val === 'Hoàn thành';
    return (
      <td
        style={colStyle}
        className="py-1.5 px-2 border-r border-[#cbd5e1] text-center align-top whitespace-normal"
      >
        <span
          className={`inline-block px-2 py-1 text-[11px] font-bold rounded break-words leading-tight ${
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

  // 2. Computed / Read-only / Formula cell — Always display full text without truncation
  if (isComputed) {
    return (
      <td
        style={colStyle}
        className="py-2 px-2.5 border-r border-[#cbd5e1] bg-[#f8fafc] font-medium text-[#004776] align-top whitespace-normal break-words"
        title={col.formulaHint}
      >
        <div className="flex items-start justify-between gap-1">
          <span className="whitespace-normal break-words leading-relaxed text-[#004776]">
            {val !== undefined ? String(val) : '—'}
          </span>
          {col.formulaHint && (
            <FunctionSquare
              className="w-3.5 h-3.5 text-[#94a3b8] shrink-0 opacity-40 group-hover:opacity-100 mt-0.5"
              aria-hidden="true"
            />
          )}
        </div>
      </td>
    );
  }

  // 3. Dropdown / Select cell
  if (col.type === 'select' || (dynamicOptions && dynamicOptions.length > 0)) {
    const selectOptions = dynamicOptions && dynamicOptions.length > 0
      ? dynamicOptions
      : (col.selectOptions || []);

    return (
      <td style={colStyle} className="py-1 px-1 border-r border-[#cbd5e1] align-top">
        <select
          value={String(val ?? '')}
          onFocus={() => onCellTouch?.(cellKey)}
          onChange={(e) => {
            onCellTouch?.(cellKey);
            onCellChange(rowId, col.field, e.target.value);
          }}
          className={`w-full min-h-[36px] px-2 py-1.5 rounded border text-xs font-medium focus:ring-1 whitespace-normal break-words leading-normal ${cellStyle}`}
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

  // 4. Number input cell
  if (col.type === 'number') {
    return (
      <td style={colStyle} className="py-1 px-1 border-r border-[#cbd5e1] align-top">
        <input
          type="number"
          value={val !== undefined ? String(val) : ''}
          onFocus={() => onCellTouch?.(cellKey)}
          onChange={(e) => {
            onCellTouch?.(cellKey);
            onCellChange(rowId, col.field, Number(e.target.value));
          }}
          className={`w-full h-9 px-2 rounded border text-xs font-medium text-right focus:ring-1 ${cellStyle}`}
        />
      </td>
    );
  }

  // 5. Short code inputs (maNhiemVu, maCongViec, ky...)
  const strVal = val !== undefined ? String(val) : '';
  const isShortCode = col.field === 'maNhiemVu' || col.field === 'maCongViec' || col.field === 'ky';

  if (isShortCode) {
    return (
      <td style={colStyle} className="py-1 px-1 border-r border-[#cbd5e1] align-top">
        <input
          type="text"
          value={strVal}
          onFocus={() => onCellTouch?.(cellKey)}
          onChange={(e) => {
            onCellTouch?.(cellKey);
            onCellChange(rowId, col.field, e.target.value);
          }}
          className={`w-full h-9 px-2.5 rounded border text-xs font-semibold focus:ring-1 ${cellStyle}`}
        />
      </td>
    );
  }

  // 6. Descriptive text cell (Tên nhiệm vụ, công việc, căn cứ, nguồn...)
  // Auto-calculated rows to ensure full visibility without cutting
  const estimatedLines = Math.min(8, Math.max(2, Math.ceil(strVal.length / 38)));

  return (
    <td style={colStyle} className="py-1 px-1 border-r border-[#cbd5e1] align-top">
      <textarea
        rows={estimatedLines}
        value={strVal}
        onFocus={() => onCellTouch?.(cellKey)}
        onChange={(e) => {
          onCellTouch?.(cellKey);
          onCellChange(rowId, col.field, e.target.value);
        }}
        className={`w-full min-h-[46px] px-2.5 py-1.5 rounded border text-xs font-medium focus:ring-1 leading-relaxed whitespace-pre-wrap break-words resize-y transition-colors ${cellStyle}`}
        placeholder="Nhập nội dung đầy đủ..."
      />
    </td>
  );
}

