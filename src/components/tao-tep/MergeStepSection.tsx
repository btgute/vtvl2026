'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Upload, CheckCircle2, AlertTriangle, Download, Trash2, FileCheck2, Building2, ShieldAlert } from 'lucide-react';
import { MergeFormsResult, mergeSurveyFormsIntoUnit } from '@/services/excel-merge/merge-forms';
import { getActiveUnitDefinition, getActiveUnitSession, getRealtimeDateYYYYMMDD, getSessionFilesForUnit, recordActivity, setSessionMergedWorkbook, setSessionRootWorkbook } from '@/services/telemetry/activity-log';
import { generateUnitFiles } from '@/services/excel-split/workbook-builder';
import { buildPersonalTimerWorkbookFile } from '@/services/excel-split/personal-timer-export';
import { TASK_TEMPLATES_BY_GROUP } from '@/configs/hcmute-quotas';
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
  const [mergeDate, setMergeDate] = useState<string>(() => getRealtimeDateYYYYMMDD());
  const [merging, setMerging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [mergeResult, setMergeResult] = useState<MergeFormsResult | null>(null);

  useEffect(() => {
    const resolvedUnit = propUnit || getActiveUnitDefinition();
    setActiveUnit(resolvedUnit);
    const session = getActiveUnitSession();
    const dateStr = session.customDate || getRealtimeDateYYYYMMDD();
    setMergeDate(dateStr);
    const cached = getSessionFilesForUnit(resolvedUnit.code);
    if (cached.rootFile) setUnitFile(cached.rootFile);
    if (cached.formFiles.length > 0) {
      setFormFiles(cached.formFiles);
    } else if (session.timeSessions && session.timeSessions.length > 0) {
      const firstPos = session.proposedPositions[0];
      const suffix = firstPos?.vtvlSuffix || 'DT-GV-02';
      const title = firstPos ? `${firstPos.specificName} (${firstPos.careerLevel})` : 'Giảng viên';
      const tasks = TASK_TEMPLATES_BY_GROUP[resolvedUnit.group].map((t) => ({
        ...t,
        fullVtvlCode: `${resolvedUnit.code}-${suffix}`,
        fullTaskCode: `${resolvedUnit.code}-${t.taskSuffix}`
      }));
      const timerFile = buildPersonalTimerWorkbookFile(resolvedUnit, suffix, title, tasks, session.timeSessions, dateStr);
      setFormFiles([timerFile]);
    }
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

  const handleRemoveSingleForm = (fileName: string) => {
    setFormFiles((prev) => prev.filter((f) => f.name !== fileName));
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
          kind: activeUnit.group, unitCode: activeUnit.code, unitNameVi: activeUnit.nameVi, unitNameEn: activeUnit.nameEn,
          period: HD07_CONSTANTS.STATISTICAL_PERIOD, exportDate: mergeDate, includeZipPerPosition: false,
          actorEmail: session.actorEmail, actorTitle: session.actorTitle,
          scaleMetrics: session.scaleMetrics, ngachAllocations: session.ngachAllocations,
          ngachOverrides: session.ngachOverrides, customPositionNames: session.customPositionNames,
          customCareerLevels: session.customCareerLevels, proposedPositions: session.proposedPositions
        });
        targetRootFile = setSessionRootWorkbook(activeUnit.code, generated.unitBlob, generated.unitFileName);
        setUnitFile(targetRootFile);
      }

      if (formFiles.length === 0) {
        setErrorMsg(`Đơn vị [${activeUnit.code}] vui lòng tải lên ít nhất 01 phiếu khảo sát hoặc thực hiện đo tại Giai đoạn 3 trước khi gộp.`);
        return;
      }

      const res = await mergeSurveyFormsIntoUnit(targetRootFile, formFiles, mergeDate);
      setMergeResult(res);
      setSessionMergedWorkbook(res.unitCode, res.mergedBlob, res.mergedFileName, res.newVersion);
      recordActivity(
        activeUnit.code, activeUnit.nameVi, 'NAP_PHIEU',
        `Tổng hợp ${res.formsMergedCount} phiếu khảo sát (${res.conflicts.length} xung đột) → ${res.mergedFileName}`
      );
    } catch {
      setErrorMsg('Không thể đọc hoặc tích hợp tệp dữ liệu. Vui lòng kiểm tra lại cấu trúc tệp .xlsx theo mẫu chuẩn của hệ thống.');
    } finally {
      setMerging(false);
    }
  };

  const downloadMerged = () => {
    if (!mergeResult) return;
    const url = URL.createObjectURL(mergeResult.mergedBlob);
    const a = document.createElement('a');
    a.href = url; a.download = mergeResult.mergedFileName; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <section id="buoc-4" aria-labelledby="h4s" className="surface-canvas rounded-2xl p-5 sm:p-7 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center">
          <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-white font-extrabold text-xs flex items-center justify-center mr-2">4</span>
          <h2 id="h4s" className="text-base sm:text-lg font-extrabold text-[var(--foreground)]">
            Giai đoạn 4/5 — Gộp phiếu khảo sát vào tệp đơn vị [{activeUnit.code}] {activeUnit.nameVi}
          </h2>
          <InfoTip title="Quy tắc gộp phiếu & kiểm soát xung đột">
            <p>Phiếu đầy đủ và phiếu từng vị trí được gộp theo mã công việc; hai phiếu ghi khác nhau cho cùng một việc sẽ được liệt kê chi tiết để đầu mối đối chiếu và sửa, không tự chọn ngẫu nhiên.</p>
            <p>Phiếu của đơn vị khác bị từ chối tự động. Dòng giữ nguyên phút gợi ý được ghi là mức tham khảo, chưa đo thực tế.</p>
          </InfoTip>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
          <Building2 className="w-3.5 h-3.5" />
          <span>[{activeUnit.code}] {activeUnit.nameVi}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-5 space-y-1.5">
          <label htmlFor="task-4-root" className="block text-xs font-bold text-[var(--foreground)]">4.1. Tệp gốc của đơn vị [{activeUnit.code}] (.xlsx)</label>
          <input id="task-4-root" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(e) => { setUnitFile(e.target.files?.[0] || null); setMergeResult(null); }} className="w-full text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--primary)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white cursor-pointer" />
          {unitFile ? (
            <p className="text-[11px] font-mono text-[var(--ok)] font-bold">✓ Đã nạp tự động: {unitFile.name} ({(unitFile.size / 1024).toFixed(1)} KB)</p>
          ) : (
            <p className="text-[11px] text-[var(--ink-muted)]">Nếu chưa chọn tệp, hệ thống tự lấy cấu hình Giai đoạn 1 của <strong>{activeUnit.code}</strong> để tạo tệp gốc v1.</p>
          )}
        </div>

        <div className="md:col-span-3 space-y-1.5">
          <label htmlFor="merge-date" className="block text-xs font-bold text-[var(--foreground)]">Ngày tổng hợp hồ sơ</label>
          <input id="merge-date" type="date" value={mergeDate} onChange={(e) => setMergeDate(e.target.value)} className="w-full text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2" />
        </div>

        <div className="md:col-span-4 space-y-1.5">
          <label htmlFor="task-4-forms" className="block text-xs font-bold text-[var(--foreground)]">4.2. Các phiếu khảo sát đã điền (.xlsx, chọn nhiều tệp)</label>
          <input id="task-4-forms" type="file" multiple accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleAddForms} className="w-full text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--primary)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white cursor-pointer" />
          <p className="text-[11px] text-[var(--ink-subtle)]">Tự động nhận phiếu từ <Link href="/bam-gio" className="text-[var(--primary)] font-bold underline">Giai đoạn 3: Đo định mức</Link> hoặc chọn nhiều tệp từ máy.</p>
        </div>
      </div>

      {formFiles.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--foreground)]">Danh sách {formFiles.length} phiếu đã chọn của [{activeUnit.code}]:</span>
            <button type="button" onClick={() => { setFormFiles([]); setMergeResult(null); }} className="inline-flex items-center gap-1 text-xs font-bold text-[var(--fix)] hover:underline cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" /><span>Bỏ hết phiếu</span>
            </button>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {formFiles.map((f) => (
              <li key={f.name} className="flex items-center justify-between gap-2 text-xs font-mono bg-[var(--sheet)] border border-[var(--border)] px-3 py-1.5 rounded-lg">
                <span className="inline-flex items-center gap-1.5 truncate"><FileCheck2 className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" /><span className="truncate">{f.name}</span></span>
                <span className="inline-flex items-center gap-2 shrink-0">
                  <small className="text-[var(--ink-muted)]">{(f.size / 1024).toFixed(1)} KB</small>
                  <button type="button" onClick={() => handleRemoveSingleForm(f.name)} aria-label={`Bỏ phiếu ${f.name}`} className="text-[var(--fix)] font-bold px-1.5 cursor-pointer">×</button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {errorMsg && <div className="rounded-xl border border-[var(--fix)] bg-[var(--fix-soft)] p-3 text-xs text-[var(--fix)] font-semibold">{errorMsg}</div>}

      <div className="flex flex-wrap items-center gap-3">
        <button id="task-4-merge" type="button" onClick={() => void handleRunMerge()} disabled={merging} className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-xl bg-[var(--primary)] text-white font-bold text-xs sm:text-sm cursor-pointer disabled:opacity-50">
          <Upload className="w-4 h-4" />
          <span>{merging ? 'Đang đọc và đối chiếu các phiếu…' : `Tổng hợp phiếu vào tệp ${activeUnit.code} (v1 → v2)`}</span>
        </button>
      </div>

      {mergeResult && (
        <div className="rounded-xl border border-[var(--ok)]/40 bg-[var(--ok-soft)]/50 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[var(--ok)]" />
              <h3 className="text-sm font-bold text-[var(--foreground)]">
                Đã gộp {mergeResult.formsMergedCount} phiếu hợp lệ vào đơn vị {mergeResult.unitCode} (v{mergeResult.oldVersion} → v{mergeResult.newVersion})
              </h3>
            </div>
            <button type="button" onClick={downloadMerged} className="inline-flex items-center gap-2 min-h-[40px] px-4 rounded-xl bg-[var(--ok)] text-white font-bold text-xs cursor-pointer shadow-2xs">
              <Download className="w-4 h-4" /><span>Tải tệp: {mergeResult.mergedFileName}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="rounded-xl bg-[var(--sheet)] border border-[var(--border)] p-2.5"><div className="text-xs text-[var(--ink-muted)]">Phiếu hợp lệ đã gộp</div><div className="text-lg font-extrabold text-[var(--primary)] tabular-nums">{mergeResult.formsMergedCount}</div></div>
            <div className="rounded-xl bg-[var(--sheet)] border border-[var(--border)] p-2.5"><div className="text-xs text-[var(--ink-muted)]">Công việc đã đo thực tế</div><div className="text-lg font-extrabold text-[var(--ok)] tabular-nums">{mergeResult.measuredTasksCount}</div></div>
            <div className="rounded-xl bg-[var(--sheet)] border border-[var(--border)] p-2.5"><div className="text-xs text-[var(--ink-muted)]">Còn giữ nguyên ô cam gợi ý</div><div className="text-lg font-extrabold text-[var(--warn)] tabular-nums">{mergeResult.keptSuggestionCount}</div></div>
            <div className={`rounded-xl border p-2.5 ${mergeResult.conflicts.length > 0 ? 'bg-[var(--fix-soft)] border-[var(--fix)]' : 'bg-[var(--sheet)] border-[var(--border)]'}`}><div className="text-xs text-[var(--ink-muted)]">Xung đột giữa các phiếu</div><div className={`text-lg font-extrabold tabular-nums ${mergeResult.conflicts.length > 0 ? 'text-[var(--fix)]' : 'text-[var(--foreground)]'}`}>{mergeResult.conflicts.length}</div></div>
          </div>

          {mergeResult.rejectedForms.length > 0 && (
            <div className="rounded-xl border border-[var(--fix)] bg-[var(--fix-soft)] p-3 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-extrabold text-[var(--fix)]"><ShieldAlert className="w-4 h-4" /><span>Đã từ chối {mergeResult.rejectedForms.length} phiếu không thuộc đơn vị [{mergeResult.unitCode}]:</span></div>
              <ul className="list-disc pl-5 space-y-0.5 text-[var(--foreground)]">{mergeResult.rejectedForms.map((rf, idx) => <li key={idx}><code className="font-mono font-bold">{rf.fileName}</code>: {rf.reason}</li>)}</ul>
            </div>
          )}

          {mergeResult.conflicts.length > 0 && (
            <div className="rounded-xl border border-[var(--fix)] bg-[var(--fix-soft)] p-3.5 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-extrabold text-[var(--fix)]"><AlertTriangle className="w-4 h-4 shrink-0" /><span>Phát hiện {mergeResult.conflicts.length} chỉ tiêu xung đột giữa các phiếu cho cùng một mã công việc (vui lòng thống nhất giữa các cá nhân rồi nạp lại):</span></div>
              <ul className="space-y-2">
                {mergeResult.conflicts.map((c, idx) => (
                  <li key={idx} className="rounded-lg bg-[var(--sheet)] border border-[var(--fix)]/30 p-2.5 space-y-1">
                    <div className="font-bold text-[var(--foreground)]"><span className="font-mono text-[var(--primary)]">{c.taskCode}</span> — {c.taskName} · Chỉ tiêu lệch: <strong className="text-[var(--fix)]">{c.field}</strong></div>
                    <ul className="pl-4 list-disc text-[var(--ink-muted)] space-y-0.5">{c.allValues.map((av, vIdx) => <li key={vIdx}>Tệp <code className="font-mono font-semibold text-[var(--foreground)]">{av.fileName}</code> ghi giá trị: <strong className="text-[var(--fix)]">{av.value}</strong></li>)}</ul>
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
