'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { FileSpreadsheet, ArrowRight, ArrowLeft, RotateCcw, BookOpenCheck, Timer, Check, AlertTriangle, Save, ShieldAlert, Undo2 } from 'lucide-react';
import { WorkflowSidebar, focusTaskTarget } from '@/components/layout/MilestonesBar';
import { HCMUTE_UNITS, UNIT_GROUPS } from '@/configs/hcmute-units';
import { HD07_CONSTANTS } from '@/configs/hcmute-hd07-catalog';
import { buildDefaultProposedPositionsForUnit, buildProposedPositionFromFramework } from '@/configs/hcmute-nd232-catalog';
import { ProposedVtvlRow, SplitResultSummary, UnitGroupKind } from '@/types/vtvl';
import { generateUnitFiles } from '@/services/excel-split/workbook-builder';
import { MergeStepSection } from '@/components/tao-tep/MergeStepSection';
import { SplitResultBanner } from '@/components/tao-tep/SplitResultBanner';
import { Hd07OrderGuideCard } from '@/components/tao-tep/Hd07OrderGuideCard';
import { Step1CatalogSelector } from '@/components/tao-tep/Step1CatalogSelector';
import { Step1PositionList, isPositionRowValid } from '@/components/tao-tep/Step1PositionList';
import { Step1ReviewConfirm, validateStep1Data } from '@/components/tao-tep/Step1ReviewConfirm';
import { getActiveUnitSession, recordActivity, saveActiveUnitSession, setSessionRootWorkbook } from '@/services/telemetry/activity-log';
import { syncUnitSplitToSupabase } from '@/services/supabase/vtvl-sync';

