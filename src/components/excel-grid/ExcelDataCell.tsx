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
  const [isFocused, setIsFocused] = useState(false);
  const [hasBlurred, setHasBlurred] = useState(false);

  const strVal = val !== undefined && val !== null ? String(val) : '';
  const isEmptyRequired = hasBlurred && col.required && !strVal.trim();

  // Hệ thống màu chuẩn HCM-UTE Design System V2:
  // - Mặc định: nền trắng, viền xám xanh nhạt
  // - Hover: nền xanh cực nhạt
  // - Focus: viền xanh HCM-UTE 2px và focus ring nhẹ
  // - Đã thay đổi: viền xanh ngọc nhẹ và chấm cam nhỏ
  // - Lỗi thực sự: chỉ hiện sau khi rời ô (hasBlurred) nếu thiếu dữ liệu bắt buộc
  const cellStyle = isEmptyRequired
    ? 'border-red-500 bg-red-50/40 text-red-900 focus:ring-2 focus:ring-red-400 focus:border-red-500'
    : isTouched
      ? 'border-amber-400 bg-amber-50/20 text-[#004776] focus:ring-2 focus:ring-[#004776] focus:border-[#004776]'
      : 'border-[#cbd5e1] bg-white hover:bg-sky-50/30 text-[#004776] focus:ring-2 focus:ring-[#004776]/25 focus:border-[#004776] transition-colors';

  const colStyle = {
    minWidth: col.width || '150px',
    width: col.width || '150px'
  };

  const isCompact = density === 'compact';

  // 1. Trạng thái Status (ĐẠT / CHƯA ĐẠT)
  if (col.type === 'status') {
    const isOk = val === 'ĐẠT' || val === 'Hoàn thành';
    return (
      <td style={colStyle} className="py-2 px-2 border-r border-[#cbd5e1] text-center align-top whitespace-normal">
        <span
          className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded-md break-words leading-tight shadow-2xs ${
            isOk ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
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
        className="py-2 px-2.5 border-r border-[#cbd5e1] bg-[#f8fafc] font-medium text-[#004776] align-top whitespace-normal break-words"
        title={col.formulaHint}
      >
        <div className="flex items-start justify-between gap-1">
          <span className="whitespace-normal break-words leading-relaxed text-[#004776]">
            {strVal !== '' ? strVal : '—'}
          </span>
          {col.formulaHint && (
            <FunctionSquare className="w-3.5 h-3.5 text-[#94a3b8] shrink-0 opacity-40 group-hover:opacity-100 mt-0.5" />
          )}
        </div>
      </td>
    );
  }

  // 3. Dropdown / Select cell
  if (col.type === 'select' || (dynamicOptions && dynamicOptions.length > 0)) {
    const selectOptions = dynamicOptions && dynamicOptions.length > 0 ? dynamicOptions : (col.selectOptions || []);
    return (
      <td style={colStyle} className="py-1 px-1 border-r border-[#cbd5e1] align-top relative">
        <select
          value={strVal}
          onFocus={() => { setIsFocused(true); onCellTouch?.(cellKey); }}
          onBlur={() => { setIsFocused(false); setHasBlurred(true); }}
          onChange={(e) => {
            onCellTouch?.(cellKey);
            onCellChange(rowId, col.field, e.target.value);
          }}
          className={`w-full ${isCompact ? 'min-h-[34px] py-1' : 'min-h-[40px] py-1.5'} px-2 rounded-lg border text-xs font-medium outline-hidden whitespace-normal break-words leading-normal ${cellStyle}`}
        >
          <option value="">-- Chọn --</option>
          {selectOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {isTouched && <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-amber-500 pointer-events-none" title="Đã chỉnh sửa" />}
      </td>
    );
  }

  // 4. Number input cell
  if (col.type === 'number') {
    return (
      <td style={colStyle} className="py-1 px-1 border-r border-[#cbd5e1] align-top relative">
        <input
          type="number"
          value={strVal}
          onFocus={() => { setIsFocused(true); onCellTouch?.(cellKey); }}
          onBlur={() => { setIsFocused(false); setHasBlurred(true); }}
          onChange={(e) => {
            onCellTouch?.(cellKey);
            onCellChange(rowId, col.field, Number(e.target.value));
          }}
          className={`w-full ${isCompact ? 'h-8' : 'h-10'} px-2 rounded-lg border text-xs font-semibold text-right outline-hidden tabular-nums ${cellStyle}`}
        />
        {isTouched && <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-amber-500 pointer-events-none" title="Đã chỉnh sửa" />}
      </td>
    );
  }

  // 5. Short code input (maNhiemVu, maCongViec, ky...)
  const isShortCode = col.field === 'maNhiemVu' || col.field === 'maCongViec' || col.field === 'ky';
  if (isShortCode) {
    return (
      <td style={colStyle} className="py-1 px-1 border-r border-[#cbd5e1] align-top relative">
        <input
          type="text"
          value={strVal}
          onFocus={() => { setIsFocused(true); onCellTouch?.(cellKey); }}
          onBlur={() => { setIsFocused(false); setHasBlurred(true); }}
          onChange={(e) => {
            onCellTouch?.(cellKey);
            onCellChange(rowId, col.field, e.target.value);
          }}
          className={`w-full ${isCompact ? 'h-8' : 'h-10'} px-2.5 rounded-lg border text-xs font-mono font-bold outline-hidden ${cellStyle}`}
        />
        {isTouched && <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-amber-500 pointer-events-none" title="Đã chỉnh sửa" />}
      </td>
    );
  }

  // 6. Descriptive text (textarea tự tăng chiều cao)
  const estimatedLines = isCompact
    ? Math.min(5, Math.max(1, Math.ceil(strVal.length / 42)))
    : Math.min(8, Math.max(2, Math.ceil(strVal.length / 38)));

  return (
    <td style={colStyle} className="py-1 px-1 border-r border-[#cbd5e1] align-top relative">
      <textarea
        rows={estimatedLines}
        value={strVal}
        onFocus={() => { setIsFocused(true); onCellTouch?.(cellKey); }}
        onBlur={() => { setIsFocused(false); setHasBlurred(true); }}
        onChange={(e) => {
          onCellTouch?.(cellKey);
          onCellChange(rowId, col.field, e.target.value);
        }}
        className={`w-full ${isCompact ? 'min-h-[38px] py-1' : 'min-h-[46px] py-1.5'} px-2.5 rounded-lg border text-xs font-medium outline-hidden leading-relaxed whitespace-pre-wrap break-words resize-y ${cellStyle}`}
        placeholder="Nhập nội dung..."
      />
      {isTouched && <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-amber-500 pointer-events-none" title="Đã chỉnh sửa" />}
      {isEmptyRequired && (
        <span className="text-[10px] text-red-600 block px-1 font-semibold flex items-center gap-0.5">
          <AlertCircle className="w-2.5 h-2.5 shrink-0" /> Bắt buộc nhập
        </span>
      )}
    </td>
  );
}
