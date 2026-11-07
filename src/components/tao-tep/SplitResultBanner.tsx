'use client';

import React from 'react';
import { CheckCircle2, Download, FolderArchive } from 'lucide-react';
import { SplitResultSummary } from '@/types/vtvl';

interface Props {
  result: SplitResultSummary;
  onDownload: (blob: Blob, filename: string) => void;
}

export function SplitResultBanner({ result, onDownload }: Props) {
  return (
    <div className="rounded-2xl border border-[var(--ok)]/40 bg-[var(--ok-soft)]/50 p-4 space-y-4 mt-3">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-[var(--ok)]" />
        <h3 className="text-sm sm:text-base font-extrabold text-[var(--foreground)]">
          Đã khởi tạo bộ biểu chuẩn 21 trang tính cho {result.unitNameVi} ({result.unitCode})
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-[var(--sheet)] border border-[var(--border)] p-3">
          <div className="text-xs text-[var(--ink-muted)]">Số nhiệm vụ (Biểu A1)</div>
          <div className="text-2xl font-extrabold text-[var(--foreground)] tabular-nums">
            {result.missionCount}
          </div>
        </div>
        <div className="rounded-xl bg-[var(--sheet)] border border-[var(--border)] p-3">
          <div className="text-xs text-[var(--ink-muted)]">Số vị trí việc làm (Biểu C1)</div>
          <div className="text-2xl font-extrabold text-[var(--primary)] tabular-nums">
            {result.vtvlCount}
          </div>
        </div>
        <div className="rounded-xl bg-[var(--sheet)] border border-[var(--border)] p-3">
          <div className="text-xs text-[var(--ink-muted)]">Số công việc (Biểu A2, B1)</div>
          <div className="text-2xl font-extrabold text-[var(--foreground)] tabular-nums">
            {result.taskCount}
          </div>
        </div>
        <div className="rounded-xl bg-[var(--sheet)] border border-[var(--border)] p-3">
          <div className="text-xs text-[var(--ink-muted)]">Nhu cầu nhân lực (Biểu C3)</div>
          <div className="text-2xl font-extrabold text-[#ED1C24] tabular-nums">
            {result.totalStandardFte}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--sheet)]">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-[var(--background)] border-b border-[var(--border)]">
              <th className="py-2 px-3 text-left">Mã VTVL</th>
              <th className="py-2 px-3 text-left">Khung Trường &amp; Tên VTVL cụ thể tại đơn vị</th>
              <th className="py-2 px-3 text-left">Bậc nghề nghiệp</th>
              <th className="py-2 px-3 text-left">PP</th>
              <th className="py-2 px-3 text-right">Quỹ giờ</th>
              <th className="py-2 px-3 text-right">Giờ B1</th>
              <th className="py-2 px-3 text-right">Giờ ròng</th>
              <th className="py-2 px-3 text-right">Nhu cầu C3</th>
            </tr>
          </thead>
          <tbody>
            {result.positionBreakdown.map((p) => (
              <tr key={p.vtvlCode} className="border-b border-[var(--border-subtle)]">
                <td className="py-2 px-3 font-mono font-bold text-[var(--primary)]">{p.vtvlCode}</td>
                <td className="py-2 px-3">
                  <strong className="text-[var(--foreground)] block">{p.vtvlName}</strong>
                  <span className="text-[11px] text-[var(--ink-muted)] block">
                    Khung: {p.frameworkTitle || p.vtvlName} · {p.vtvlGroup4}
                  </span>
                </td>
                <td className="py-2 px-3 font-semibold text-[#ED1C24] whitespace-nowrap">{p.careerLevel || 'Bậc 3'}</td>
                <td className="py-2 px-3 font-mono font-semibold">{p.method}</td>
                <td className="py-2 px-3 text-right tabular-nums">{p.standardHoursYear}h</td>
                <td className="py-2 px-3 text-right tabular-nums">{p.b1HoursYear}h</td>
                <td className="py-2 px-3 text-right font-bold tabular-nums">{p.netHoursYear}h</td>
                <td className="py-2 px-3 text-right font-extrabold text-[#ED1C24] tabular-nums">
                  {p.recommendedFte}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() => onDownload(result.unitBlob, result.unitFileName)}
          className="w-full sm:w-auto justify-center inline-flex items-center gap-2 min-h-10 px-4 py-2 rounded-xl bg-[var(--primary)] text-white font-semibold text-xs cursor-pointer shadow-2xs"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span className="truncate">Tải tệp đơn vị (21 trang tính): {result.unitFileName}</span>
        </button>
        <button
          type="button"
          onClick={() => onDownload(result.fullFormBlob, result.fullFormFileName)}
          className="w-full sm:w-auto justify-center inline-flex items-center gap-2 min-h-10 px-4 py-2 rounded-xl bg-[var(--sheet)] border border-[var(--border)] hover:border-[var(--primary)] text-[var(--foreground)] font-semibold text-xs cursor-pointer"
        >
          <Download className="w-4 h-4 text-[var(--primary)] shrink-0" />
          <span className="truncate">Tải phiếu khảo sát tổng hợp: {result.fullFormFileName}</span>
        </button>
        {result.zipBlob && result.zipFileName && (
          <button
            type="button"
            onClick={() => onDownload(result.zipBlob!, result.zipFileName!)}
            className="w-full sm:w-auto justify-center inline-flex items-center gap-2 min-h-10 px-4 py-2 rounded-xl bg-[var(--sheet)] border border-[var(--border)] hover:border-[var(--primary)] text-[var(--foreground)] font-semibold text-xs cursor-pointer"
          >
            <FolderArchive className="w-4 h-4 text-[#ED1C24] shrink-0" />
            <span>Tải gói phiếu theo từng vị trí (.zip)</span>
          </button>
        )}
      </div>
    </div>
  );
}