const ROLE_PRESETS = ['Trưởng đơn vị (Trưởng khoa / Viện trưởng / Trưởng phòng / Giám đốc)', 'Phó Trưởng đơn vị phụ trách VTVL', 'Thư ký Tổ công tác VTVL đơn vị', 'Trưởng Bộ môn / Trưởng Ngành', 'Chuyên viên / Thư ký khoa tổng hợp hồ sơ'];
const WIZARD_STAGES: { num: 1 | 2 | 3 | 4 | 5; title: string }[] = [{ num: 1, title: '1. Chọn đơn vị' }, { num: 2, title: '2. Người thực hiện' }, { num: 3, title: '3. Chọn VTVL Khung Trường' }, { num: 4, title: '4. Khai báo chi tiết VTVL' }, { num: 5, title: '5. Kiểm tra & Xác nhận' }];

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
    const sp = new URLSearchParams(window.location.search).get('step');
    if (sp === '2' || window.location.hash === '#buoc-3') setActiveStep(2);
    else if (sp === '4' || window.location.hash === '#buoc-4') setActiveStep(4);
    else setActiveStep(1);
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
    window.addEventListener('vtvl-focus-task', onFocusTask);
    return () => window.removeEventListener('vtvl-focus-task', onFocusTask);
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
    setSelectedUnitCode(first.code); syncPositions(buildDefaultProposedPositionsForUnit(first.nameVi, newKind), first.code, newKind);
  };
  const handleUnitChange = (newCode: string) => {
    setSelectedUnitCode(newCode); const u = HCMUTE_UNITS.find((x) => x.code === newCode) || HCMUTE_UNITS[0];
    syncPositions(buildDefaultProposedPositionsForUnit(u.nameVi, u.group), u.code, u.group);
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
  const actorValid = Boolean(actorEmail.trim() && actorEmail.includes('@') && actorTitle.trim());
  const allRowsValid = positions.length > 0 && positions.every((p) => isPositionRowValid(p).valid);
  const stageDone: Record<1 | 2 | 3 | 4 | 5, boolean> = { 1: Boolean(currentUnit.code), 2: actorValid, 3: positions.length > 0, 4: allRowsValid, 5: validationErrors.length === 0 };

  const handleSaveDraft = () => {
    persistState({ unitCode: currentUnit.code, kind, customDate, actorEmail, actorTitle, activeStep, wizardStage, proposedPositions: positions });
    recordActivity(currentUnit.code, currentUnit.nameVi, 'LUU_NHAP', `Lưu nháp hồ sơ đơn vị (${positions.length} vị trí việc làm)`);
  };

  const handleCreateFiles = async () => {
    if (validationErrors.length > 0) { setActiveStep(1); handleStageChange(5); return; }
    setLoading(true); setStale(false);
    try {
      persistState({ unitCode: currentUnit.code, kind, customDate, actorEmail: actorEmail.trim(), actorTitle: actorTitle.trim(), activeStep: 2, proposedPositions: positions });
      const res = await generateUnitFiles({
        kind, unitCode: currentUnit.code, unitNameVi: currentUnit.nameVi, unitNameEn: currentUnit.nameEn,
        period: HD07_CONSTANTS.STATISTICAL_PERIOD, exportDate: customDate, includeZipPerPosition: includeZip,
        actorEmail: actorEmail.trim(), actorTitle: actorTitle.trim(), ngachOverrides: {}, proposedPositions: positions
      });
      setResult(res); setActiveStep(2);
      setSessionRootWorkbook(res.unitCode, res.unitBlob, res.unitFileName);
      recordActivity(res.unitCode, res.unitNameVi, 'TAO_TEP', `Khởi tạo bộ biểu (${positions.length} VTVL đề xuất): ${res.unitFileName}`, { actorEmail: actorEmail.trim(), actorTitle: actorTitle.trim() });
      void syncUnitSplitToSupabase(res);
    } finally { setLoading(false); }
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-5 pb-28">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-4 xl:col-span-3">
          <WorkflowSidebar activeStep={activeStep} errorStep={validationErrors.length > 0 && activeStep > 1 ? 1 : null} onSelectStep={(s) => { setActiveStep(s); persistState({ activeStep: s }); }} unitCode={currentUnit.code} />
        </div>

        <div className="lg:col-span-8 xl:col-span-9 space-y-5 min-w-0">
          {activeStep === 1 && (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] p-4 sm:p-6 space-y-5 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center">
                  <span className="w-7 h-7 rounded-full bg-[var(--primary)] text-white font-extrabold text-sm flex items-center justify-center mr-2.5 shrink-0">1</span>
                  <h1 className="text-base sm:text-xl font-extrabold text-[var(--foreground)]">Bước 1: Đề xuất vị trí việc làm của đơn vị</h1>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {undoSnapshot && (
                    <button type="button" onClick={handleUndoSnapshot} className="inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-xl border border-[var(--primary)] bg-[var(--primary)]/10 text-xs sm:text-sm font-bold text-[var(--primary)] cursor-pointer"><Undo2 className="w-4 h-4" /><span>Phục hồi phiên bản trước</span></button>
                  )}
                  <button type="button" onClick={() => setConfirmAction({ type: 'reset' })} className="inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--fix)] text-xs sm:text-sm font-bold text-[var(--foreground)] cursor-pointer"><RotateCcw className="w-4 h-4 text-[var(--fix)]" /><span>Khôi phục mặc định</span></button>
                </div>
              </div>

              {confirmAction && (
                <div role="alertdialog" aria-labelledby="confirm-title" className="rounded-2xl border-2 border-[var(--fix)] bg-[var(--fix-soft)] p-4 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-[var(--fix)] shrink-0 mt-0.5" />
                    <div className="space-y-1 text-sm">
                      <strong id="confirm-title" className="text-[var(--fix)] block text-base">Xác nhận thay đổi dữ liệu vị trí việc làm</strong>
                      <p className="text-[var(--foreground)]">
                        {confirmAction.type === 'reset'
                          ? `Hành động này sẽ đặt lại toàn bộ ${positions.length} vị trí việc làm đang kê khai của [${currentUnit.code}] ${currentUnit.nameVi} về danh mục gợi ý mặc định.`
                          : `Hành động này sẽ xóa vị trí "${confirmAction.row?.specificName}" (${currentUnit.code}-${confirmAction.row?.vtvlSuffix}) khỏi danh sách đề xuất của đơn vị.`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2.5">
                    <button type="button" onClick={() => setConfirmAction(null)} className="min-h-[44px] px-4 rounded-xl border border-[var(--border)] bg-[var(--sheet)] text-sm font-bold text-[var(--foreground)] cursor-pointer">Hủy bỏ</button>
                    <button type="button" onClick={handleExecuteConfirmedAction} className="min-h-[44px] px-4 rounded-xl bg-[var(--fix)] text-white text-sm font-extrabold cursor-pointer">Xác nhận thực hiện</button>
                  </div>
                </div>
              )}

              <nav aria-label="Các chặng trong Bước 1" className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {WIZARD_STAGES.map((st) => {
                  const isCurr = wizardStage === st.num; const done = stageDone[st.num];
                  return (
                    <button key={st.num} type="button" onClick={() => handleStageChange(st.num)} className={`flex flex-col justify-between p-2.5 min-h-[54px] rounded-xl border text-left transition-all cursor-pointer ${isCurr ? 'border-[var(--primary)] bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]/40' : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/40'}`}>
                      <span className={`text-xs sm:text-sm font-extrabold ${isCurr ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>{st.title}</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-bold mt-1 ${done ? 'text-[var(--ok)]' : 'text-[var(--warn)]'}`}>{done ? <><Check className="w-3.5 h-3.5" /><span>Đã hoàn thành</span></> : <span>Đang kê khai</span>}</span>
                    </button>
                  );
                })}
              </nav>

              {wizardStage === 1 && (
                <div className="space-y-4 pt-1">
                  <h2 className="text-base font-extrabold text-[var(--foreground)]">Chặng 1/5: Chọn khối đơn vị và đơn vị lập đề án</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {UNIT_GROUPS.map((g) => (
                      <button key={g.id} type="button" onClick={() => handleGroupChange(g.id)} className={`rounded-xl border px-3 py-3 text-center transition-all cursor-pointer ${kind === g.id ? 'border-[var(--primary)] bg-[var(--primary)]/10 font-extrabold text-[var(--primary)] ring-1 ring-[var(--primary)]/30' : 'border-[var(--border)] bg-[var(--background)] font-bold text-[var(--foreground)]'}`}><span className="text-sm block">{g.label}</span></button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                    <div className="sm:col-span-7">
                      <label htmlFor="task-1-unit" className="block text-sm font-bold text-[var(--foreground)] mb-1">Đơn vị thuộc HCM-UTE ({unitsOfGroup.length} đơn vị)</label>
                      <select id="task-1-unit" value={currentUnit.code} onChange={(e) => handleUnitChange(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-base sm:text-sm font-bold">
                        {unitsOfGroup.map((u) => <option key={u.code} value={u.code}>[{u.code}] {u.nameVi}</option>)}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="unit-code-ro" className="block text-sm font-bold text-[var(--foreground)] mb-1">Mã đơn vị</label>
                      <input id="unit-code-ro" type="text" readOnly value={currentUnit.code} className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted)] px-3.5 py-2.5 text-base sm:text-sm font-mono font-extrabold text-[var(--primary)]" />
                    </div>
                    <div className="sm:col-span-3">
                      <label htmlFor="unit-date" className="block text-sm font-bold text-[var(--foreground)] mb-1">Ngày lập hồ sơ</label>
                      <input id="unit-date" type="date" value={customDate} onChange={(e) => { setCustomDate(e.target.value); persistState({ customDate: e.target.value }); }} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2 text-base sm:text-sm" />
                    </div>
                  </div>
                </div>
              )}

              {wizardStage === 2 && (
                <div className="space-y-4 pt-1">
                  <h2 className="text-base font-extrabold text-[var(--foreground)]">Chặng 2/5: Nhập thông tin người đang thực hiện tại [{currentUnit.code}]</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="task-1-actor" className="block text-sm font-extrabold text-[var(--foreground)] mb-1">Email công vụ người thực hiện <span className="text-[var(--fix)]">*</span></label>
                      <input id="task-1-actor" type="email" required aria-invalid={!actorEmail.includes('@')} value={actorEmail} onChange={(e) => handleActorChange(e.target.value, actorTitle)} placeholder={`VD: ${currentUnit.code.toLowerCase()}@hcmute.edu.vn`} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-base sm:text-sm font-semibold" />
                      {(!actorEmail.trim() || !actorEmail.includes('@')) && <p className="text-xs font-bold text-[var(--fix)] mt-1">Vui lòng nhập địa chỉ email công vụ hợp lệ (có ký tự @).</p>}
                    </div>
                    <div>
                      <label htmlFor="task-1-role" className="block text-sm font-extrabold text-[var(--foreground)] mb-1">Chức vụ / Vai trò người thực hiện <span className="text-[var(--fix)]">*</span></label>
                      <input id="task-1-role" type="text" list="hcmute-actor-roles" required aria-invalid={!actorTitle.trim()} value={actorTitle} onChange={(e) => handleActorChange(actorEmail, e.target.value)} placeholder={`VD: ${currentUnit.headTitleVi} / Thư ký Đề án VTVL`} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-base sm:text-sm font-semibold" />
                      <datalist id="hcmute-actor-roles">{ROLE_PRESETS.map((r) => <option key={r} value={r} />)}</datalist>
                      {!actorTitle.trim() && <p className="text-xs font-bold text-[var(--fix)] mt-1">Vui lòng nhập hoặc chọn chức vụ của người thực hiện.</p>}
                    </div>
                  </div>
                </div>
              )}

              {wizardStage === 3 && <Step1CatalogSelector unitNameVi={currentUnit.nameVi} kind={kind} existingFrameworkIds={positions.map((p) => p.frameworkId)} onAddMultiplePositions={handleAddMultiplePositions} />}
              {wizardStage === 4 && <Step1PositionList unitCode={currentUnit.code} positions={positions} onUpdateRow={handleUpdateRow} onDuplicateRow={handleDuplicateRow} onRequestRemoveRow={(row) => setConfirmAction({ type: 'delete', row })} />}
              {wizardStage === 5 && <Step1ReviewConfirm unit={currentUnit} actorEmail={actorEmail} actorTitle={actorTitle} customDate={customDate} positions={positions} loading={loading} onJumpToError={(err) => { handleStageChange(err.stage); focusTaskTarget(err.targetId); }} onConfirmExport={() => void handleCreateFiles()} />}
            </section>
          )}

          {activeStep === 2 && (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] p-4 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
                <h1 className="text-base sm:text-xl font-extrabold text-[var(--foreground)]">Bước 2: Xuất bộ biểu gốc 21 trang tính &amp; gói phiếu khảo sát (.zip)</h1>
                <button type="button" onClick={() => setActiveStep(1)} className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm font-bold cursor-pointer"><ArrowLeft className="w-4 h-4" /><span>Quay lại Bước 1</span></button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                <label className="flex items-center gap-3 text-sm font-semibold text-[var(--foreground)] cursor-pointer">
                  <input id="task-2-zip" type="checkbox" checked={includeZip} onChange={(e) => setIncludeZip(e.target.checked)} className="w-5 h-5 accent-[var(--primary)]" />
                  <span>Kết xuất kèm gói tệp nén (.zip) chứa phiếu khảo sát riêng cho {positions.length} vị trí của <strong>[{currentUnit.code}]</strong></span>
                </label>
                <button id="task-2-export" type="button" disabled={loading} onClick={() => void handleCreateFiles()} className="w-full sm:w-auto justify-center inline-flex items-center gap-2 min-h-[44px] px-5 rounded-xl bg-[var(--primary)] text-white font-extrabold text-sm cursor-pointer"><FileSpreadsheet className="w-4 h-4" /><span>{result && !stale ? 'Tạo lại bộ biểu' : `Khởi tạo bộ biểu ${currentUnit.code}`}</span></button>
              </div>
              {result ? <SplitResultBanner result={result} onDownload={triggerDownload} /> : <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--ink-muted)]">Bấm <strong>Khởi tạo bộ biểu {currentUnit.code}</strong> để sinh tệp Excel 21 trang tính.</div>}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <Link href="/bam-gio" className="btn-touch inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm font-bold text-[var(--foreground)]"><Timer className="w-4 h-4 text-[var(--primary)]" /><span>Sang Bước 3: Đo định mức</span></Link>
                <button type="button" onClick={() => setActiveStep(4)} className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl bg-[var(--primary)] text-white text-sm font-bold cursor-pointer"><span>Sang Bước 4: Gộp phiếu</span><ArrowRight className="w-4 h-4" /></button>
              </div>
            </section>
          )}

          {activeStep === 4 && (
            <div className="space-y-4">
              <MergeStepSection unit={currentUnit} />
              <div className="flex items-center justify-between gap-2">
                <button type="button" onClick={() => setActiveStep(2)} className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl border border-[var(--border)] bg-[var(--sheet)] text-sm font-bold cursor-pointer"><ArrowLeft className="w-4 h-4" /><span>Quay lại Bước 2</span></button>
                <Link href="/ra-soat" className="btn-touch inline-flex items-center gap-1.5 min-h-[44px] px-5 rounded-xl bg-[var(--primary)] text-white text-sm font-bold shadow-2xs"><span>Sang Bước 5: Thẩm định hồ sơ</span><ArrowRight className="w-4 h-4" /></Link>
              </div>
            </div>
          )}

          <details className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] overflow-hidden shadow-2xs">
            <summary className="cursor-pointer px-5 min-h-[52px] text-sm font-extrabold text-[var(--foreground)] flex items-center justify-between bg-[var(--background)]/60">
              <span className="inline-flex items-center gap-2"><BookOpenCheck className="w-4 h-4 text-[var(--primary)] shrink-0" /><span>Tra cứu Khung 38 vị trí việc làm HCM-UTE &amp; Tải dự thảo Tờ trình [{currentUnit.code}]</span></span>
              <span className="text-xs font-bold text-[var(--primary)] shrink-0">Mở / Đóng</span>
            </summary>
            <div className="p-4 border-t border-[var(--border-subtle)]"><Hd07OrderGuideCard unit={currentUnit} splitResult={result} /></div>
          </details>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--sheet)]/95 backdrop-blur-xs shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--ink-muted)]">
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--ok)]" />
            <span>Đã lưu lúc <strong>{lastSavedAt}</strong></span>
            <span className="hidden sm:inline">· [{currentUnit.code}] {positions.length} vị trí việc làm</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {activeStep === 1 && wizardStage > 1 && <button type="button" onClick={() => handleStageChange((wizardStage - 1) as 1 | 2 | 3 | 4 | 5)} className="inline-flex items-center gap-1 min-h-[44px] px-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs sm:text-sm font-bold text-[var(--foreground)] cursor-pointer"><ArrowLeft className="w-4 h-4" /><span>Quay lại</span></button>}
            <button type="button" onClick={handleSaveDraft} className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs sm:text-sm font-bold text-[var(--primary)] cursor-pointer"><Save className="w-4 h-4" /><span>Lưu nháp</span></button>
            <button type="button" onClick={() => { setActiveStep(1); handleStageChange(5); }} className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs sm:text-sm font-bold text-[var(--foreground)] cursor-pointer">{validationErrors.length > 0 ? <AlertTriangle className="w-4 h-4 text-[var(--fix)]" /> : <Check className="w-4 h-4 text-[var(--ok)]" />}<span>Kiểm tra dữ liệu ({validationErrors.length})</span></button>
            <button type="button" onClick={() => { if (activeStep === 1 && wizardStage < 5) handleStageChange((wizardStage + 1) as 1 | 2 | 3 | 4 | 5); else void handleCreateFiles(); }} className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl bg-[var(--primary)] text-white text-xs sm:text-sm font-extrabold cursor-pointer shadow-2xs"><span>{activeStep === 1 && wizardStage < 5 ? 'Tiếp tục' : 'Xuất bộ biểu'}</span><ArrowRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
