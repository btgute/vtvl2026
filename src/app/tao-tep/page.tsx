'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
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
import { Step1ReviewConfirm, validateStep1Data, validateStageData } from '@/components/tao-tep/Step1ReviewConfirm';
import { UnitScaleAndNgachTool } from '@/components/tao-tep/UnitScaleAndNgachTool';
import { StageStepperBar, StickyActionBar, computeStageStatuses, StatusBadge } from '@/components/tao-tep/StageStepperBar';
import { FormField, FormFieldState, SaveLifecycleState, SegmentedControl, ToastNotice, ToastRegion } from '@/components/ui/FormFeedbackPrimitives';
import { TextInput, DateInput, Select } from '@/components/ui/FormInputs';
import { buildDefaultNgachAllocations, buildDefaultScaleMetrics, formatCurrentHHMM, getActiveUnitSession, getRealtimeDateYYYYMMDD, recordActivity, resetActiveUnitToDefault, saveActiveUnitSession, setSessionRootWorkbook } from '@/services/telemetry/activity-log';
import { syncUnitSplitToSupabase } from '@/services/supabase/vtvl-sync';

const ROLE_PRESETS = ['Trưởng đơn vị (Trưởng khoa / Viện trưởng / Trưởng phòng / Giám đốc)', 'Phó Trưởng đơn vị phụ trách VTVL', 'Thư ký Tổ công tác VTVL đơn vị', 'Trưởng Bộ môn / Trưởng Ngành', 'Chuyên viên / Thư ký khoa tổng hợp hồ sơ'];

