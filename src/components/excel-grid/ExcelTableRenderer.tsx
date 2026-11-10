'use client';

import React, { useState, useMemo } from 'react';
import { ExcelSheetMeta, GenericGridRow } from './excel-grid-types';
import { ExcelDataCell } from './ExcelDataCell';
import { ExcelRowCardEditor } from './ExcelRowCardEditor';
import { Plus, Trash2, Save, ArrowRight, CheckCircle2, Copy, Search, X, Undo2, AlertTriangle } from 'lucide-react';

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
  const [density, setDensity] = useState<'compact' | 'comfortable'>('comfortable');
  const [filterMode, setFilterMode] = useState<'all' | 'touched' | 'incomplete'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletedRowBackup, setDeletedRowBackup] = useState<{ row: GenericGridRow; index: number } | null>(null);

  const isJustSaved = lastSavedSheet === meta.key && Boolean(lastSaved);
  const isC1Locked = meta.key === 'C1' && !isC1Unlocked;

  const filteredRows = useMemo(() => {
    let res = rows;
    if (filterMode === 'touched') {
      res = res.filter((r) => meta.columns.some((c) => touchedCells?.has(`${r.id}_${c.field}`)));
    } else if (filterMode === 'incomplete') {
      res = res.filter((r) => meta.columns.some((c) => c.required && !String(r[c.field] ?? '').trim()));
    }
    if (!searchTerm.trim()) return res;
    const term = searchTerm.toLowerCase();
    return res.filter((r) => Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(term)));
  }, [rows, searchTerm, filterMode, meta.columns, touchedCells]);

  const handleConfirmDelete = () => {
    if (!confirmDeleteId) return;
    const idx = rows.findIndex((r) => r.id === confirmDeleteId);
    if (idx >= 0) setDeletedRowBackup({ row: rows[idx], index: idx });
    onDeleteRow(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-[#cbd5e1] rounded-2xl shadow-2xs overflow-hidden w-full max-w-full min-w-0">
      {deletedRowBackup && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 flex items-center justify-between text-xs text-amber-900">
          <span>Đã xóa dòng #{deletedRowBackup.index + 1}.</span>
          <button type="button" onClick={() => { onAddRow(); setDeletedRowBackup(null); }} className="inline-flex items-center gap-1 font-bold text-[#004776] hover:underline cursor-pointer">
            <Undo2 className="w-3.5 h-3.5" /><span>Tạo lại</span>
          </button>
        </div>
      )}

      {/* Control bar: Tìm kiếm, Bộ lọc & Mật độ */}
      <div className="px-3.5 py-2 bg-[#f8fafc] border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1 bg-[#e2e8f0]/60 p-0.5 rounded-lg border border-[#cbd5e1]">
          {(['all', 'touched', 'incomplete'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilterMode(mode)}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${filterMode === mode ? 'bg-white text-[#004776] font-bold shadow-2xs' : 'text-[#64748b]'}`}
            >
              {mode === 'all' ? `Tất cả (${rows.length})` : mode === 'touched' ? 'Đã sửa' : 'Chưa xong'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#64748b]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Lọc nhanh..."
              className="pl-8 pr-7 py-1 text-xs rounded-lg border border-[#cbd5e1] bg-white text-[#004776] w-36 sm:w-44 focus:ring-1 focus:ring-[#004776] outline-hidden"
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm('')} className="absolute right-2 top-1.5 text-[#94a3b8]">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setDensity(density === 'compact' ? 'comfortable' : 'compact')}
            className="hidden sm:inline-flex px-2 py-1 rounded-lg border border-[#cbd5e1] bg-white text-[11px] font-semibold text-[#004776] hover:bg-[#f1f5f9] cursor-pointer"
          >
            {density === 'compact' ? 'Gọn' : 'Thoải mái'}
          </button>
        </div>
      </div>

      {/* MOBILE (< 768px): Row Card Editor */}
      <div className="block md:hidden p-3 bg-[#f8fafc]/50">
        <ExcelRowCardEditor
          meta={meta}
          rows={filteredRows}
          dynamicOptionsMap={dynamicOptionsMap}
          isC1Locked={isC1Locked}
          touchedCells={touchedCells}
          onCellTouch={onCellTouch}
          onCellChange={onCellChange}
          onAddRow={onAddRow}
          onSplitRow={onSplitRow}
          onDeleteRow={(id) => setConfirmDeleteId(id)}
        />
      </div>

      {/* DESKTOP (>= 768px): Data Grid */}
      <div className="hidden md:block flex-1 overflow-x-auto overflow-y-auto max-h-[580px] select-text w-full max-w-full">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10 shadow-xs">
            <tr className="bg-[#f1f5f9] text-[#64748b] border-b border-[#cbd5e1]">
              <th className="w-12 min-w-[48px] py-1 text-center font-bold border-r border-[#cbd5e1] select-none bg-[#e2e8f0] sticky left-0 z-11">#</th>
              {meta.columns.map((c) => (
                <th key={c.colLetter} style={{ width: c.width || '150px', minWidth: c.width || '150px' }} className="py-1 px-2 text-center font-bold border-r border-[#cbd5e1] select-none text-[#475569]">{c.colLetter}</th>
              ))}
              <th className="w-14 min-w-[56px] py-1 text-center border-r border-[#cbd5e1] select-none">...</th>
            </tr>
            <tr className="bg-[#f8fafc] text-[#004776] border-b-2 border-[#cbd5e1]">
              <th className="w-12 py-2 text-center font-bold border-r border-[#cbd5e1] select-none sticky left-0 z-11 bg-[#f8fafc]">Dòng</th>
              {meta.columns.map((c) => (
                <th key={c.field} style={{ width: c.width || '150px', minWidth: c.width || '150px' }} className="py-2 px-2 text-left font-bold border-r border-[#cbd5e1] align-top whitespace-normal">
                  <div className="flex items-start justify-between gap-1">
                    <span className="leading-tight">{c.headerName}</span>
                    {c.isFormula && <span className="text-[10px] text-blue-700 bg-blue-50 px-1 rounded border border-blue-200 mt-0.5 shrink-0">=fx</span>}
                  </div>
                </th>
              ))}
              <th className="w-14 py-2 text-center font-bold border-r border-[#cbd5e1]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0]">
            {filteredRows.length === 0 ? (
              <tr><td colSpan={meta.columns.length + 2} className="py-10 text-center text-[#64748b] bg-[#fafafa]">Không có dòng nào khớp.</td></tr>
            ) : (
              filteredRows.map((row, rIdx) => (
                <tr key={row.id} className="odd:bg-white even:bg-[#fafcff] hover:bg-sky-50/40 focus-within:bg-blue-50/30 transition-colors group">
                  <td className="w-12 py-1.5 text-center font-bold text-[#64748b] bg-[#f1f5f9] border-r border-[#cbd5e1] select-none align-top sticky left-0 z-2">{rIdx + 1}</td>
                  {meta.columns.map((col) => (
                    <ExcelDataCell
                      key={col.field} col={col} val={row[col.field]} rowId={row.id}
                      isComputed={col.isFormula || col.readOnly || isC1Locked}
                      isTouched={touchedCells?.has(`${row.id}_${col.field}`) ?? false}
                      cellKey={`${row.id}_${col.field}`}
                      dynamicOptions={col.dynamicOptionsKey ? dynamicOptionsMap?.[col.dynamicOptionsKey] : undefined}
                      density={density} onCellTouch={onCellTouch} onCellChange={onCellChange}
                    />
                  ))}
                  <td className="w-14 py-1 text-center border-r border-[#cbd5e1] align-top">
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {meta.key === 'A1' && (
                        <button type="button" onClick={() => onSplitRow?.(row.id)} title="Tách nhiệm vụ" className="w-6 h-6 inline-flex items-center justify-center text-indigo-600 hover:bg-indigo-50 rounded cursor-pointer">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {!isC1Locked && (
                        <button type="button" onClick={() => setConfirmDeleteId(row.id)} title="Xóa dòng" className="w-6 h-6 inline-flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer bảng */}
      <div className="px-3.5 py-2 bg-[#f8fafc] border-t border-[#e2e8f0] flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {!isC1Locked && (
            <button type="button" onClick={onAddRow} className="inline-flex items-center gap-1 min-h-[36px] px-3 text-xs font-bold bg-[#004776] text-white rounded-xl hover:bg-[#00385c] active:scale-95 cursor-pointer shadow-2xs">
              <Plus className="w-3.5 h-3.5" /><span>{meta.key === 'A1' ? 'Thêm nhiệm vụ' : 'Thêm dòng'}</span>
            </button>
          )}
          <button type="button" onClick={onSaveSheet} className="inline-flex items-center gap-1 min-h-[36px] px-3.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 rounded-xl cursor-pointer shadow-2xs">
            <Save className="w-3.5 h-3.5" /><span>Lưu biểu</span>
          </button>
          {canNext && (
            <button type="button" onClick={onSaveAndNext} className="inline-flex items-center gap-1 min-h-[36px] px-3 text-xs font-bold text-[#004776] bg-blue-50 hover:bg-[#004776] hover:text-white border border-[#004776]/30 rounded-xl cursor-pointer shadow-2xs">
              <span>Lưu &amp; sang biểu tiếp</span><ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-[#64748b]">
          {isJustSaved && <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" />Đã lưu lúc {lastSaved}</span>}
          <span>Hiển thị: <strong>{filteredRows.length}</strong>/{rows.length} dòng</span>
        </div>
      </div>

      {/* Modal xác nhận xóa */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 select-none animate-in fade-in" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-3 shadow-2xl border border-[#cbd5e1]">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm"><AlertTriangle className="w-5 h-5 shrink-0" /><span>Xác nhận xóa dòng dữ liệu</span></div>
            <p className="text-xs text-[#475569]">Bạn có chắc chắn muốn xóa dòng này? Sau khi xóa, bạn vẫn có thể tạo lại dòng mới.</p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setConfirmDeleteId(null)} className="px-3.5 py-2 text-xs font-bold text-[#004776] border border-[#cbd5e1] rounded-xl hover:bg-slate-50 cursor-pointer">Hủy</button>
              <button type="button" onClick={handleConfirmDelete} className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer shadow-xs">Xóa dòng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
