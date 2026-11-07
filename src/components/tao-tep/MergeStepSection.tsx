'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Upload, CheckCircle2, AlertTriangle, Download, Trash2, FileCheck2, Building2 } from 'lucide-react';
import { MergeFormsResult, mergeSurveyFormsIntoUnit } from '@/services/excel-merge/merge-forms';
import { getActiveUnitDefinition, getActiveUnitSession, getSessionFilesForUnit, recordActivity, setSessionMergedWorkbook, setSessionRootWorkbook } from '@/services/telemetry/activity-log';
import { generateUnitFiles } from '@/services/excel-split/workbook-builder';
import { HD07_CONSTANTS } from '@/configs/hcmute-hd07-catalog';
import { HcmuteUnit } from '@/types/vtvl';
import { InfoTip } from '@/components/layout/MilestonesBar';

interface MergeStepSectionProps {
  unit?: HcmuteUnit;
}

export function MergeStepSection({ unit: propUnit }: MergeStepSectionProps) {
  const [activeUnit, setActiveUnit] = useState<HcmuteUnit>(() => propUnit || getActiveUnitDefinition());
  const [unitFile, setUnitFile] = useState<File | null>(null);
  const [formFiles, setFormFiles] = useState<File[]>([]);
  const [mergeDate, setMergeDate] = useState<string>('2026-11-07');
  const [merging, setMerging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [mergeResult, setMergeResult] = useState<MergeFormsResult | null>(null);

  useEffect(() => {
    const resolvedUnit = propUnit || getActiveUnitDefinition();
    setActiveUnit(resolvedUnit);
    const session = getActiveUnitSession();
    setMergeDate(session.customDate || '2026-11-07');
    const cached = getSessionFilesForUnit(resolvedUnit.code);
    if (cached.rootFile) setUnitFile(cached.rootFile);
    if (cached.formFiles.length > 0) setFormFiles(cached.formFiles);
  }, [propUnit]);

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
    setErrorMsg('');
    setMerging(true);
    try {
      let targetRootFile = unitFile;
      if (!targetRootFile) {
        const session = getActiveUnitSession();
        const generated = await generateUnitFiles({
          kind: activeUnit.group,
          unitCode: activeUnit.code,
          unitNameVi: activeUnit.nameVi,
          unitNameEn: activeUnit.nameEn,
          period: HD07_CONSTANTS.STATISTICAL_PERIOD,
          exportDate: mergeDate,
          includeZipPerPosition: false,
          ngachOverrides: session.ngachOverrides,
          customPositionNames: session.customPositionNames,
          customCareerLevels: session.customCareerLevels,
          proposedPositions: session.proposedPositions
        });
        targetRootFile = setSessionRootWorkbook(
          activeUnit.code,
          generated.unitBlob,
          generated.unitFileName
        );
        setUnitFile(targetRootFile);
      }

      if (formFiles.length === 0) {
        setErrorMsg(
          `Đơn vị [${activeUnit.code}] vui lòng tải lên ít nhất 01 phiếu khảo sát hoặc thực hiện đo tại Bước 3 trước khi gộp.`
        );
        return;
      }

      const res = await mergeSurveyFormsIntoUnit(targetRootFile, formFiles, mergeDate);
      setMergeResult(res);
      setSessionMergedWorkbook(res.unitCode, res.mergedBlob, res.mergedFileName);
      recordActivity(
        activeUnit.code,
        activeUnit.nameVi,
        'NAP_PHIEU',
        `Tổng hợp ${res.formsMergedCount} phiếu khảo sát → ${res.mergedFileName}`
      );
    } catch (err) {
      console.error('Error merging survey forms:', err);
      setErrorMsg(
        'Không thể đọc hoặc tích hợp tệp dữ liệu. Vui lòng kiểm tra lại cấu trúc tệp .xlsx theo mẫu chuẩn của hệ thống.'
      );
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
      className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] p-5 space-y-4 shadow-2xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center">
          <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-white font-extrabold text-xs flex items-center justify-center mr-2">
            4
          </span>
          <h2 id="h4s" className="text-base sm:text-lg font-extrabold text-[var(--foreground)]">
            Bước 4: Gộp phiếu khảo sát vào tệp đơn vị [{activeUnit.code}] {activeUnit.nameVi}
          </h2>
          <InfoTip title="Cơ chế tự động nhận diện đơn vị từ Bước 1">
            <p>
              Hệ thống tự động giữ nguyên đơn vị <strong>[{activeUnit.code}] {activeUnit.nameVi}</strong> và tệp gốc <code className="font-mono">v1</code> từ Bước 1–2, đồng thời tự động đính kèm phiếu đo định mức từ Bước 3.
            </p>
            <p>
              Khi gộp, hệ thống tự động nâng phiên bản (<code className="font-mono">v1 → v2</code>) và ghi nhật ký vào biểu <code className="font-mono">15. S_NhatKy</code>.
            </p>
          </InfoTip>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
          <Building2 className="w-3.5 h-3.5" />
          <span>[{activeUnit.code}] {activeUnit.nameVi}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-5 space-y-1.5">
          <label className="block text-xs font-bold text-[var(--foreground)]">
            4.1. Tệp gốc của đơn vị [{activeUnit.code}] (.xlsx)
          </label>
          <input
            id="task-4-root"
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(e) => {
              setUnitFile(e.target.files?.[0] || null);
              setMergeResult(null);
            }}
            className="w-full text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--primary)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white cursor-pointer"
          />
          {unitFile ? (
            <p className="text-[11px] font-mono text-[var(--ok)] font-bold">
              ✓ Đã nạp tự động: {unitFile.name} ({(unitFile.size / 1024).toFixed(1)} KB)
            </p>
          ) : (
            <p className="text-[11px] text-[var(--ink-muted)]">
              Nếu chưa chọn tệp, hệ thống sẽ tự lấy cấu hình Bước 1 của <strong>{activeUnit.code}</strong> để tạo tệp gốc v1.
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
            4.2. Các phiếu khảo sát của [{activeUnit.code}] (.xlsx)
          </label>
          <input
            id="task-4-forms"
            type="file"
            multiple
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleAddForms}
            className="w-full text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--primary)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white cursor-pointer"
          />
          <p className="text-[11px] text-[var(--ink-subtle)]">
            Tự động nhận phiếu từ{' '}
            <Link href="/bam-gio" className="text-[var(--primary)] font-bold underline">
              Bước 3: Đo định mức
            </Link>{' '}
            hoặc chọn thêm tệp từ máy.
          </p>
        </div>
      </div>

      {formFiles.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--foreground)]">
              Danh sách {formFiles.length} phiếu khảo sát của [{activeUnit.code}]:
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
              <span>Xóa danh sách</span>
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
        <div className="rounded-xl border border-[var(--fix)] bg-[var(--fix-soft)] p-3 text-xs text-[var(--fix)] font-semibold">
          {errorMsg}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          id="task-4-merge"
          type="button"
          onClick={handleRunMerge}
          disabled={merging}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[var(--primary)] hover:opacity-95 text-white font-bold text-xs sm:text-sm cursor-pointer disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          <span>{merging ? 'Đang tích hợp số liệu…' : `Tổng hợp phiếu vào tệp ${activeUnit.code} (v1 → v2)`}</span>
        </button>
      </div>

      {mergeResult && (
        <div className="rounded-xl border border-[var(--ok)]/40 bg-[var(--ok-soft)]/50 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[var(--ok)]" />
              <h3 className="text-sm font-bold text-[var(--foreground)]">
                Đã gộp {mergeResult.formsMergedCount} phiếu vào đơn vị {mergeResult.unitCode} (v{mergeResult.oldVersion} → v{mergeResult.newVersion})
              </h3>
            </div>
            <button
              type="button"
              onClick={downloadMerged}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-[var(--ok)] text-white font-semibold text-xs cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span>Tải tệp: {mergeResult.mergedFileName}</span>
            </button>
          </div>

          {mergeResult.conflicts.length > 0 && (
            <div className="rounded-xl border border-[var(--warn)]/40 bg-[var(--warn-soft)] p-3 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[var(--warn)]">
                <AlertTriangle className="w-4 h-4" />
                <span>Phát hiện {mergeResult.conflicts.length} chỉ tiêu chênh lệch giữa các phiếu:</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-[var(--foreground)]">
                {mergeResult.conflicts.map((c, idx) => (
                  <li key={idx}>
                    <strong>{c.taskCode}</strong> ({c.field}): <code className="font-mono">{c.formAName}</code> ({c.valA}) ≠ <code className="font-mono">{c.formBName}</code> ({c.valB}).
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
