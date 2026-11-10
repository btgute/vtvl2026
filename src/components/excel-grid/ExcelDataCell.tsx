'use client';

import React, { useState } from 'react';
import { ExcelColumnDef } from './excel-grid-types';
import { FunctionSquare, AlertCircle } from 'lucide-react';

interface ExcelDataCellProps {
  col: ExcelColumnDef;
  val: string | number | boolean | undefined;
  rowId: string;
  isComputed: boolean;
  isTouched: boolean;
  cellKey: string;
  dynamicOptions?: string[];
  density?: 'compact' | 'comfortable';
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
  density = 'comfortable',
  onCellTouch,
  onCellChange
}: ExcelDataCellProps) {
  const [, setIsFocused] = useState(false);
  const [hasBlurred, setHasBlurred] = useState(false);

  const strVal = val !== undefined && val !== null ? String(val) : '';
  const isEmptyRequired = hasBlurred && Boolean(col.required) && !strVal.trim();
  const errorId = `${cellKey}-err`;

  const cellStyle = isEmptyRequired
    ? 'border-[var(--fix)] bg-[var(--fix-soft)] text-[var(--fix)] focus:ring-2 focus:ring-[var(--fix)]/25 focus:border-[var(--fix)]'
    : isTouched
      ? 'border-[#005fa3]/50 bg-[#f8fbff] text-[#004776] focus:ring-2 focus:ring-[#004776]/20 focus:border-[#004776]'
      : 'border-[#cbd5e1] bg-white hover:border-[#94a3b8] text-[#004776] focus:ring-2 focus:ring-[#004776]/20 focus:border-[#004776] transition-colors';

  const colStyle = {
    minWidth: col.width || '150px',
    width: col.width || '150px'
  };

  const isCompact = density === 'compact';

  // 1. Trạng thái Status (ĐẠT / CHƯA ĐẠT)
  if (col.type === 'status') {
    const isOk = val === 'ĐẠT' || val === 'Hoàn thành';
    return (
      <td style={colStyle} className="py-2 px-2 border-r border-[#f1f5f9] text-center align-top whitespace-normal">
        <span
          className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-md break-words leading-tight ${
            isOk ? 'bg-[var(--ok-soft)] text-[var(--ok)] border border-[var(--ok)]/30' : 'bg-[var(--fix-soft)] text-[var(--fix)] border border-[var(--fix)]/30'
          }`}
        >
          {strVal || 'CHƯA ĐẠT'}
        </span>
      </td>
    );
  }

  // 2. Ô tính toán / Công thức / Chỉ đọc (=fx)
  if (isComputed) {
    return (
      <td
        style={colStyle}
        className="py-2 px-2.5 border-r border-[#f1f5f9] bg-[#f8fafc] font-normal text-[#004776] align-top whitespace-normal break-words"
        title={col.formulaHint || strVal}
      >
        <div className="flex items-start justify-between gap-1">
          <span className={`whitespace-normal break-words leading-relaxed text-[#004776] ${col.type === 'number' ? 'tabular-nums text-right w-full' : ''}`}>
            {strVal !== '' ? strVal : '—'}
          </span>
          {col.formulaHint && (
            <FunctionSquare className="w-3.5 h-3.5 text-[#94a3b8] shrink-0 opacity-50 group-hover:opacity-100 mt-0.5" />
          )}
        </div>
      </td>
    );
  }

  // 3. Dropdown / Select cell
  if (col.type === 'select' || (dynamicOptions && dynamicOptions.length > 0)) {
    const selectOptions = dynamicOptions && dynamicOptions.length > 0 ? dynamicOptions : (col.selectOptions || []);
    return (
      <td style={colStyle} className="py-1 px-1 border-r border-[#f1f5f9] align-top relative">
        <select
          value={strVal}
          aria-label={col.headerName}
          aria-invalid={isEmptyRequired || undefined}
          aria-describedby={isEmptyRequired ? errorId : undefined}
          onFocus={() => { setIsFocused(true); onCellTouch?.(cellKey); }}
          onBlur={() => { setIsFocused(false); setHasBlurred(true); }}
          onChange={(e) => {
            onCellTouch?.(cellKey);
            onCellChange(rowId, col.field, e.target.value);
          }}
          className={`w-full ${isCompact ? 'h-8 py-0.5' : 'h-9 py-1'} px-2 rounded-md border text-[13px] font-normal outline-hidden ${cellStyle}`}
        >
          <option value="">-- Chọn --</option>
          {selectOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {isEmptyRequired && (
          <span id={errorId} className="text-[11px] text-[var(--fix)] mt-0.5 px-1 font-medium flex items-center gap-0.5">
            <AlertCircle className="w-3 h-3 shrink-0" /> Bắt buộc chọn
          </span>
        )}
      </td>
    );
  }

  // 4. Number input cell
  if (col.type === 'number') {
    return (
      <td style={colStyle} className="py-1 px-1 border-r border-[#f1f5f9] align-top relative">
        <input
          type="number"
          value={strVal}
          aria-label={col.headerName}
          aria-invalid={isEmptyRequired || undefined}
          aria-describedby={isEmptyRequired ? errorId : undefined}
          onFocus={() => { setIsFocused(true); onCellTouch?.(cellKey); }}
          onBlur={() => { setIsFocused(false); setHasBlurred(true); }}
          onChange={(e) => {
            onCellTouch?.(cellKey);
            onCellChange(rowId, col.field, Number(e.target.value));
          }}
          className={`w-full ${isCompact ? 'h-8' : 'h-9'} px-2.5 rounded-md border text-[13px] font-normal text-right outline-hidden tabular-nums ${cellStyle}`}
        />
        {isEmptyRequired && (
          <span id={errorId} className="text-[11px] text-[var(--fix)] mt-0.5 px-1 font-medium flex items-center gap-0.5">
            <AlertCircle className="w-3 h-3 shrink-0" /> Bắt buộc nhập
          </span>
        )}
      </td>
    );
  }

  // 5. Short code input (maNhiemVu, maCongViec, ky...)
  const isShortCode = col.field === 'maNhiemVu' || col.field === 'maCongViec' || col.field === 'ky';
  if (isShortCode) {
    return (
      <td style={colStyle} className="py-1 px-1 border-r border-[#f1f5f9] align-top relative">
        <input
          type="text"
          value={strVal}
          aria-label={col.headerName}
          aria-invalid={isEmptyRequired || undefined}
          aria-describedby={isEmptyRequired ? errorId : undefined}
          onFocus={() => { setIsFocused(true); onCellTouch?.(cellKey); }}
          onBlur={() => { setIsFocused(false); setHasBlurred(true); }}
          onChange={(e) => {
            onCellTouch?.(cellKey);
            onCellChange(rowId, col.field, e.target.value);
          }}
          className={`w-full ${isCompact ? 'h-8' : 'h-9'} px-2.5 rounded-md border text-[13px] font-mono font-medium outline-hidden ${cellStyle}`}
        />
        {isEmptyRequired && (
          <span id={errorId} className="text-[11px] text-[var(--fix)] mt-0.5 px-1 font-medium flex items-center gap-0.5">
            <AlertCircle className="w-3 h-3 shrink-0" /> Bắt buộc nhập
          </span>
        )}
      </td>
    );
  }

  // 6. Descriptive text (textarea tự tăng chiều cao)
  const estimatedLines = isCompact
    ? Math.min(4, Math.max(1, Math.ceil(strVal.length / 44)))
    : Math.min(6, Math.max(2, Math.ceil(strVal.length / 40)));

  return (
    <td style={colStyle} className="py-1 px-1 border-r border-[#f1f5f9] align-top relative">
      <textarea
        rows={estimatedLines}
        value={strVal}
        aria-label={col.headerName}
        aria-invalid={isEmptyRequired || undefined}
        aria-describedby={isEmptyRequired ? errorId : undefined}
        onFocus={() => { setIsFocused(true); onCellTouch?.(cellKey); }}
        onBlur={() => { setIsFocused(false); setHasBlurred(true); }}
        onChange={(e) => {
          onCellTouch?.(cellKey);
          onCellChange(rowId, col.field, e.target.value);
        }}
        className={`w-full ${isCompact ? 'min-h-[34px] py-1' : 'min-h-[40px] py-1.5'} px-2.5 rounded-md border text-[13.5px] font-normal outline-hidden leading-snug whitespace-pre-wrap break-words resize-y ${cellStyle}`}
        placeholder="Nhập nội dung..."
      />
      {isEmptyRequired && (
        <span id={errorId} className="text-[11px] text-[var(--fix)] mt-0.5 px-1 font-medium flex items-center gap-0.5">
          <AlertCircle className="w-3 h-3 shrink-0" /> Bắt buộc nhập
        </span>
      )}
    </td>
  );
}
