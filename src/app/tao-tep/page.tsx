'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { FileSpreadsheet, ArrowRight, ArrowLeft, RotateCcw, BookOpenCheck, Timer, ShieldAlert, Undo2 } from 'lucide-react';
import { WorkflowSidebar, focusTaskTarget } from '@/components/layout/MilestonesBar';
import { HCMUTE_UNITS, UNIT_GROUPS } from '@/configs/hcmute-units';
import { HD07_CONSTANTS } from '@/configs/hcmute-hd07-catalog';
import { buildDefaultProposedPositionsForUnit, buildProposedPositionFromFramework } from '@/configs/hcmute-nd232-catalog';
import { NgachAllocationRow, ProposedVtvlRow, SplitResultSummary, UnitGroupKind, UnitScaleMetrics } from '@/types/vtvl';
import { generateUnitFiles } from '@/services/excel-split/workbook-builder';
import { MergeStepSection } from '@/components/tao-tep/MergeStepSection';
import { SplitResultBanner, SplitFileNamesPreview, RegenFormsFromUnitBox } from '@/components/tao-tep/SplitResultBanner';
import { Hd07OrderGuideCard } from '@/components/tao-tep/Hd07OrderGuideCard';
import { Step1CatalogSelector } from '@/components/tao-tep/Step1CatalogSelector';
import { Step1PositionList } from '@/components/tao-tep/Step1PositionList';
import { Step1ReviewConfirm, validateStep1Data } from '@/components/tao-tep/Step1ReviewConfirm';
import { UnitScaleAndNgachTool } from '@/components/tao-tep/UnitScaleAndNgachTool';
import { StageStepperBar, StickyActionBar, computeStageStatuses, StatusBadge } from '@/components/tao-tep/StageStepperBar';
import { buildDefaultNgachAllocations, buildDefaultScaleMetrics, getActiveUnitSession, recordActivity, saveActiveUnitSession, setSessionRootWorkbook } from '@/services/telemetry/activity-log';
import { syncUnitSplitToSupabase } from '@/services/supabase/vtvl-sync';

const ROLE_PRESETS = ['Trưởng đơn vị (Trưởng khoa / Viện trưởng / Trưởng phòng / Giám đốc)', 'Phó Trưởng đơn vị phụ trách VTVL', 'Thư ký Tổ công tác VTVL đơn vị', 'Trưởng Bộ môn / Trưởng Ngành', 'Chuyên viên / Thư ký khoa tổng hợp hồ sơ'];

