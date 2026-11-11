'use client';

import React from 'react';
import Link from 'next/link';
import { ExcelSheetMeta } from './excel-grid-types';
import { X, BookOpen, ExternalLink, ShieldCheck, Info, FileSpreadsheet } from 'lucide-react';

interface GuidanceDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  meta: ExcelSheetMeta;
}

export function GuidanceDrawerModal({ isOpen, onClose, meta }: GuidanceDrawerModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs select-none"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
      tabIndex={-1}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-[#cbd5e1] overflow-hidden flex flex-col max-h-[90dvh] sm:max-h-[85dvh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-[#005fa3] text-white shrink-0 border-b border-[#004776]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#004776] flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-sky-200" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Hướng dẫn nghiệp vụ — {meta.sheetName} ({meta.title})
              </h3>
              <p className="text-[11px] text-white/90">
                Chuẩn hóa theo Hướng dẫn số 07-HD/BTCTW của Ban Tổ chức Trung ương
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-[#004776] cursor-pointer"
            aria-label="Đóng cửa sổ hướng dẫn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-[#004776]/90 leading-relaxed">
          {/* Căn cứ pháp lý */}
          <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#cbd5e1] space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[#004776]">
              <ShieldCheck className="w-4 h-4 text-[#004776]" />
              <span>Căn cứ pháp lý hiện hành (2026)</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-[#334155]">
              <li><strong>Hướng dẫn số 07-HD/BTCTW</strong> của Ban Tổ chức Trung ương về việc xây dựng đề án vị trí việc làm.</li>
              <li><strong>Nghị định số 232/2026/NĐ-CP</strong> của Chính phủ về vị trí việc làm và cơ cấu viên chức theo chức danh nghề nghiệp.</li>
              <li><strong>Thông tư số 31/2026/TT-BGDĐT</strong> ngày 14/4/2026 của Bộ GD&amp;ĐT hướng dẫn vị trí việc làm và định mức giờ giảng dạy.</li>
              <li><strong>Quyết định số 2266/QĐ-ĐHCNKT</strong> ngày 30/12/2025 ban hành Quy định chức năng, nhiệm vụ của 51 đơn vị thuộc HCM-UTE.</li>
            </ul>
          </div>

          {/* Lưu ý nghiệp vụ cho sheet hiện tại */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[#004776]">
              <Info className="w-4 h-4 text-[#004776]" />
              <span>Lưu ý nhập liệu biểu {meta.sheetName}</span>
            </div>
            <p className="text-[#1e3a5f]">
              Biểu <strong>{meta.sheetName}</strong> gồm <strong>{meta.columns.length} cột</strong> chỉ tiêu.
              Các cột có biểu tượng <code>=fx</code> là cột công thức tự động tính toán, người dùng không cần nhập thủ công.
            </p>
          </div>

          {/* Danh sách cột & công thức */}
          <div className="space-y-1.5">
            <span className="font-bold text-[#004776] block">Danh mục các cột chỉ tiêu:</span>
            <div className="border border-[#cbd5e1] rounded-xl overflow-hidden max-h-48 overflow-y-auto">
              <table className="w-full text-[11px] divide-y divide-[#e2e8f0]">
                <thead className="bg-[#f1f5f9] text-[#004776] font-bold sticky top-0">
                  <tr>
                    <th className="py-1 px-2 text-left w-12">Cột</th>
                    <th className="py-1 px-2 text-left">Tên chỉ tiêu</th>
                    <th className="py-1 px-2 text-left w-24">Tính chất</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {meta.columns.map((col) => (
                    <tr key={col.field} className="hover:bg-slate-50">
                      <td className="py-1 px-2 font-bold text-[#004776]">{col.colLetter}</td>
                      <td className="py-1 px-2 font-medium">{col.headerName}</td>
                      <td className="py-1 px-2">
                        {col.isFormula ? (
                          <span className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-bold text-[10px]">Tự tính</span>
                        ) : col.readOnly ? (
                          <span className="text-slate-600 bg-slate-100 px-1 py-0.5 rounded text-[10px]">Chỉ đọc</span>
                        ) : (
                          <span className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded text-[10px]">Nhập tay</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#f8fafc] border-t border-[#cbd5e1] flex items-center justify-between">
          <Link
            href="/huong-dan"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004776] hover:underline"
            onClick={onClose}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Mở cẩm nang HD 07 toàn bộ</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#004776] text-white text-xs font-bold hover:bg-[#00385c] cursor-pointer shadow-2xs"
          >
            Đã hiểu &amp; Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

