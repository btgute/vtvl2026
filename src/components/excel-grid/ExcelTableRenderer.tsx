'use client';

import React, { useState, useMemo } from 'react';
import { ExcelSheetMeta, GenericGridRow } from './excel-grid-types';
import { ExcelDataCell } from './ExcelDataCell';
import { ExcelRowCardEditor } from './ExcelRowCardEditor';
import { TableDeleteConfirmModal } from './TableDeleteConfirmModal';
import { TableControlBar } from './TableControlBar';
import { ArrowUpDown, Plus, Trash2, Copy } from 'lucide-react';

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
  onSaveSheet?: () => void;
  onSaveAndNext?: () => void;
  canNext?: boolean;
}

export function ExcelTableRenderer({
  meta, rows, dynamicOptionsMap,
  isC1Unlocked = false, touchedCells, onCellTouch, onCellChange,
  onAddRow, onSplitRow, onDeleteRow
}: ExcelTableRendererProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [density, setDensity] = useState<'compact' | 'comfortable'>('comfortable');
  const [filterMode, setFilterMode] = useState<'all' | 'touched' | 'incomplete'>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletedRowBackup, setDeletedRowBackup] = useState<{ row: GenericGridRow; index: number } | null>(null);

  const isC1Locked = meta.key === 'C1' && !isC1Unlocked;

  const handleSort = (field: string) => {
    if (sortField === field) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else { setSortField(null); setSortOrder('asc'); }
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const processedRows = useMemo(() => {
    let res = [...rows];
    if (filterMode === 'touched') {
      res = res.filter((r) => meta.columns.some((c) => touchedCells?.has(`${r.id}_${c.field}`)));
    } else if (filterMode === 'incomplete') {
      res = res.filter((r) => meta.columns.some((c) => c.required && !String(r[c.field] ?? '').trim()));
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      res = res.filter((r) => Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(term)));
    }
    if (sortField) {
      res.sort((a, b) => {
        const valA = a[sortField] ?? '';
        const valB = b[sortField] ?? '';
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
        return sortOrder === 'asc'
          ? String(valA).localeCompare(String(valB), 'vi')
          : String(valB).localeCompare(String(valA), 'vi');
      });
    }
    return res;
  }, [rows, searchTerm, filterMode, sortField, sortOrder, meta.columns, touchedCells]);

  const allSelected = processedRows.length > 0 && processedRows.every((r) => selectedRowIds.has(r.id));
  const toggleSelectAll = () => {
    if (allSelected) setSelectedRowIds(new Set());
    else setSelectedRowIds(new Set(processedRows.map((r) => r.id)));
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedRowIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRowIds(next);
  };

  const handleConfirmDelete = () => {
    if (!confirmDeleteId) return;
    const idx = rows.findIndex((r) => r.id === confirmDeleteId);
    if (idx >= 0) setDeletedRowBackup({ row: rows[idx], index: idx });
    onDeleteRow(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  return (
    <div className={`flex flex-col bg-white border border-[#cbd5e1] rounded-2xl shadow-2xs overflow-hidden w-full max-w-full min-w-0 transition-all ${
      isFullscreen ? 'fixed inset-2 z-50 rounded-xl' : 'h-full'
    }`}>
      <TableDeleteConfirmModal
        confirmDeleteId={confirmDeleteId}
        deletedRowBackup={deletedRowBackup}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={handleConfirmDelete}
        onRestoreBackup={() => { onAddRow(); setDeletedRowBackup(null); }}
      />

      <TableControlBar
        meta={meta}
        rowsCount={processedRows.length}
        searchTerm={searchTerm}
        filterMode={filterMode}
        density={density}
        isFullscreen={isFullscreen}
        onSearchChange={setSearchTerm}
        onFilterModeChange={setFilterMode}
        onDensityChange={setDensity}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
      />

      {/* MOBILE (< 768px): Card Editor */}
      <div className="block md:hidden p-3 bg-[#f8fafc]/50">
        <ExcelRowCardEditor
          meta={meta}
          rows={processedRows}
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

      {/* DESKTOP (>= 768px): BẢNG DỮ LIỆU */}
      <div className="hidden md:block flex-1 overflow-x-auto overflow-y-auto max-h-[620px] select-text w-full max-w-full">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#f8fafc] text-[#004776] border-b border-[#cbd5e1]">
              <th className="w-10 min-w-[40px] py-2 px-2 text-center border-r border-[#cbd5e1] sticky left-0 z-11 bg-[#f8fafc]">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-[#cbd5e1] text-[#004776] focus:ring-[#004776] cursor-pointer"
                />
              </th>
              <th
                onClick={() => handleSort('id')}
                className="w-12 min-w-[48px] py-2 px-1 text-center font-bold border-r border-[#cbd5e1] cursor-pointer hover:bg-[#f1f5f9] select-none"
              >
                <div className="inline-flex items-center gap-1 justify-center">
                  <span>STT</span>
                  <ArrowUpDown className="w-3 h-3 text-[#94a3b8]" />
                </div>
              </th>
              {meta.columns.map((c) => (
                <th
                  key={c.field}
                  style={{ width: c.width || '150px', minWidth: c.width || '140px' }}
                  onClick={() => handleSort(c.field)}
                  className="py-2 px-2.5 text-left font-bold border-r border-[#cbd5e1] align-middle cursor-pointer hover:bg-[#f1f5f9] select-none"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="leading-tight">{c.headerName}</span>
                    <ArrowUpDown className="w-3 h-3 text-[#94a3b8] shrink-0" />
                  </div>
                </th>
              ))}
              <th className="w-12 py-2 text-center border-r border-[#cbd5e1] select-none text-[#94a3b8]">⋯</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9]">
            {processedRows.length === 0 ? (
              <tr><td colSpan={meta.columns.length + 3} className="py-12 text-center text-[#64748b] bg-[#fafafa]">Không có dữ liệu phù hợp.</td></tr>
            ) : (
              processedRows.map((row, rIdx) => (
                <tr key={row.id} className="odd:bg-white even:bg-[#fafcff] hover:bg-sky-50/50 transition-colors group">
                  <td className="w-10 py-1.5 px-2 text-center border-r border-[#f1f5f9] sticky left-0 z-2 bg-inherit">
                    <input
                      type="checkbox"
                      checked={selectedRowIds.has(row.id)}
                      onChange={() => toggleSelectRow(row.id)}
                      className="rounded border-[#cbd5e1] text-[#004776] focus:ring-[#004776] cursor-pointer"
                    />
                  </td>
                  <td className="w-12 py-1.5 text-center font-semibold text-[#64748b] border-r border-[#f1f5f9] select-none">
                    {rIdx + 1}
                  </td>
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
                  <td className="w-12 py-1 text-center border-r border-[#f1f5f9]">
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {meta.key === 'A1' && (
                        <button type="button" onClick={() => onSplitRow?.(row.id)} title="Tách nhiệm vụ" className="w-5 h-5 text-indigo-600 hover:bg-indigo-50 rounded cursor-pointer">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {!isC1Locked && (
                        <button type="button" onClick={() => setConfirmDeleteId(row.id)} title="Xóa dòng" className="w-5 h-5 text-rose-500 hover:bg-rose-50 rounded cursor-pointer">
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

      {/* FOOTER BẢNG */}
      <div className="px-3.5 py-2 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between text-xs text-[#64748b]">
        {!isC1Locked ? (
          <button
            type="button"
            onClick={onAddRow}
            className="inline-flex items-center gap-1 px-3 py-1 font-bold text-[#004776] bg-white hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded-lg cursor-pointer transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{meta.key === 'A1' ? 'Thêm nhiệm vụ' : 'Thêm dòng mới'}</span>
          </button>
        ) : <div />}

        <div>
          <span>Tổng số: <strong>{processedRows.length}</strong> dòng</span>
          {selectedRowIds.size > 0 && <span className="ml-2 text-[#004776] font-semibold">({selectedRowIds.size} đã chọn)</span>}
        </div>
      </div>
    </div>
  );
}