export default function TaoTepPage() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [wizardStage, setWizardStage] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [visitedStages, setVisitedStages] = useState<number[]>([1]);
  const [kind, setKind] = useState<UnitGroupKind>('khoa-vien');
  const [selectedUnitCode, setSelectedUnitCode] = useState<string>('FME');
  const [customDate, setCustomDate] = useState<string>(() => getRealtimeDateYYYYMMDD());
  const [actorEmail, setActorEmail] = useState<string>('');
  const [actorTitle, setActorTitle] = useState<string>('');
  const [lastSavedAt, setLastSavedAt] = useState<string>(() => formatCurrentHHMM());
  const [saveLifecycle, setSaveLifecycle] = useState<SaveLifecycleState>('idle');
  const [fieldStates, setFieldStates] = useState<Record<string, FormFieldState>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [forceShowStageErrors, setForceShowStageErrors] = useState<Record<number, boolean>>({});
  const [isCheckingContinue, setIsCheckingContinue] = useState<boolean>(false);
  const [continueCheckedOk, setContinueCheckedOk] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastNotice[]>([]);
  const [includeZip, setIncludeZip] = useState<boolean>(true);
  const [positions, setPositions] = useState<ProposedVtvlRow[]>(() => buildDefaultProposedPositionsForUnit('Khoa Cơ khí Chế tạo máy', 'khoa-vien'));
  const [scaleMetrics, setScaleMetrics] = useState<UnitScaleMetrics>(() => buildDefaultScaleMetrics('khoa-vien'));
  const [ngachAllocations, setNgachAllocations] = useState<NgachAllocationRow[]>(() => buildDefaultNgachAllocations(buildDefaultProposedPositionsForUnit('Khoa Cơ khí Chế tạo máy', 'khoa-vien')));
  const [undoSnapshot, setUndoSnapshot] = useState<ProposedVtvlRow[] | undefined>(undefined);
  const [confirmAction, setConfirmAction] = useState<{ type: 'reset' | 'delete'; row?: ProposedVtvlRow } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [stale, setStale] = useState<boolean>(false);
  const [result, setResult] = useState<SplitResultSummary | null>(null);
  const stageHeadingRef = useRef<HTMLHeadingElement>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pushToast = (kindType: ToastNotice['kind'], message: string, onRetry?: () => void) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev.filter((t) => t.message !== message), { id, kind: kindType, message, onRetry }]);
    if (kindType !== 'error') setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  };
  const applySessionToState = (saved: ReturnType<typeof getActiveUnitSession>) => {
    setKind(saved.kind); setSelectedUnitCode(saved.unitCode); setCustomDate(saved.customDate); setActorEmail(saved.actorEmail); setActorTitle(saved.actorTitle);
    const st = saved.wizardStage || 1; setWizardStage(st); setVisitedStages((prev) => Array.from(new Set([...prev, st])));
    setLastSavedAt(saved.lastSavedAt); setPositions(saved.proposedPositions); setUndoSnapshot(saved.previousPositionsSnapshot);
    if (saved.scaleMetrics) setScaleMetrics(saved.scaleMetrics); if (saved.ngachAllocations) setNgachAllocations(saved.ngachAllocations);
  };
  useEffect(() => {
    applySessionToState(getActiveUnitSession());
    const sp = new URLSearchParams(window.location.search).get('step');
    setActiveStep(sp === '2' || window.location.hash === '#buoc-3' ? 2 : sp === '4' || window.location.hash === '#buoc-4' ? 4 : 1);
    const onStorage = (e: StorageEvent) => { if (e.key === 'hcmute_vtvl_active_unit_session_v2') applySessionToState(getActiveUnitSession()); };
    window.addEventListener('storage', onStorage);
    const bc = 'BroadcastChannel' in window ? new BroadcastChannel('hcmute_vtvl_realtime') : null;
    if (bc) bc.onmessage = () => applySessionToState(getActiveUnitSession());
    return () => { window.removeEventListener('storage', onStorage); bc?.close(); };
  }, []);
  useEffect(() => {
    const onFocusTask = (e: Event) => {
      const detail = (e as CustomEvent<{ step: number; taskId: string }>).detail;
      if (detail?.step === 1) {
        setActiveStep(1); const map: Record<string, 1 | 2 | 3 | 4 | 5> = { 'task-1-unit': 1, 'task-1-actor': 2, 'task-1-add': 3, 'task-1-name': 4, 'task-1-staff': 5 };
        if (map[detail.taskId]) handleStageChange(map[detail.taskId], false);
      }
    };
    window.addEventListener('vtvl-focus-task', onFocusTask); return () => window.removeEventListener('vtvl-focus-task', onFocusTask);
  }, []);

  const unitsOfGroup = useMemo(() => HCMUTE_UNITS.filter((u) => u.group === kind), [kind]);
  const currentUnit = useMemo(() => unitsOfGroup.find((u) => u.code === selectedUnitCode) || unitsOfGroup[0] || HCMUTE_UNITS[0], [unitsOfGroup, selectedUnitCode]);

  const persistState = (patch: Parameters<typeof saveActiveUnitSession>[0], fieldKey?: string) => {
    try {
      setSaveLifecycle('saving'); if (fieldKey) setFieldStates((p) => ({ ...p, [fieldKey]: 'saving' }));
      const next = saveActiveUnitSession(patch); setLastSavedAt(next.lastSavedAt); setUndoSnapshot(next.previousPositionsSnapshot); setSaveLifecycle('saved');
      if (fieldKey) setFieldStates((p) => ({ ...p, [fieldKey]: 'saved' }));
      setTimeout(() => { setSaveLifecycle((cur) => (cur === 'saved' ? 'idle' : cur)); if (fieldKey) setFieldStates((p) => ({ ...p, [fieldKey]: p[fieldKey] === 'saved' ? 'default' : p[fieldKey] })); }, 1500);
    } catch { setSaveLifecycle('error'); if (fieldKey) setFieldStates((p) => ({ ...p, [fieldKey]: 'error' })); pushToast('error', 'Chưa thể lưu thay đổi vào bộ nhớ trình duyệt.', () => persistState(patch, fieldKey)); }
  };
  const scheduleAutosave = (patch: Parameters<typeof saveActiveUnitSession>[0], fieldKey: string) => {
    setSaveLifecycle('dirty'); setFieldStates((p) => ({ ...p, [fieldKey]: 'dirty' }));
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => persistState(patch, fieldKey), 380);
  };
  const syncPositions = (next: ProposedVtvlRow[], unitCode = currentUnit.code, nextKind = kind, prevSnap?: ProposedVtvlRow[]) => {
    setPositions(next); persistState({ unitCode, kind: nextKind, proposedPositions: next, ...(prevSnap ? { previousPositionsSnapshot: prevSnap } : {}) }); if (result) setStale(true);
  };
  const handleGroupChange = (newKind: UnitGroupKind) => {
    setKind(newKind); const first = HCMUTE_UNITS.find((u) => u.group === newKind) || HCMUTE_UNITS[0];
    const nextPos = buildDefaultProposedPositionsForUnit(first.nameVi, newKind); const nextScale = buildDefaultScaleMetrics(newKind); const nextNgach = buildDefaultNgachAllocations(nextPos);
    setSelectedUnitCode(first.code); setScaleMetrics(nextScale); setNgachAllocations(nextNgach); setPositions(nextPos);
    persistState({ unitCode: first.code, kind: newKind, proposedPositions: nextPos, scaleMetrics: nextScale, ngachAllocations: nextNgach }, 'unit');
  };
  const handleUnitChange = (newCode: string) => {
    setSelectedUnitCode(newCode); const u = HCMUTE_UNITS.find((x) => x.code === newCode) || HCMUTE_UNITS[0];
    const nextPos = buildDefaultProposedPositionsForUnit(u.nameVi, u.group); const nextNgach = buildDefaultNgachAllocations(nextPos);
    setNgachAllocations(nextNgach); syncPositions(nextPos, u.code, u.group); persistState({ ngachAllocations: nextNgach }, 'unit');
  };
  const handleStageChange = (st: 1 | 2 | 3 | 4 | 5, focusHeading = true) => {
    setWizardStage(st); setVisitedStages((prev) => Array.from(new Set([...prev, st]))); persistState({ activeStep: 1, wizardStage: st });
    if (focusHeading && typeof window !== 'undefined') { window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => stageHeadingRef.current?.focus(), 80); }
  };
  const handleAddMultiplePositions = (fwIds: string[]) => {
    syncPositions([...positions, ...fwIds.map((fwId, idx) => buildProposedPositionFromFramework(fwId, currentUnit.nameVi, kind, positions.length + idx + 1))], currentUnit.code, kind, positions);
    pushToast('success', `Đã thêm ${fwIds.length} vị trí việc làm vào [${currentUnit.code}].`);
  };
  const handleUpdateRow = (id: string, patch: Partial<ProposedVtvlRow>) => syncPositions(positions.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const handleDuplicateRow = (row: ProposedVtvlRow) => {
    const seq = positions.length + 1; const baseCode = row.vtvlSuffix.replace(/-\d+$/, '');
    syncPositions([...positions, { ...row, id: `pos-${Date.now()}-${seq}`, vtvlSuffix: `${baseCode}-${String(seq).padStart(2, '0')}`, specificName: `${row.specificName} (${seq})` }], currentUnit.code, kind, positions);
    pushToast('success', `Đã sao chép vị trí "${row.specificName}".`);
  };
  const handleExecuteConfirmedAction = (fullSessionReset = false) => {
    if (!confirmAction) return;
    if (confirmAction.type === 'reset') {
      const fresh = resetActiveUnitToDefault(currentUnit.code, fullSessionReset);
      applySessionToState(fresh); setActiveStep(1); setResult(null); setStale(false); setTouchedFields({}); setForceShowStageErrors({});
      recordActivity(currentUnit.code, currentUnit.nameVi, 'CHON_DON_VI', fullSessionReset ? `Đặt lại toàn bộ phiên làm việc của [${currentUnit.code}] về ban đầu` : `Khôi phục danh sách ${fresh.proposedPositions.length} VTVL mặc định của [${currentUnit.code}]`);
      pushToast('success', fullSessionReset ? `Đã đặt lại toàn bộ phiên của [${currentUnit.code}] về Chặng 1/5 lúc ${fresh.lastSavedAt}.` : `Đã khôi phục ${fresh.proposedPositions.length} VTVL mặc định của [${currentUnit.code}] lúc ${fresh.lastSavedAt}.`);
    } else if (confirmAction.type === 'delete' && confirmAction.row && positions.length > 1) {
      syncPositions(positions.filter((r) => r.id !== confirmAction.row!.id), currentUnit.code, kind, positions); pushToast('info', `Đã xóa vị trí "${confirmAction.row.specificName}".`);
    }
    setConfirmAction(null);
  };
  const handleUndoSnapshot = () => { if (undoSnapshot && undoSnapshot.length > 0) { syncPositions(undoSnapshot, currentUnit.code, kind); pushToast('success', 'Đã phục hồi danh sách vị trí việc làm phiên bản trước.'); } };
  const validationErrors = useMemo(() => validateStep1Data(currentUnit, actorEmail, actorTitle, positions), [currentUnit, actorEmail, actorTitle, positions]);
  const stageStatuses = useMemo(() => computeStageStatuses(wizardStage, currentUnit.code, actorEmail, actorTitle, positions, validationErrors, visitedStages), [wizardStage, currentUnit.code, actorEmail, actorTitle, positions, validationErrors, visitedStages]);
  const currentStageMeta = stageStatuses.find((s) => s.num === wizardStage) || stageStatuses[0];
  const emailErrMsg = (touchedFields.actorEmail || forceShowStageErrors[2]) && (!actorEmail.trim() || !actorEmail.includes('@') || !actorEmail.includes('.')) ? 'Vui lòng nhập địa chỉ email công vụ HCM-UTE (ví dụ: ten@hcmute.edu.vn).' : undefined;
  const roleErrMsg = (touchedFields.actorTitle || forceShowStageErrors[2]) && !actorTitle.trim() ? 'Vui lòng nhập hoặc chọn chức vụ, vai trò của người lập hồ sơ tại đơn vị.' : undefined;
  const handleSaveDraft = () => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    persistState({ unitCode: currentUnit.code, kind, customDate, actorEmail, actorTitle, activeStep, wizardStage, scaleMetrics, ngachAllocations, proposedPositions: positions });
    recordActivity(currentUnit.code, currentUnit.nameVi, 'LUU_NHAP', `Lưu nháp hồ sơ đơn vị (${positions.length} vị trí việc làm)`); pushToast('success', `Đã lưu hồ sơ đơn vị [${currentUnit.code}] lúc ${formatCurrentHHMM()}.`);
  };
  const handleContinueAction = () => {
    if (isCheckingContinue || loading) return;
    if (activeStep !== 1 || wizardStage === 5) { void handleCreateFiles(); return; }
    setIsCheckingContinue(true); const stageErrs = validateStageData(wizardStage, currentUnit, actorEmail, actorTitle, positions);
    setTimeout(() => {
      setIsCheckingContinue(false);
      if (stageErrs.length > 0) {
        setForceShowStageErrors((p) => ({ ...p, [wizardStage]: true })); if (wizardStage === 2) setTouchedFields((p) => ({ ...p, actorEmail: true, actorTitle: true }));
        focusTaskTarget(stageErrs[0].targetId); return;
      }
      setContinueCheckedOk(true); persistState({ unitCode: currentUnit.code, kind, customDate, actorEmail: actorEmail.trim(), actorTitle: actorTitle.trim(), activeStep: 1, wizardStage: (wizardStage + 1) as 1 | 2 | 3 | 4 | 5, proposedPositions: positions });
      setTimeout(() => { setContinueCheckedOk(false); handleStageChange((wizardStage + 1) as 1 | 2 | 3 | 4 | 5, true); }, 150);
    }, 160);
  };
  const handleCreateFiles = async () => {
    if (validationErrors.length > 0) {
      setActiveStep(1); setForceShowStageErrors({ 1: true, 2: true, 3: true, 4: true, 5: true }); setTouchedFields({ actorEmail: true, actorTitle: true });
      handleStageChange(5); focusTaskTarget(validationErrors[0].targetId); return;
    }
    setLoading(true); setStale(false);
    try {
      persistState({ unitCode: currentUnit.code, kind, customDate, actorEmail: actorEmail.trim(), actorTitle: actorTitle.trim(), activeStep: 2, scaleMetrics, ngachAllocations, proposedPositions: positions });
      const res = await generateUnitFiles({ kind, unitCode: currentUnit.code, unitNameVi: currentUnit.nameVi, unitNameEn: currentUnit.nameEn, period: HD07_CONSTANTS.STATISTICAL_PERIOD, exportDate: customDate, includeZipPerPosition: includeZip, actorEmail: actorEmail.trim(), actorTitle: actorTitle.trim(), scaleMetrics, ngachAllocations, ngachOverrides: {}, proposedPositions: positions });
      setResult(res); setActiveStep(2); setSessionRootWorkbook(res.unitCode, res.unitBlob, res.unitFileName);
      recordActivity(res.unitCode, res.unitNameVi, 'TAO_TEP', `Khởi tạo 4 tệp chuẩn (${positions.length} VTVL · hệ số ×${scaleMetrics.scaleMultiplier}): ${res.unitFileName}`, { actorEmail: actorEmail.trim(), actorTitle: actorTitle.trim() });
      pushToast('success', `Đã khởi tạo thành công 4 tệp đầu ra cho [${res.unitCode}].`); void syncUnitSplitToSupabase(res, { scaleMetrics, ngachAllocations, proposedPositions: positions });
    } catch { pushToast('error', 'Không thể khởi tạo bộ biểu. Vui lòng thử lại.', () => void handleCreateFiles()); } finally { setLoading(false); }
  };
  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); pushToast('success', `Đang tải xuống: ${filename}`);
  };

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-10 pt-5 page-with-sticky-bar">
      <ToastRegion toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        <WorkflowSidebar activeStep={activeStep} errorStep={validationErrors.length > 0 && activeStep > 1 ? 1 : null} onSelectStep={(s) => { setActiveStep(s); persistState({ activeStep: s }); }} unitCode={currentUnit.code} />

        <div className="flex-1 w-full space-y-6 min-w-0">
          {activeStep === 1 && (
            <section className="surface-canvas rounded-2xl p-5 sm:p-7 space-y-6 sm:space-y-7">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-[var(--primary)] text-white font-extrabold text-xs flex items-center justify-center shrink-0">1</span>
                  <div><h1 className="text-base sm:text-xl font-extrabold text-[var(--foreground)]">Giai đoạn 1/5 — Đề xuất vị trí việc làm</h1><p className="text-xs text-[var(--ink-muted)]">{currentUnit.nameVi} ({currentUnit.code})</p></div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {undoSnapshot && <button type="button" onClick={handleUndoSnapshot} className="inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-xl border border-[var(--primary)]/40 bg-[var(--surface-tint)] text-xs sm:text-sm font-bold text-[var(--primary)] cursor-pointer"><Undo2 className="w-4 h-4" /><span>Phục hồi phiên bản trước</span></button>}
                  <button type="button" onClick={() => setConfirmAction({ type: 'reset' })} className="inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-xl border border-[var(--border)] bg-[var(--sheet)] hover:border-[var(--fix)] text-xs sm:text-sm font-semibold text-[var(--foreground)] cursor-pointer"><RotateCcw className="w-4 h-4 text-[var(--fix)]" /><span>Khôi phục mặc định</span></button>
                </div>
              </div>
              {confirmAction && (
                <div role="alertdialog" aria-labelledby="confirm-title" className="rounded-xl border border-[var(--fix)] bg-[var(--fix-soft)] p-4 space-y-3">
                  <div className="flex items-start gap-2.5"><ShieldAlert className="w-5 h-5 text-[var(--fix)] shrink-0 mt-0.5" /><div className="space-y-1 text-sm"><strong id="confirm-title" className="text-[var(--fix)] block text-base">Xác nhận khôi phục dữ liệu mặc định</strong><p className="text-[var(--foreground)]">{confirmAction.type === 'reset' ? `Chọn phạm vi khôi phục cho [${currentUnit.code}] ${currentUnit.nameVi}: khôi phục danh sách VTVL mặc định (chuyển về Chặng 4 để xem ngay) hoặc đặt lại toàn bộ phiên về Chặng 1/5.` : `Xóa vị trí "${confirmAction.row?.specificName}" (${currentUnit.code}-${confirmAction.row?.vtvlSuffix}) khỏi danh sách đề xuất?`}</p></div></div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button type="button" onClick={() => setConfirmAction(null)} className="min-h-[44px] px-4 rounded-xl border border-[var(--border)] bg-[var(--sheet)] text-sm font-semibold text-[var(--foreground)] cursor-pointer">Hủy bỏ</button>
                    {confirmAction.type === 'reset' ? (<><button type="button" onClick={() => handleExecuteConfirmedAction(false)} className="min-h-[44px] px-4 rounded-xl border border-[var(--fix)] bg-[var(--sheet)] text-[var(--fix)] text-sm font-bold cursor-pointer">Khôi phục VTVL mặc định (Xem tại Chặng 4)</button><button type="button" onClick={() => handleExecuteConfirmedAction(true)} className="min-h-[44px] px-4 rounded-xl bg-[var(--fix)] text-white text-sm font-bold cursor-pointer">Đặt lại toàn bộ về Chặng 1/5</button></>) : <button type="button" onClick={() => handleExecuteConfirmedAction(false)} className="min-h-[44px] px-4 rounded-xl bg-[var(--fix)] text-white text-sm font-bold cursor-pointer">Xác nhận xóa vị trí</button>}
                  </div>
                </div>
              )}
              <StageStepperBar stages={stageStatuses} currentStage={wizardStage} onSelectStage={(s) => handleStageChange(s, true)} />
              <div className="flex flex-wrap items-center justify-between gap-2"><h2 id="stage-heading-title" ref={stageHeadingRef} tabIndex={-1} className="text-base font-bold text-[var(--foreground)] focus:outline-none">{currentStageMeta.fullTitle}</h2><StatusBadge status={currentStageMeta.status} /></div>

              {wizardStage === 1 && (
                <div className="space-y-4">
                  <SegmentedControl ariaLabel="Chọn khối đơn vị thuộc HCM-UTE" options={UNIT_GROUPS} value={kind} onChange={handleGroupChange} />
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                    <div className="sm:col-span-7"><FormField htmlFor="task-1-unit" label={`Đơn vị thuộc HCM-UTE (${unitsOfGroup.length} đơn vị)`} required state={fieldStates.unit || 'default'}><Select id="task-1-unit" value={currentUnit.code} onChange={(e) => handleUnitChange(e.target.value)}>{unitsOfGroup.map((u) => <option key={u.code} value={u.code}>[{u.code}] {u.nameVi}</option>)}</Select></FormField></div>
                    <div className="sm:col-span-2"><FormField htmlFor="unit-code-ro" label="Mã đơn vị" state="readOnly" hint="Tự động theo đơn vị"><TextInput id="unit-code-ro" readOnly state="readOnly" value={currentUnit.code} /></FormField></div>
                    <div className="sm:col-span-3"><FormField htmlFor="unit-date" label="Ngày lập hồ sơ" state={fieldStates.customDate || 'default'}><DateInput id="unit-date" value={customDate} onChange={(e) => { setCustomDate(e.target.value); scheduleAutosave({ customDate: e.target.value }, 'customDate'); }} onBlur={() => persistState({ customDate }, 'customDate')} /></FormField></div>
                  </div>
                  <SplitFileNamesPreview unitCode={currentUnit.code} exportDate={customDate} includeZip={includeZip} onCopied={(fn) => pushToast('success', `Đã sao chép tên tệp: ${fn}`)} />
                </div>
              )}

              {wizardStage === 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField htmlFor="task-1-actor" label="Email công vụ người thực hiện" required state={fieldStates.actorEmail || 'default'} errorMessage={emailErrMsg} errorId="actor-email-err" hint="Sử dụng địa chỉ email công vụ @hcmute.edu.vn để ghi nhận lịch sử thẩm định.">
                    <TextInput id="task-1-actor" type="email" required errorMessage={emailErrMsg} errorId="actor-email-err" value={actorEmail} onFocusChange={(f) => setFieldStates((p) => ({ ...p, actorEmail: f ? 'focused' : p.actorEmail === 'focused' ? 'default' : p.actorEmail }))} onChange={(e) => { setActorEmail(e.target.value); scheduleAutosave({ actorEmail: e.target.value, actorTitle }, 'actorEmail'); }} onBlur={() => { setTouchedFields((p) => ({ ...p, actorEmail: true })); persistState({ actorEmail, actorTitle }, 'actorEmail'); }} placeholder={`VD: ${currentUnit.code.toLowerCase()}@hcmute.edu.vn`} />
                  </FormField>
                  <FormField htmlFor="task-1-role" label="Chức vụ / Vai trò người thực hiện" required state={fieldStates.actorTitle || 'default'} errorMessage={roleErrMsg} errorId="actor-role-err" hint="Chọn nhanh từ danh sách gợi ý hoặc tự nhập chức vụ thực tế.">
                    <TextInput id="task-1-role" type="text" list="hcmute-actor-roles" required errorMessage={roleErrMsg} errorId="actor-role-err" value={actorTitle} onFocusChange={(f) => setFieldStates((p) => ({ ...p, actorTitle: f ? 'focused' : p.actorTitle === 'focused' ? 'default' : p.actorTitle }))} onChange={(e) => { setActorTitle(e.target.value); scheduleAutosave({ actorEmail, actorTitle: e.target.value }, 'actorTitle'); }} onBlur={() => { setTouchedFields((p) => ({ ...p, actorTitle: true })); persistState({ actorEmail, actorTitle }, 'actorTitle'); }} placeholder={`VD: ${currentUnit.headTitleVi} / Thư ký Đề án VTVL`} />
                    <datalist id="hcmute-actor-roles">{ROLE_PRESETS.map((r) => <option key={r} value={r} />)}</datalist>
                  </FormField>
                </div>
              )}
              {wizardStage === 3 && <Step1CatalogSelector unitNameVi={currentUnit.nameVi} kind={kind} existingFrameworkIds={positions.map((p) => p.frameworkId)} onAddMultiplePositions={handleAddMultiplePositions} />}
              {wizardStage === 4 && (
                <div className="space-y-4">
                  <UnitScaleAndNgachTool unitCode={currentUnit.code} kind={kind} scaleMetrics={scaleMetrics} ngachAllocations={ngachAllocations} positions={positions} onChangeScaleMetrics={(next) => { setScaleMetrics(next); persistState({ scaleMetrics: next }); }} onChangeNgachAllocations={(next) => { setNgachAllocations(next); persistState({ ngachAllocations: next }); }} onPushToPositionStaffCounts={(staffByPos) => { syncPositions(positions.map((p) => (staffByPos[p.id] !== undefined ? { ...p, staffCount: staffByPos[p.id] } : p)), currentUnit.code, kind, positions); pushToast('success', 'Đã cộng dồn nhân sự theo mã ngạch vào cột Hiện có (D1).'); }} />
                  <Step1PositionList unitCode={currentUnit.code} positions={positions} forceShowErrors={Boolean(forceShowStageErrors[4])} onUpdateRow={handleUpdateRow} onDuplicateRow={handleDuplicateRow} onRequestRemoveRow={(row) => setConfirmAction({ type: 'delete', row })} />
                </div>
              )}
              {wizardStage === 5 && <Step1ReviewConfirm unit={currentUnit} actorEmail={actorEmail} actorTitle={actorTitle} customDate={customDate} positions={positions} loading={loading} onJumpToError={(err) => { setForceShowStageErrors((p) => ({ ...p, [err.stage]: true })); if (err.stage === 2) setTouchedFields({ actorEmail: true, actorTitle: true }); handleStageChange(err.stage, false); focusTaskTarget(err.targetId); }} onConfirmExport={() => void handleCreateFiles()} />}
            </section>
          )}
          {activeStep === 2 && (
            <section className="surface-canvas rounded-2xl p-5 sm:p-7 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-[var(--primary)] text-white font-extrabold text-xs flex items-center justify-center shrink-0">2</span>
                  <h1 className="text-base sm:text-xl font-extrabold text-[var(--foreground)]">Giai đoạn 2/5 — Xuất bộ biểu gốc</h1>
                </div>
                <button type="button" onClick={() => setActiveStep(1)} className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl border border-[var(--border)] bg-[var(--sheet)] text-xs sm:text-sm font-semibold cursor-pointer"><ArrowLeft className="w-4 h-4" /><span>Quay lại Giai đoạn 1</span></button>
              </div>
              <SplitFileNamesPreview unitCode={currentUnit.code} exportDate={customDate} includeZip={includeZip} hasGenerated={Boolean(result && !stale)} onCopied={(fn) => pushToast('success', `Đã sao chép tên tệp: ${fn}`)} />
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input id="task-2-zip" type="checkbox" checked={includeZip} onChange={(e) => setIncludeZip(e.target.checked)} className="w-5 h-5 mt-0.5 accent-[var(--primary)] shrink-0" />
                  <span className="space-y-0.5"><span className="block text-sm font-bold text-[var(--foreground)]">Kèm gói phiếu riêng từng vị trí</span><span className="block text-xs text-[var(--ink-muted)]">Xuất thêm 1 tệp .zip, trong đó mỗi vị trí có 1 bộ phiếu riêng (không có D1) để tránh tính trùng kiêm nhiệm cho {positions.length} vị trí của <strong>[{currentUnit.code}]</strong>.</span></span>
                </label>
                <button id="task-2-export" type="button" disabled={loading} onClick={() => void handleCreateFiles()} className="w-full sm:w-auto justify-center inline-flex items-center gap-2 min-h-[44px] px-5 rounded-xl bg-[var(--primary)] text-white font-bold text-sm shrink-0 cursor-pointer shadow-2xs"><FileSpreadsheet className="w-4 h-4" /><span>{result && !stale ? 'Tạo lại 4 tệp' : `Khởi tạo 4 tệp ${currentUnit.code}`}</span></button>
              </div>
              {result && <SplitResultBanner result={result} onDownload={triggerDownload} />}
              <RegenFormsFromUnitBox exportDate={customDate} includeZip={includeZip} onDownload={triggerDownload} />
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <Link href="/bam-gio" className="btn-touch inline-flex items-center gap-1.5 min-h-[42px] px-4 rounded-xl border border-[var(--border)] bg-[var(--sheet)] text-xs sm:text-sm font-semibold text-[var(--foreground)]"><Timer className="w-4 h-4 text-[var(--primary)]" /><span>Sang Giai đoạn 3: Đo định mức</span></Link>
                <button type="button" onClick={() => setActiveStep(4)} className="inline-flex items-center gap-1.5 min-h-[42px] px-4 rounded-xl bg-[var(--primary)] text-white text-xs sm:text-sm font-bold cursor-pointer"><span>Sang Giai đoạn 4: Gộp phiếu</span><ArrowRight className="w-4 h-4" /></button>
              </div>
            </section>
          )}
          {activeStep === 4 && (
            <div className="space-y-4"><MergeStepSection unit={currentUnit} /><div className="flex items-center justify-between gap-2"><button type="button" onClick={() => setActiveStep(2)} className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl border border-[var(--border)] bg-[var(--sheet)] text-sm font-semibold cursor-pointer"><ArrowLeft className="w-4 h-4" /><span>Quay lại Giai đoạn 2</span></button><Link href="/ra-soat" className="btn-touch inline-flex items-center gap-1.5 min-h-[44px] px-5 rounded-xl bg-[var(--primary)] text-white text-sm font-bold shadow-2xs"><span>Sang Giai đoạn 5: Thẩm định hồ sơ</span><ArrowRight className="w-4 h-4" /></Link></div></div>
          )}
          <details className="surface-secondary rounded-xl overflow-hidden">
            <summary className="cursor-pointer px-5 min-h-[52px] text-sm font-bold text-[var(--foreground)] flex items-center justify-between"><span className="inline-flex items-center gap-2"><BookOpenCheck className="w-4 h-4 text-[var(--primary)] shrink-0" /><span>Tra cứu Khung 38 vị trí việc làm HCM-UTE &amp; Tải dự thảo Tờ trình [{currentUnit.code}]</span></span><span className="text-xs font-semibold text-[var(--primary)] shrink-0">Mở / Đóng</span></summary>
            <div className="p-4 border-t border-[var(--border-subtle)]"><Hd07OrderGuideCard unit={currentUnit} splitResult={result} /></div>
          </details>
        </div>
      </div>
      <StickyActionBar
        activeStep={activeStep} wizardStage={wizardStage} lastSavedAt={lastSavedAt} unitCode={currentUnit.code} vtvlCount={positions.length} errorCount={validationErrors.length}
        saveLifecycle={saveLifecycle} isCheckingContinue={isCheckingContinue} continueCheckedOk={continueCheckedOk}
        onPrevStage={() => handleStageChange((wizardStage - 1) as 1 | 2 | 3 | 4 | 5, true)} onSaveNow={handleSaveDraft}
        onInspectErrors={() => { setActiveStep(1); setForceShowStageErrors({ 1: true, 2: true, 3: true, 4: true, 5: true }); setTouchedFields({ actorEmail: true, actorTitle: true }); handleStageChange(5, true); if (validationErrors[0]) focusTaskTarget(validationErrors[0].targetId); }}
        onContinue={handleContinueAction}
      />
    </div>
  );
}
