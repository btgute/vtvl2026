'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  Download,
  Trash2,
  FileCheck2
} from 'lucide-react';
import {
  MergeFormsResult,
  mergeSurveyFormsIntoUnit
} from '@/services/excel-merge/merge-forms';
import { recordActivity } from '@/services/telemetry/activity-log';

export function MergeStepSection() {
  const [unitFile, setUnitFile] = useState<File | null>(null);
  const [formFiles, setFormFiles] = useState<File[]>([]);
  const [mergeDate, setMergeDate] = useState<string>('2026-11-07');
  const [merging, setMerging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [mergeResult, setMergeResult] = useState<MergeFormsResult | null>(null);

  const handleAddForms = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    setFormFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      return [...prev, ...selected.filter((f) => !existingNames.has(f.name))];
    });
    setMergeResult(null);
  };

  const handleRunMerge = async () => {
    if (!unitFile) {
      setErrorMsg('Đơn vị vui lòng lựa chọn tệp dữ liệu đơn vị gốc (.xlsx) tại mục 4.1.');
      return;
    }
    if (formFiles.length === 0) {
      setErrorMsg('Đơn vị vui lòng lựa chọn ít nhất một tệp phiếu khảo sát hoặc phiếu đo định mức (.xlsx) tại mục 4.2.');
      return;
    }
    setErrorMsg('');
    setMerging(true);
    try {
      const res = await mergeSurveyFormsIntoUnit(unitFile, formFiles, mergeDate);
      setMergeResult(res);
      recordActivity(
        res.unitCode,
        res.unitCode,
        'NAP_PHIEU',
        `Tổng hợp ${res.formsMergedCount} phiếu khảo sát → ${res.mergedFileName}`
      );
    } catch (err) {
      console.error('Error merging survey forms:', err);
      setErrorMsg('Không thể đọc hoặc tích hợp tệp dữ liệu. Vui lòng kiểm tra lại cấu trúc tệp .xlsx theo mẫu chuẩn của hệ thống.');
    } finally {
      setMerging(false);
    }
  };

  const downloadMerged = () => {
    if (!mergeResult) return;
    const url = URL.createObjectURL(mergeResult.mergedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mergeResult.mergedFileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section
      id="buoc-4"
      aria-labelledby="h4s"
      className="rounded-3xl border border-[var(--border)] bg-[var(--sheet)] p-5 sm:p-6 space-y-4 shadow-2xs scroll-mt-24"
    >
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-[var(--primary)] text-white font-extrabold text-xs flex items-center justify-center">
            4
          </span>
          <div>
            <h2 id="h4s" className="text-base sm:text-lg font-extrabold text-[var(--foreground)]">
              Bước 4: Tổng hợp và tích hợp các phiếu khảo sát vào tệp dữ liệu đơn vị
            </h2>
            <p className="text-xs text-[var(--ink-muted)]">
              Tải lên tệp dữ liệu gốc của đơn vị (phiên bản <code className="font-mono">v1</code>) cùng các tệp phiếu khảo sát đã thu thập để tự động cập nhật biểu <code className="font-mono">3. B1_KhoiLuong</code>, <code className="font-mono">8. C3_NhuCau</code> và <code className="font-mono">15. S_NhatKy</code>.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-5 space-y-1.5">
          <label className="block text-xs font-bold text-[var(--foreground)]">
            4.1. Tệp dữ liệu đơn vị gốc (.xlsx)
          </label>
          <input
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(e) => {
              setUnitFile(e.target.files?.[0] || null);
              setMergeResult(null);
            }}
            className="w-full text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--primary)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white cursor-pointer"
          />
          {unitFile && (
            <p className="text-[11px] font-mono text-[var(--ok)]">
              Đã chọn: {unitFile.name} ({(unitFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        <div className="md:col-span-3 space-y-1.5">
          <label className="block text-xs font-bold text-[var(--foreground)]">
            Ngày tổng hợp hồ sơ
          </label>
          <input
            type="date"
            value={mergeDate}
            onChange={(e) => setMergeDate(e.target.value)}
            className="w-full text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2"
          />
        </div>

        <div className="md:col-span-4 space-y-1.5">
          <label className="block text-xs font-bold text-[var(--foreground)]">
            4.2. Các tệp phiếu khảo sát đã kê khai (.xlsx)
          </label>
          <input
            type="file"
            multiple
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleAddForms}
            className="w-full text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--primary)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white cursor-pointer"
          />
          <p className="text-[11px] text-[var(--ink-subtle)]">
            Hỗ trợ phiếu khảo sát tổng hợp, phiếu theo vị trí và phiếu xuất từ phân hệ{' '}
            <Link href="/bam-gio" className="text-[var(--primary)] underline">
              Đo định mức
            </Link>
            .
          </p>
        </div>
      </div>

      {formFiles.length > 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--foreground)]">
              Danh sách {formFiles.length} tệp phiếu khảo sát đã chọn:
            </span>
            <button
              type="button"
              onClick={() => {
                setFormFiles([]);
                setMergeResult(null);
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#ED1C24] hover:underline cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa danh sách tệp đã chọn</span>
            </button>
          </div>
          <ul className="flex flex-wrap gap-2">
            {formFiles.map((f) => (
              <li
                key={f.name}
                className="inline-flex items-center gap-1.5 text-xs font-mono bg-[var(--sheet)] border border-[var(--border)] px-2.5 py-1 rounded-lg"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span>{f.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-2xl border border-[var(--fix)] bg-[var(--fix-soft)] p-3.5 text-xs text-[var(--fix)] font-semibold">
          {errorMsg}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleRunMerge}
          disabled={merging}
          className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[var(--primary)] hover:opacity-95 text-white font-semibold text-xs sm:text-sm cursor-pointer disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          <span>{merging ? 'Đang đối chiếu và tích hợp số liệu…' : 'Thực hiện đối chiếu và tổng hợp phiếu'}</span>
        </button>
        <span className="text-xs text-[var(--ink-subtle)]">
          Hệ thống tự động nâng phiên bản tệp (<code className="font-mono">v1 → v2</code>) và lưu nhật ký cập nhật tại biểu <code className="font-mono">15. S_NhatKy</code>.
        </span>
      </div>

      {mergeResult && (
        <div className="rounded-2xl border border-[var(--ok)]/40 bg-[var(--ok-soft)]/50 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[var(--ok)]" />
              <h3 className="text-sm font-bold text-[var(--foreground)]">
                Đã tích hợp thành công {mergeResult.formsMergedCount} phiếu khảo sát vào tệp đơn vị {mergeResult.unitCode} (v{mergeResult.oldVersion} → v{mergeResult.newVersion})
              </h3>
            </div>
            <button
              type="button"
              onClick={downloadMerged}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-[var(--ok)] text-white font-semibold text-xs cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span>Tải tệp đã tổng hợp: {mergeResult.mergedFileName}</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-[var(--sheet)] border border-[var(--border)] p-3">
              <div className="text-xs text-[var(--ink-muted)]">Số phiếu đã tích hợp</div>
              <div className="text-xl font-extrabold text-[var(--foreground)] tabular-nums">
                {mergeResult.formsMergedCount}
              </div>
            </div>
            <div className="rounded-xl bg-[var(--sheet)] border border-[var(--border)] p-3">
              <div className="text-xs text-[var(--ink-muted)]">Số công việc được cập nhật</div>
              <div className="text-xl font-extrabold text-[var(--primary)] tabular-nums">
                {mergeResult.updatedTasksCount}
              </div>
            </div>
            <div className="rounded-xl bg-[var(--sheet)] border border-[var(--border)] p-3">
              <div className="text-xs text-[var(--ink-muted)]">Số mục chênh lệch giữa các phiếu</div>
              <div className="text-xl font-extrabold text-[var(--warn)] tabular-nums">
                {mergeResult.conflicts.length}
              </div>
            </div>
          </div>

          {mergeResult.conflicts.length > 0 && (
            <div className="rounded-xl border border-[var(--warn)]/40 bg-[var(--warn-soft)] p-3 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[var(--warn)]">
                <AlertTriangle className="w-4 h-4" />
                <span>Phát hiện {mergeResult.conflicts.length} chỉ tiêu có giá trị kê khai khác nhau giữa các phiếu:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-[var(--foreground)]">
                {mergeResult.conflicts.map((c, idx) => (
                  <li key={idx}>
                    <strong>{c.taskCode}</strong> ({c.field}): Tệp <code className="font-mono">{c.formAName}</code> kê khai <strong>{c.valA}</strong>, tệp <code className="font-mono">{c.formBName}</code> kê khai <strong>{c.valB}</strong>.
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
