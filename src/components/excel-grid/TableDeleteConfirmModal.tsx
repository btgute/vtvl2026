'use client';

import React from 'react';
import { AlertTriangle, Undo2 } from 'lucide-react';
import { GenericGridRow } from './excel-grid-types';

interface TableDeleteConfirmModalProps {
  confirmDeleteId: string | null;
  deletedRowBackup: { row: GenericGridRow; index: number } | null;
  onCancel: () => void;
  onConfirm: () => void;
  onRestoreBackup: () => void;
}

export function TableDeleteConfirmModal({
  confirmDeleteId,
  deletedRowBackup,
  onCancel,
  onConfirm,
  onRestoreBackup
}: TableDeleteConfirmModalProps) {
  return (
    <>
      {deletedRowBackup && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 flex items-center justify-between text-xs text-amber-900">
          <span>Đã xóa dòng #{deletedRowBackup.index + 1}.</span>
          <button
            type="button"
            onClick={onRestoreBackup}
            className="inline-flex items-center gap-1 font-bold text-[#004776] hover:underline cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Tạo lại</span>
          </button>
        </div>
      )}

      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 select-none animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-3 shadow-2xl border border-[#cbd5e1]">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Xác nhận xóa dòng dữ liệu</span>
            </div>
            <p className="text-xs text-[#475569]">
              Bạn có chắc chắn muốn xóa dòng này? Sau khi xóa, bạn vẫn có thể tạo lại dòng mới.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-3.5 py-2 text-xs font-bold text-[#004776] border border-[#cbd5e1] rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer shadow-xs"
              >
                Xóa dòng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
