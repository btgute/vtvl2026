'use client';

import React, { useState } from 'react';
import { CheckCircle2, Download, FolderArchive, FileSpreadsheet, RefreshCw, FileText } from 'lucide-react';
import { SplitResultSummary } from '@/types/vtvl';
import { previewGeneratedFileNames } from '@/services/excel-split/workbook-builder';
import { RegenFormsResult, regenerateFormsFromEditedUnitWorkbook } from '@/services/excel-split/regen-forms';

interface Props {
  result: SplitResultSummary;
  onDownload: (blob: Blob, filename: string) => void;
}

export function SplitFileNamesPreview({
  unitCode,
  exportDate,
  includeZip
}: {
  unitCode: string;
  exportDate: string;
  includeZip: boolean;
}) {
  const names = previewGeneratedFileNames(unitCode, exportDate);
  const items = [
    { name: names.unitFileName, tag: 'tệp đơn vị gốc (22 sheet)', accent: true },
    { name: names.draftUnitFileName, tag: 'tệp đơn vị dự thảo (ô cam gợi ý + Can_cu_goi_y)', accent: true },
    { name: names.fullFormFileName, tag: 'phiếu thu số liệu đầy đủ (có D1 cho đầu mối)', accent: false },
    ...(includeZip ? [{ name: names.zipFileName, tag: 'phiếu từng vị trí (.zip, không có D1)', accent: true }] : [])
  ];

  return (
    <div aria-live="polite" className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3.5 space-y-2">
      <div className="text-xs font-extrabold uppercase tracking-wider text-[var(--primary)]">
        Tệp sẽ tạo ({items.length} tệp riêng biệt)
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((it) => (
          <div key={it.name} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--sheet)] px-3 py-2 text-xs">
            <span className="inline-flex items-center gap-1.5 font-mono font-bold text-[var(--foreground)] truncate">
              <FileSpreadsheet className="w-4 h-4 text-[var(--primary)] shrink-0" />
              <span className="truncate">{it.name}</span>
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${it.accent ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'bg-[var(--muted)] text-[var(--ink-muted)]'}`}>
              {it.tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RegenFormsFromUnitBox({
  exportDate,
  includeZip,
  onDownload
}: {
  exportDate: string;
  includeZip: boolean;
  onDownload: (blob: Blob, filename: string) => void;
}) {
  const [regenLoading, setRegenLoading] = useState(false);
  const [regenErr, setRegenErr] = useState('');
  const [regenRes, setRegenRes] = useState<RegenFormsResult | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setRegenErr('');
    setRegenLoading(true);
    try {
      const res = await regenerateFormsFromEditedUnitWorkbook(f, includeZip, exportDate);
      setRegenRes(res);
    } catch (err) {
      setRegenErr(err instanceof Error ? err.message : 'Không thể đọc tệp đơn vị đã sửa.');
    } finally {
      setRegenLoading(false);
    }
  };

  return (
    <details className="rounded-xl border border-dashed border-[var(--primary)]/40 bg-[var(--background)] overflow-hidden">
      <summary className="cursor-pointer px-4 py-3 min-h-[44px] text-xs sm:text-sm font-bold text-[var(--foreground)] flex items-center justify-between">
        <span className="inline-flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-[var(--primary)] shrink-0" />
          <span>Tạo lại phiếu từ tệp đơn vị đã sửa (khi đổi phương pháp ở Biểu C3 hoặc thêm việc ở B1)</span>
        </span>
        <span className="text-xs font-bold text-[var(--primary)]">Mở / Đóng</span>
      </summary>
      <div className="p-4 border-t border-[var(--border-subtle)] space-y-3 text-xs sm:text-sm">
        <p className="text-[var(--ink-muted)]">
          Gợi ý phút/SP chỉ có ở vị trí tính theo <strong>PP2</strong>. Khi đơn vị đổi phương pháp ở Biểu <code>8. C3_NhuCau</code> hoặc bổ sung công việc ở <code>3. B1_KhoiLuong</code>, hãy chọn tệp đơn vị đã sửa tại đây: hệ thống sẽ đọc lại Biểu C3, B1 và Danh mục sản phẩm để tạo lại Phiếu thu số liệu và gói <code>.zip</code> từng vị trí mà không làm hỏng tệp đơn vị.
        </p>
        <div>
          <label htmlFor="regen-unit-file" className="block font-bold text-[var(--foreground)] mb-1">
            Chọn tệp đơn vị đã chỉnh sửa (.xlsx)
          </label>
          <input
            id="regen-unit-file"
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(e) => void handleFileChange(e)}
            className="w-full text-xs rounded-xl border border-[var(--border)] bg-[var(--sheet)] px-3 py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--primary)] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white cursor-pointer"
          />
        </div>
        {regenLoading && <p className="font-bold text-[var(--primary)]">Đang đọc Biểu C3, B1 và tạo lại bộ phiếu…</p>}
        {regenErr && <p className="font-bold text-[var(--fix)]">{regenErr}</p>}
        {regenRes && (
          <div className="rounded-xl border border-[var(--ok)]/40 bg-[var(--ok-soft)] p-3 space-y-2.5">
            <div className="font-bold text-[var(--ok)]">
              ✓ Đã tạo lại bộ phiếu cho [{regenRes.unitCode}] ({regenRes.vtvlCount} VTVL, trong đó {regenRes.pp2PositionCount} vị trí tính theo PP2 · {regenRes.taskCount} công việc)
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onDownload(regenRes.fullFormBlob, regenRes.fullFormFileName)}
                className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải phiếu đầy đủ: {regenRes.fullFormFileName}</span>
              </button>
              {regenRes.zipBlob && regenRes.zipFileName && (
                <button
                  type="button"
                  onClick={() => onDownload(regenRes.zipBlob!, regenRes.zipFileName!)}
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl border border-[var(--primary)] bg-[var(--sheet)] text-[var(--primary)] text-xs font-bold cursor-pointer"
                >
                  <FolderArchive className="w-3.5 h-3.5" />
                  <span>Tải gói .zip từng vị trí: {regenRes.zipFileName}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </details>
  );
}

export function SplitResultBanner({ result, onDownload }: Props) {
  return (
    <div className="rounded-2xl border border-[var(--ok)]/40 bg-[var(--ok-soft)]/50 p-4 space-y-4 mt-3">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-[var(--ok)]" />
        <h3 className="text-sm sm:text-base font-extrabold text-[var(--foreground)]">
          Đã khởi tạo đồng thời 4 tệp chuẩn (22 trang tính, có Can_cu_goi_y) cho {result.unitNameVi} ({result.unitCode})
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-[var(--sheet)] border border-[var(--border)] p-3">
          <div className="text-xs text-[var(--ink-muted)]">Số nhiệm vụ (Biểu A1)</div>
          <div className="text-2xl font-extrabold text-[var(--foreground)] tabular-nums">{result.missionCount}</div>
        </div>
        <div className="rounded-xl bg-[var(--sheet)] border border-[var(--border)] p-3">
          <div className="text-xs text-[var(--ink-muted)]">Số vị trí việc làm (Biểu C1)</div>
          <div className="text-2xl font-extrabold text-[var(--primary)] tabular-nums">{result.vtvlCount}</div>
        </div>
        <div className="rounded-xl bg-[var(--sheet)] border border-[var(--border)] p-3">
          <div className="text-xs text-[var(--ink-muted)]">Số công việc (Biểu A2, B1)</div>
          <div className="text-2xl font-extrabold text-[var(--foreground)] tabular-nums">{result.taskCount}</div>
        </div>
        <div className="rounded-xl bg-[var(--sheet)] border border-[var(--border)] p-3">
          <div className="text-xs text-[var(--ink-muted)]">Nhu cầu nhân lực (Biểu C3)</div>
          <div className="text-2xl font-extrabold text-[#ED1C24] tabular-nums">{result.totalStandardFte}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => onDownload(result.unitBlob, result.unitFileName)}
          className="justify-between inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-[var(--primary)] text-white font-bold text-xs cursor-pointer shadow-2xs"
        >
          <span className="inline-flex items-center gap-2 truncate"><Download className="w-4 h-4 shrink-0" /><span className="truncate">1. Tệp đơn vị gốc: {result.unitFileName}</span></span>
          <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full shrink-0">22 sheet</span>
        </button>

        <button
          type="button"
          onClick={() => onDownload(result.draftUnitBlob, result.draftUnitFileName)}
          className="justify-between inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-[var(--sheet)] border border-[var(--primary)] text-[var(--primary)] font-bold text-xs cursor-pointer"
        >
          <span className="inline-flex items-center gap-2 truncate"><FileText className="w-4 h-4 shrink-0" /><span className="truncate">2. Tệp đơn vị dự thảo (Ô cam gợi ý): {result.draftUnitFileName}</span></span>
          <span className="text-[11px] bg-[var(--primary)]/10 px-2 py-0.5 rounded-full shrink-0">Có gợi ý</span>
        </button>

        <button
          type="button"
          onClick={() => onDownload(result.fullFormBlob, result.fullFormFileName)}
          className="justify-between inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-[var(--sheet)] border border-[var(--border)] hover:border-[var(--primary)] text-[var(--foreground)] font-bold text-xs cursor-pointer"
        >
          <span className="inline-flex items-center gap-2 truncate"><Download className="w-4 h-4 text-[var(--primary)] shrink-0" /><span className="truncate">3. Phiếu thu số liệu đầy đủ: {result.fullFormFileName}</span></span>
          <span className="text-[11px] bg-[var(--muted)] px-2 py-0.5 rounded-full shrink-0">Đầu mối</span>
        </button>

        {result.zipBlob && result.zipFileName && (
          <button
            type="button"
            onClick={() => onDownload(result.zipBlob!, result.zipFileName!)}
            className="justify-between inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-[var(--sheet)] border border-[var(--border)] hover:border-[var(--primary)] text-[var(--foreground)] font-bold text-xs cursor-pointer"
          >
            <span className="inline-flex items-center gap-2 truncate"><FolderArchive className="w-4 h-4 text-[#ED1C24] shrink-0" /><span className="truncate">4. Gói phiếu từng vị trí (.zip): {result.zipFileName}</span></span>
            <span className="text-[11px] bg-red-50 text-[#ED1C24] px-2 py-0.5 rounded-full shrink-0">{result.vtvlCount} phiếu</span>
          </button>
        )}
      </div>
    </div>
  );
}