export default function TaoTepPage() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [wizardStage, setWizardStage] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [kind, setKind] = useState<UnitGroupKind>('khoa-vien');
  const [selectedUnitCode, setSelectedUnitCode] = useState<string>('FME');
  const [customDate, setCustomDate] = useState<string>('2026-11-07');
  const [actorEmail, setActorEmail] = useState<string>('');
  const [actorTitle, setActorTitle] = useState<string>('');
  const [lastSavedAt, setLastSavedAt] = useState<string>('19:00');
  const [includeZip, setIncludeZip] = useState<boolean>(true);
  const [positions, setPositions] = useState<ProposedVtvlRow[]>(() => buildDefaultProposedPositionsForUnit('Khoa Cơ khí Chế tạo máy', 'khoa-vien'));
  const [scaleMetrics, setScaleMetrics] = useState<UnitScaleMetrics>(() => buildDefaultScaleMetrics('khoa-vien'));
  const [ngachAllocations, setNgachAllocations] = useState<NgachAllocationRow[]>(() => buildDefaultNgachAllocations(buildDefaultProposedPositionsForUnit('Khoa Cơ khí Chế tạo máy', 'khoa-vien')));
  const [undoSnapshot, setUndoSnapshot] = useState<ProposedVtvlRow[] | undefined>(undefined);
  const [confirmAction, setConfirmAction] = useState<{ type: 'reset' | 'delete'; row?: ProposedVtvlRow } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [stale, setStale] = useState<boolean>(false);
  const [result, setResult] = useState<SplitResultSummary | null>(null);

  useEffect(() => {
    const saved = getActiveUnitSession();
    setKind(saved.kind); setSelectedUnitCode(saved.unitCode); setCustomDate(saved.customDate);
    setActorEmail(saved.actorEmail); setActorTitle(saved.actorTitle);
    setWizardStage(saved.wizardStage || 1); setLastSavedAt(saved.lastSavedAt);
    setPositions(saved.proposedPositions); setUndoSnapshot(saved.previousPositionsSnapshot);
    if (saved.scaleMetrics) setScaleMetrics(saved.scaleMetrics);
    if (saved.ngachAllocations) setNgachAllocations(saved.ngachAllocations);
    const sp = new URLSearchParams(window.location.search).get('step');
    setActiveStep(sp === '2' || window.location.hash === '#buoc-3' ? 2 : sp === '4' || window.location.hash === '#buoc-4' ? 4 : 1);
  }, []);
  useEffect(() => {
    const onFocusTask = (e: Event) => {
      const detail = (e as CustomEvent<{ step: number; taskId: string }>).detail;
      if (detail?.step === 1) {
        setActiveStep(1);
        const map: Record<string, 1 | 2 | 3 | 4 | 5> = { 'task-1-unit': 1, 'task-1-actor': 2, 'task-1-add': 3, 'task-1-name': 4, 'task-1-staff': 5 };
        if (map[detail.taskId]) setWizardStage(map[detail.taskId]);
      }
    };
    window.addEventListener('vtvl-focus-task', onFocusTask); return () => window.removeEventListener('vtvl-focus-task', onFocusTask);
  }, []);

  const unitsOfGroup = useMemo(() => HCMUTE_UNITS.filter((u) => u.group === kind), [kind]);
  const currentUnit = useMemo(() => unitsOfGroup.find((u) => u.code === selectedUnitCode) || unitsOfGroup[0] || HCMUTE_UNITS[0], [unitsOfGroup, selectedUnitCode]);
  const persistState = (patch: Parameters<typeof saveActiveUnitSession>[0]) => {
    const next = saveActiveUnitSession(patch); setLastSavedAt(next.lastSavedAt); setUndoSnapshot(next.previousPositionsSnapshot);
  };
  const syncPositions = (next: ProposedVtvlRow[], unitCode = currentUnit.code, nextKind = kind, prevSnap?: ProposedVtvlRow[]) => {
    setPositions(next); persistState({ unitCode, kind: nextKind, proposedPositions: next, ...(prevSnap ? { previousPositionsSnapshot: prevSnap } : {}) });
    if (result) setStale(true);
  };
  const handleGroupChange = (newKind: UnitGroupKind) => {
    setKind(newKind); const first = HCMUTE_UNITS.find((u) => u.group === newKind) || HCMUTE_UNITS[0];
    const nextPos = buildDefaultProposedPositionsForUnit(first.nameVi, newKind);
    const nextScale = buildDefaultScaleMetrics(newKind); const nextNgach = buildDefaultNgachAllocations(nextPos);
    setSelectedUnitCode(first.code); setScaleMetrics(nextScale); setNgachAllocations(nextNgach);
    setPositions(nextPos); persistState({ unitCode: first.code, kind: newKind, proposedPositions: nextPos, scaleMetrics: nextScale, ngachAllocations: nextNgach });
  };
  const handleUnitChange = (newCode: string) => {
    setSelectedUnitCode(newCode); const u = HCMUTE_UNITS.find((x) => x.code === newCode) || HCMUTE_UNITS[0];
    const nextPos = buildDefaultProposedPositionsForUnit(u.nameVi, u.group);
    const nextNgach = buildDefaultNgachAllocations(nextPos);
    setNgachAllocations(nextNgach); syncPositions(nextPos, u.code, u.group); persistState({ ngachAllocations: nextNgach });
  };
  const handleActorChange = (nextEmail: string, nextTitle: string) => { setActorEmail(nextEmail); setActorTitle(nextTitle); persistState({ actorEmail: nextEmail, actorTitle: nextTitle }); };
  const handleStageChange = (st: 1 | 2 | 3 | 4 | 5) => { setWizardStage(st); persistState({ activeStep: 1, wizardStage: st }); };
  const handleAddMultiplePositions = (fwIds: string[]) => syncPositions([...positions, ...fwIds.map((fwId, idx) => buildProposedPositionFromFramework(fwId, currentUnit.nameVi, kind, positions.length + idx + 1))], currentUnit.code, kind, positions);
  const handleUpdateRow = (id: string, patch: Partial<ProposedVtvlRow>) => syncPositions(positions.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const handleDuplicateRow = (row: ProposedVtvlRow) => {
    const seq = positions.length + 1; const baseCode = row.vtvlSuffix.replace(/-\d+$/, '');
    syncPositions([...positions, { ...row, id: `pos-${Date.now()}-${seq}`, vtvlSuffix: `${baseCode}-${String(seq).padStart(2, '0')}`, specificName: `${row.specificName} (${seq})` }], currentUnit.code, kind, positions);
  };
  const handleExecuteConfirmedAction = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'reset') syncPositions(buildDefaultProposedPositionsForUnit(currentUnit.nameVi, kind), currentUnit.code, kind, positions);
    else if (confirmAction.type === 'delete' && confirmAction.row && positions.length > 1) syncPositions(positions.filter((r) => r.id !== confirmAction.row!.id), currentUnit.code, kind, positions);
    setConfirmAction(null);
  };
  const handleUndoSnapshot = () => { if (undoSnapshot && undoSnapshot.length > 0) syncPositions(undoSnapshot, currentUnit.code, kind); };

  const validationErrors = useMemo(() => validateStep1Data(currentUnit, actorEmail, actorTitle, positions), [currentUnit, actorEmail, actorTitle, positions]);
  const stageStatuses = useMemo(() => computeStageStatuses(wizardStage, currentUnit.code, actorEmail, actorTitle, positions, validationErrors), [wizardStage, currentUnit.code, actorEmail, actorTitle, positions, validationErrors]);
  const currentStageMeta = stageStatuses.find((s) => s.num === wizardStage) || stageStatuses[0];

  const handleSaveDraft = () => {
    persistState({ unitCode: currentUnit.code, kind, customDate, actorEmail, actorTitle, activeStep, wizardStage, scaleMetrics, ngachAllocations, proposedPositions: positions });
    recordActivity(currentUnit.code, currentUnit.nameVi, 'LUU_NHAP', `Lưu nháp hồ sơ đơn vị (${positions.length} vị trí việc làm)`);
  };

  const handleCreateFiles = async () => {
    if (validationErrors.length > 0) { setActiveStep(1); handleStageChange(5); return; }
    setLoading(true); setStale(false);
    try {
      persistState({ unitCode: currentUnit.code, kind, customDate, actorEmail: actorEmail.trim(), actorTitle: actorTitle.trim(), activeStep: 2, scaleMetrics, ngachAllocations, proposedPositions: positions });
      const res = await generateUnitFiles({
        kind, unitCode: currentUnit.code, unitNameVi: currentUnit.nameVi, unitNameEn: currentUnit.nameEn,
        period: HD07_CONSTANTS.STATISTICAL_PERIOD, exportDate: customDate, includeZipPerPosition: includeZip,
        actorEmail: actorEmail.trim(), actorTitle: actorTitle.trim(), scaleMetrics, ngachAllocations, ngachOverrides: {}, proposedPositions: positions
      });
      setResult(res); setActiveStep(2);
      setSessionRootWorkbook(res.unitCode, res.unitBlob, res.unitFileName);
      recordActivity(res.unitCode, res.unitNameVi, 'TAO_TEP', `Khởi tạo 4 tệp chuẩn (${positions.length} VTVL · hệ số ×${scaleMetrics.scaleMultiplier}): ${res.unitFileName}`, { actorEmail: actorEmail.trim(), actorTitle: actorTitle.trim() });
      void syncUnitSplitToSupabase(res);
    } finally { setLoading(false); }
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-10 pt-5 pb-28">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-3">
          <WorkflowSidebar activeStep={activeStep} errorStep={validationErrors.length > 0 && activeStep > 1 ? 1 : null} onSelectStep={(s) => { setActiveStep(s); persistState({ activeStep: s }); }} unitCode={currentUnit.code} />
        </div>

        <div className="lg:col-span-9 space-y-5 min-w-0">
          {activeStep === 1 && (
            <section className="rounded-xl border border-[var(--border)] bg-[var(--sheet)] p-4 sm:p-6 space-y-5 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-[var(--primary)] text-white font-bold text-sm flex items-center justify-center shrink-0">1</span>
                  <div>
                    <h1 className="text-base sm:text-xl font-bold text-[var(--foreground)]">Giai đoạn 1/5 — Đề xuất vị trí việc làm</h1>
                    <p className="text-xs text-[var(--ink-muted)]">{currentUnit.nameVi} ({currentUnit.code})</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {undoSnapshot && (
                    <button type="button" onClick={handleUndoSnapshot} className="inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-xl border border-[var(--primary)] bg-[var(--primary)]/10 text-xs sm:text-sm font-bold text-[var(--primary)] cursor-pointer"><Undo2 className="w-4 h-4" /><span>Phục hồi phiên bản trước</span></button>
                  )}
                  <button type="button" onClick={() => setConfirmAction({ type: 'reset' })} className="inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--fix)] text-xs sm:text-sm font-semibold text-[var(--foreground)] cursor-pointer"><RotateCcw className="w-4 h-4 text-[var(--fix)]" /><span>Khôi phục mặc định</span></button>
                </div>
              </div>

              {confirmAction && (
                <div role="alertdialog" aria-labelledby="confirm-title" className="rounded-xl border border-[var(--fix)] bg-[var(--fix-soft)] p-4 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-[var(--fix)] shrink-0 mt-0.5" />
                    <div className="space-y-1 text-sm"><strong id="confirm-title" className="text-[var(--fix)] block text-base">Xác nhận thay đổi dữ liệu vị trí việc làm</strong><p className="text-[var(--foreground)]">{confirmAction.type === 'reset' ? `Đặt lại toàn bộ ${positions.length} vị trí việc làm của [${currentUnit.code}] về mặc định?` : `Xóa vị trí "${confirmAction.row?.specificName}" (${currentUnit.code}-${confirmAction.row?.vtvlSuffix}) khỏi danh sách đề xuất?`}</p></div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2.5">
                    <button type="button" onClick={() => setConfirmAction(null)} className="min-h-[44px] px-4 rounded-xl border border-[var(--border)] bg-[var(--sheet)] text-sm font-semibold text-[var(--foreground)] cursor-pointer">Hủy bỏ</button>
                    <button type="button" onClick={handleExecuteConfirmedAction} className="min-h-[44px] px-4 rounded-xl bg-[var(--fix)] text-white text-sm font-bold cursor-pointer">Xác nhận thực hiện</button>
                  </div>
                </div>
              )}

              <StageStepperBar stages={stageStatuses} currentStage={wizardStage} onSelectStage={handleStageChange} />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-bold text-[var(--foreground)]">{currentStageMeta.fullTitle}</h2>
                <StatusBadge status={currentStageMeta.status} />
              </div>

              {wizardStage === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {UNIT_GROUPS.map((g) => <button key={g.id} type="button" onClick={() => handleGroupChange(g.id)} className={`rounded-xl border px-3 py-2.5 text-center transition-colors cursor-pointer ${kind === g.id ? 'border-[var(--primary)] bg-[var(--primary)]/10 font-bold text-[var(--primary)]' : 'border-[var(--border)] bg-[var(--background)] font-semibold text-[var(--foreground)] hover:border-[var(--primary)]/40'}`}><span className="text-sm block">{g.label}</span></button>)}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                    <div className="sm:col-span-7"><label htmlFor="task-1-unit" className="block text-sm font-semibold text-[var(--foreground)] mb-1">Đơn vị thuộc HCM-UTE ({unitsOfGroup.length} đơn vị)</label><select id="task-1-unit" value={currentUnit.code} onChange={(e) => handleUnitChange(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-base sm:text-sm font-semibold">{unitsOfGroup.map((u) => <option key={u.code} value={u.code}>[{u.code}] {u.nameVi}</option>)}</select></div>
                    <div className="sm:col-span-2"><label htmlFor="unit-code-ro" className="block text-sm font-semibold text-[var(--foreground)] mb-1">Mã đơn vị</label><input id="unit-code-ro" type="text" readOnly value={currentUnit.code} className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted)] px-3.5 py-2.5 text-base sm:text-sm font-mono font-bold text-[var(--primary)]" /></div>
                    <div className="sm:col-span-3"><label htmlFor="unit-date" className="block text-sm font-semibold text-[var(--foreground)] mb-1">Ngày lập hồ sơ</label><input id="unit-date" type="date" value={customDate} onChange={(e) => { setCustomDate(e.target.value); persistState({ customDate: e.target.value }); }} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2 text-base sm:text-sm" /></div>
                  </div>
                  <SplitFileNamesPreview unitCode={currentUnit.code} exportDate={customDate} includeZip={includeZip} />
                </div>
              )}

              {wizardStage === 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="task-1-actor" className="block text-sm font-semibold text-[var(--foreground)] mb-1">Email công vụ người thực hiện <span className="text-[var(--fix)]">*</span></label>
                    <input id="task-1-actor" type="email" required aria-invalid={!actorEmail.includes('@')} aria-describedby="actor-email-err" value={actorEmail} onChange={(e) => handleActorChange(e.target.value, actorTitle)} placeholder={`VD: ${currentUnit.code.toLowerCase()}@hcmute.edu.vn`} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-base sm:text-sm" />
                    {(!actorEmail.trim() || !actorEmail.includes('@')) && <p id="actor-email-err" className="text-xs font-semibold text-[var(--fix)] mt-1">Vui lòng nhập địa chỉ email công vụ hợp lệ (có ký tự @).</p>}
                  </div>
                  <div>
                    <label htmlFor="task-1-role" className="block text-sm font-semibold text-[var(--foreground)] mb-1">Chức vụ / Vai trò người thực hiện <span className="text-[var(--fix)]">*</span></label>
                    <input id="task-1-role" type="text" list="hcmute-actor-roles" required aria-invalid={!actorTitle.trim()} aria-describedby="actor-role-err" value={actorTitle} onChange={(e) => handleActorChange(actorEmail, e.target.value)} placeholder={`VD: ${currentUnit.headTitleVi} / Thư ký Đề án VTVL`} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-base sm:text-sm" />
                    <datalist id="hcmute-actor-roles">{ROLE_PRESETS.map((r) => <option key={r} value={r} />)}</datalist>
                    {!actorTitle.trim() && <p id="actor-role-err" className="text-xs font-semibold text-[var(--fix)] mt-1">Vui lòng nhập hoặc chọn chức vụ của người thực hiện.</p>}
                  </div>
                </div>
              )}

              {wizardStage === 3 && <Step1CatalogSelector unitNameVi={currentUnit.nameVi} kind={kind} existingFrameworkIds={positions.map((p) => p.frameworkId)} onAddMultiplePositions={handleAddMultiplePositions} />}
              {wizardStage === 4 && (
                <div className="space-y-4">
                  <UnitScaleAndNgachTool
                    unitCode={currentUnit.code} kind={kind} scaleMetrics={scaleMetrics} ngachAllocations={ngachAllocations} positions={positions}
                    onChangeScaleMetrics={(next) => { setScaleMetrics(next); persistState({ scaleMetrics: next }); }}
                    onChangeNgachAllocations={(next) => { setNgachAllocations(next); persistState({ ngachAllocations: next }); }}
                    onPushToPositionStaffCounts={(staffByPos) => syncPositions(positions.map((p) => (staffByPos[p.id] !== undefined ? { ...p, staffCount: staffByPos[p.id] } : p)), currentUnit.code, kind, positions)}
                  />
                  <Step1PositionList unitCode={currentUnit.code} positions={positions} onUpdateRow={handleUpdateRow} onDuplicateRow={handleDuplicateRow} onRequestRemoveRow={(row) => setConfirmAction({ type: 'delete', row })} />
                </div>
              )}
              {wizardStage === 5 && <Step1ReviewConfirm unit={currentUnit} actorEmail={actorEmail} actorTitle={actorTitle} customDate={customDate} positions={positions} loading={loading} onJumpToError={(err) => { handleStageChange(err.stage); focusTaskTarget(err.targetId); }} onConfirmExport={() => void handleCreateFiles()} />}
            </section>
          )}

          {activeStep === 2 && (
            <section className="rounded-xl border border-[var(--border)] bg-[var(--sheet)] p-4 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
                <h1 className="text-base sm:text-xl font-bold text-[var(--foreground)]">Giai đoạn 2/5 — Xuất bộ biểu gốc (4 tệp đầu ra)</h1>
                <button type="button" onClick={() => setActiveStep(1)} className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm font-semibold cursor-pointer"><ArrowLeft className="w-4 h-4" /><span>Quay lại Giai đoạn 1</span></button>
              </div>
              <SplitFileNamesPreview unitCode={currentUnit.code} exportDate={customDate} includeZip={includeZip} />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-[var(--border-subtle)]">
                <label className="flex items-center gap-3 text-sm font-semibold text-[var(--foreground)] cursor-pointer">
                  <input id="task-2-zip" type="checkbox" checked={includeZip} onChange={(e) => setIncludeZip(e.target.checked)} className="w-5 h-5 accent-[var(--primary)]" />
                  <span>Kèm gói phiếu riêng từng vị trí (.zip, không có D1 để tránh tính trùng kiêm nhiệm) cho {positions.length} vị trí của <strong>[{currentUnit.code}]</strong></span>
                </label>
                <button id="task-2-export" type="button" disabled={loading} onClick={() => void handleCreateFiles()} className="w-full sm:w-auto justify-center inline-flex items-center gap-2 min-h-[44px] px-5 rounded-xl bg-[var(--primary)] text-white font-bold text-sm cursor-pointer"><FileSpreadsheet className="w-4 h-4" /><span>{result && !stale ? 'Tạo lại 4 tệp' : `Khởi tạo 4 tệp ${currentUnit.code}`}</span></button>
              </div>
              {result ? <SplitResultBanner result={result} onDownload={triggerDownload} /> : <p className="py-4 text-sm text-[var(--ink-muted)]">Bấm <strong>Khởi tạo 4 tệp {currentUnit.code}</strong> để sinh Tệp đơn vị gốc, Tệp dự thảo ô cam gợi ý, Phiếu thu số liệu đầy đủ và Gói .zip từng vị trí.</p>}
              <RegenFormsFromUnitBox exportDate={customDate} includeZip={includeZip} onDownload={triggerDownload} />
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <Link href="/bam-gio" className="btn-touch inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm font-semibold text-[var(--foreground)]"><Timer className="w-4 h-4 text-[var(--primary)]" /><span>Sang Giai đoạn 3: Đo định mức</span></Link>
                <button type="button" onClick={() => setActiveStep(4)} className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl bg-[var(--primary)] text-white text-sm font-bold cursor-pointer"><span>Sang Giai đoạn 4: Gộp phiếu</span><ArrowRight className="w-4 h-4" /></button>
              </div>
            </section>
          )}

          {activeStep === 4 && (
            <div className="space-y-4">
              <MergeStepSection unit={currentUnit} />
              <div className="flex items-center justify-between gap-2">
                <button type="button" onClick={() => setActiveStep(2)} className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl border border-[var(--border)] bg-[var(--sheet)] text-sm font-semibold cursor-pointer"><ArrowLeft className="w-4 h-4" /><span>Quay lại Giai đoạn 2</span></button>
                <Link href="/ra-soat" className="btn-touch inline-flex items-center gap-1.5 min-h-[44px] px-5 rounded-xl bg-[var(--primary)] text-white text-sm font-bold shadow-2xs"><span>Sang Giai đoạn 5: Thẩm định hồ sơ</span><ArrowRight className="w-4 h-4" /></Link>
              </div>
            </div>
          )}

          <details className="rounded-xl border border-[var(--border)] bg-[var(--sheet)] overflow-hidden shadow-2xs">
            <summary className="cursor-pointer px-5 min-h-[52px] text-sm font-bold text-[var(--foreground)] flex items-center justify-between">
              <span className="inline-flex items-center gap-2"><BookOpenCheck className="w-4 h-4 text-[var(--primary)] shrink-0" /><span>Tra cứu Khung 38 vị trí việc làm HCM-UTE &amp; Tải dự thảo Tờ trình [{currentUnit.code}]</span></span>
              <span className="text-xs font-semibold text-[var(--primary)] shrink-0">Mở / Đóng</span>
            </summary>
            <div className="p-4 border-t border-[var(--border-subtle)]"><Hd07OrderGuideCard unit={currentUnit} splitResult={result} /></div>
          </details>
        </div>
      </div>

      <StickyActionBar
        activeStep={activeStep} wizardStage={wizardStage} lastSavedAt={lastSavedAt} unitCode={currentUnit.code} vtvlCount={positions.length} errorCount={validationErrors.length}
        onPrevStage={() => handleStageChange((wizardStage - 1) as 1 | 2 | 3 | 4 | 5)} onSaveNow={handleSaveDraft}
        onInspectErrors={() => { setActiveStep(1); handleStageChange(5); }}
        onContinue={() => { if (activeStep === 1 && wizardStage < 5) handleStageChange((wizardStage + 1) as 1 | 2 | 3 | 4 | 5); else void handleCreateFiles(); }}
      />
    </div>
  );
}
