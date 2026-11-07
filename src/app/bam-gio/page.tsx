'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Timer, Play, Pause, Plus, Download, CheckCircle2, Trash2, ArrowRight, Building2, UserCheck, ClipboardList, Edit3 } from 'lucide-react';
import { WorkflowSidebar, InfoTip } from '@/components/layout/MilestonesBar';
import { HCMUTE_UNITS } from '@/configs/hcmute-units';
import { NGACH_LIST_BY_GROUP, TASK_TEMPLATES_BY_GROUP } from '@/configs/hcmute-quotas';
import { buildDefaultSpecificVtvlName } from '@/configs/hcmute-nd232-catalog';
import { TimeSessionRow, ProposedVtvlRow } from '@/types/vtvl';
import { buildPersonalTimerWorkbookFile, exportPersonalTimerWorkbook } from '@/services/excel-split/personal-timer-export';
import { getActiveUnitSession, getRealtimeDateYYYYMMDD, recordActivity, saveActiveUnitSession } from '@/services/telemetry/activity-log';

export default function BamGioPage() {
  const [unitCode, setUnitCode] = useState<string>('FME');
  const [proposedPositions, setProposedPositions] = useState<ProposedVtvlRow[]>([]);
  const [customPositionNames, setCustomPositionNames] = useState<Record<string, string>>({});
  const [customCareerLevels, setCustomCareerLevels] = useState<Record<string, string>>({});
  const [performerTitle, setPerformerTitle] = useState<string>('Giảng viên chính');
  const [selectedVtvlSuffix, setSelectedVtvlSuffix] = useState<string>('DT-GV-02');
  const [sessions, setSessions] = useState<TimeSessionRow[]>([]);
  const [statusBanner, setStatusBanner] = useState<string>('');
  const [inputMode, setInputMode] = useState<'live' | 'manual'>('live');
  const [activeTaskCode, setActiveTaskCode] = useState<string>('');
  const [running, setRunning] = useState<boolean>(false);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [productCountInput, setProductCountInput] = useState<number>(1);
  const [manualDate, setManualDate] = useState<string>(() => getRealtimeDateYYYYMMDD());
  const [manualStart, setManualStart] = useState<string>('08:00');
  const [manualEnd, setManualEnd] = useState<string>('10:30');
  const [manualProducts, setManualProducts] = useState<number>(1);

  const unit = useMemo(() => HCMUTE_UNITS.find((u) => u.code === unitCode) || HCMUTE_UNITS[0], [unitCode]);

  const syncFromSession = () => {
    const saved = getActiveUnitSession();
    const matched = HCMUTE_UNITS.find((u) => u.code === saved.unitCode) || HCMUTE_UNITS[0];
    setUnitCode(matched.code);
    setProposedPositions(saved.proposedPositions || []);
    setCustomPositionNames(saved.customPositionNames || {});
    setCustomCareerLevels(saved.customCareerLevels || {});
    setManualDate(saved.customDate || getRealtimeDateYYYYMMDD());
    setSessions(saved.timeSessions || []);
    if (saved.proposedPositions && saved.proposedPositions.length > 0) {
      setSelectedVtvlSuffix((cur) => (saved.proposedPositions.some((p) => p.vtvlSuffix === cur) ? cur : saved.proposedPositions[0].vtvlSuffix));
    } else {
      const groupTasks = TASK_TEMPLATES_BY_GROUP[matched.group];
      if (groupTasks.length > 0) setSelectedVtvlSuffix(groupTasks[0].vtvlSuffix);
    }
  };

  useEffect(() => {
    syncFromSession();
    const onUpdate = () => syncFromSession();
    const onFocusTask = (e: Event) => {
      const detail = (e as CustomEvent<{ step: number; taskId: string }>).detail;
      if (detail?.taskId === 'task-3-manual') setInputMode('manual');
      if (detail?.taskId === 'task-3-timer') setInputMode('live');
    };
    window.addEventListener('vtvl-unit-session-updated', onUpdate);
    window.addEventListener('storage', onUpdate);
    window.addEventListener('vtvl-focus-task', onFocusTask);
    const bc = 'BroadcastChannel' in window ? new BroadcastChannel('hcmute_vtvl_realtime') : null;
    if (bc) bc.onmessage = () => syncFromSession();
    return () => {
      window.removeEventListener('vtvl-unit-session-updated', onUpdate);
      window.removeEventListener('storage', onUpdate);
      window.removeEventListener('vtvl-focus-task', onFocusTask);
      bc?.close();
    };
  }, []);

  const tasksOfUnit = useMemo(() => TASK_TEMPLATES_BY_GROUP[unit.group].map((t) => ({ ...t, fullVtvlCode: `${unit.code}-${t.vtvlSuffix}`, fullTaskCode: `${unit.code}-${t.taskSuffix}` })), [unit]);

  const vtvlOptions = useMemo(() => {
    if (proposedPositions.length > 0) return proposedPositions.map((p) => ({ suffix: p.vtvlSuffix, code: `${unit.code}-${p.vtvlSuffix}`, name: p.specificName, level: p.careerLevel, ngachCode: p.ngachCode }));
    const ngachList = NGACH_LIST_BY_GROUP[unit.group];
    const map = new Map<string, { suffix: string; code: string; name: string; level: string; ngachCode: string }>();
    tasksOfUnit.forEach((t) => {
      if (!map.has(t.vtvlSuffix)) {
        const ngach = ngachList.find((n) => n.code === t.ngachCode);
        const fwTitle = ngach?.frameworkTitle || ngach?.name || t.vtvlName;
        const defaultName = ngach ? buildDefaultSpecificVtvlName(fwTitle, unit.nameVi, ngach.specificNameSuffix, unit.group) : t.vtvlName;
        const specificName = ngach ? customPositionNames[ngach.code] ?? defaultName : t.vtvlName;
        const careerLevel = ngach ? customCareerLevels[ngach.code] ?? ngach.defaultCareerLevel ?? 'Bậc 3' : 'Bậc 3';
        map.set(t.vtvlSuffix, { suffix: t.vtvlSuffix, code: t.fullVtvlCode, name: specificName, level: careerLevel, ngachCode: t.ngachCode });
      }
    });
    return Array.from(map.values());
  }, [proposedPositions, tasksOfUnit, unit, customPositionNames, customCareerLevels]);

  const tasksForPosition = useMemo(() => {
    const direct = tasksOfUnit.filter((t) => t.vtvlSuffix === selectedVtvlSuffix);
    const selectedOpt = vtvlOptions.find((v) => v.suffix === selectedVtvlSuffix);
    const byNgach = selectedOpt ? tasksOfUnit.filter((t) => t.ngachCode === selectedOpt.ngachCode) : [];
    const base = direct.length > 0 ? direct : byNgach.length > 0 ? byNgach : tasksOfUnit.slice(0, 2);
    return base.map((t) => ({ ...t, fullVtvlCode: `${unit.code}-${selectedVtvlSuffix}` }));
  }, [tasksOfUnit, selectedVtvlSuffix, vtvlOptions, unit.code]);

  useEffect(() => {
    if (tasksForPosition.length > 0) setActiveTaskCode(tasksForPosition[0].fullTaskCode);
    const currentOpt = vtvlOptions.find((v) => v.suffix === selectedVtvlSuffix);
    if (currentOpt) setPerformerTitle(`${currentOpt.name} (${currentOpt.level})`);
  }, [tasksForPosition, selectedVtvlSuffix, vtvlOptions]);

  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [running]);

  const formatTimer = (sec: number) => `${String(Math.floor(sec / 3600)).padStart(2, '0')}:${String(Math.floor((sec % 3600) / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
  const activeTask = useMemo(() => tasksForPosition.find((t) => t.fullTaskCode === activeTaskCode) || tasksForPosition[0], [tasksForPosition, activeTaskCode]);
  const measuredTaskCount = useMemo(() => {
    const codes = new Set(sessions.map((s) => s.taskCode));
    return tasksForPosition.filter((t) => codes.has(t.fullTaskCode)).length;
  }, [sessions, tasksForPosition]);

  const commitSessions = (nextSessions: TimeSessionRow[]) => {
    setSessions(nextSessions);
    saveActiveUnitSession({ unitCode: unit.code, timeSessions: nextSessions });
    if (nextSessions.length > 0) buildPersonalTimerWorkbookFile(unit, selectedVtvlSuffix, performerTitle, tasksForPosition, nextSessions, manualDate);
  };

  const handleFinishLiveTimer = () => {
    if (!activeTask) return;
    const durationMin = Math.max(1, Math.round(elapsedSec / 60));
    const prods = Math.max(1, productCountInput);
    const minPerProd = Number((durationMin / prods).toFixed(1));
    const runNum = sessions.filter((s) => s.taskCode === activeTask.fullTaskCode).length + 1;
    const now = new Date();
    const endStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    commitSessions([...sessions, { id: `${Date.now()}`, taskCode: activeTask.fullTaskCode, taskName: activeTask.taskName, runNumber: runNum, date: manualDate, startTime: 'Đo trực tiếp', endTime: endStr, durationMinutes: durationMin, productCount: prods, minutesPerProduct: minPerProd, performerTitle }]);
    setRunning(false); setElapsedSec(0);
    setStatusBanner(`Đã lưu phiên đo thực tế mã ${activeTask.fullTaskCode} (${minPerProd} phút/SP) và tự động đính kèm phiếu sang Giai đoạn 4.`);
  };

  const handleAddManualSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask) return;
    const [sh, sm] = manualStart.split(':').map(Number);
    const [eh, em] = manualEnd.split(':').map(Number);
    const durationMin = Math.max(5, eh * 60 + em - (sh * 60 + sm));
    const prods = Math.max(1, manualProducts);
    const minPerProd = Number((durationMin / prods).toFixed(1));
    const runNum = sessions.filter((s) => s.taskCode === activeTask.fullTaskCode).length + 1;
    commitSessions([...sessions, { id: `${Date.now()}`, taskCode: activeTask.fullTaskCode, taskName: activeTask.taskName, runNumber: runNum, date: manualDate, startTime: manualStart, endTime: manualEnd, durationMinutes: durationMin, productCount: prods, minutesPerProduct: minPerProd, performerTitle }]);
    setStatusBanner(`Đã lưu bản ghi ${activeTask.fullTaskCode} (${minPerProd} phút/SP) và tự động liên thông sang Giai đoạn 4.`);
  };

  const handleExport = () => {
    const fileName = exportPersonalTimerWorkbook(unit, selectedVtvlSuffix, performerTitle, tasksForPosition, sessions, manualDate);
    saveActiveUnitSession({ unitCode: unit.code, timeSessions: sessions });
    recordActivity(unit.code, unit.nameVi, 'BAM_GIO', `Kết xuất phiếu kê khai định mức thời gian: ${fileName}`);
    setStatusBanner(`Đã xuất tệp ${fileName} và đính kèm tự động vào Giai đoạn 4 (Gộp phiếu).`);
  };

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-3"><WorkflowSidebar activeStep={3} unitCode={unit.code} /></div>
        <div className="lg:col-span-9 space-y-5 min-w-0">
          <section className="surface-canvas rounded-2xl p-5 sm:p-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center">
                <span className="w-7 h-7 rounded-full bg-[var(--primary)] text-white font-extrabold text-xs flex items-center justify-center mr-2.5 shrink-0">3</span>
                <h1 className="text-base sm:text-xl font-extrabold text-[var(--foreground)]">Giai đoạn 3/5 — Đo định mức thời gian</h1>
                <InfoTip title="Hướng dẫn đo định mức (Biểu 3. B1_KhoiLuong)">
                  <p>Hệ thống tự động giữ nguyên đơn vị <strong>[{unit.code}] {unit.nameVi}</strong> cùng các Tên VTVL cụ thể và Bậc nghề nghiệp đã đặt ở Giai đoạn 1.</p>
                  <p>Mỗi bản ghi bấm giờ được lưu trực tiếp vào phiên làm việc và tự động chuyển thành phiếu khảo sát tại <strong>Giai đoạn 4 (Gộp phiếu)</strong>.</p>
                </InfoTip>
              </div>
              <Link href="/tao-tep?step=1" className="text-xs font-semibold text-[var(--primary)] hover:underline">Đổi đơn vị tại Giai đoạn 1</Link>
            </div>

            {statusBanner && <div role="status" aria-live="polite" className="rounded-xl border border-[var(--ok)]/40 bg-[var(--ok-soft)] px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[var(--ok)]">✓ {statusBanner}</div>}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center py-1">
              <div className="md:col-span-4 flex items-center gap-2 text-xs sm:text-sm font-bold text-[var(--foreground)] min-w-0">
                <Building2 className="w-4 h-4 text-[var(--primary)] shrink-0" /><span className="truncate">[{unit.code}] {unit.nameVi}</span>
              </div>
              <div className="md:col-span-5 md:border-l md:border-[var(--border-subtle)] md:pl-4 flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <UserCheck className="w-4 h-4 text-[var(--primary)] shrink-0" />
                  <select id="task-3-vtvl" aria-label="Chọn vị trí việc làm cần đo" value={selectedVtvlSuffix} onChange={(e) => setSelectedVtvlSuffix(e.target.value)} className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-[var(--foreground)] truncate">
                    {vtvlOptions.map((v) => <option key={v.suffix} value={v.suffix}>{v.code} · {v.name} ({v.level})</option>)}
                  </select>
                </div>
                <input type="text" aria-label="Chức danh và bậc kê khai" value={performerTitle} onChange={(e) => setPerformerTitle(e.target.value)} className="sm:w-40 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-2.5 py-1.5 text-xs font-medium text-[var(--ink-muted)]" />
              </div>
              <div className="md:col-span-3 md:border-l md:border-[var(--border-subtle)] md:pl-4 space-y-1.5">
                <div className="text-xs font-bold text-[var(--foreground)]">{measuredTaskCount}/{tasksForPosition.length} công việc đã có dữ liệu</div>
                <div className="h-2 w-full rounded-full bg-[var(--border-subtle)] overflow-hidden"><div className="h-full rounded-full bg-[var(--primary)] transition-all" style={{ width: `${Math.max(12, Math.round((measuredTaskCount / Math.max(1, tasksForPosition.length)) * 100))}%` }} /></div>
              </div>
            </div>

            {activeTask && (
              <div className="space-y-2">
                <div className="rounded-xl border border-[var(--primary)] bg-[var(--surface-tint)]/75 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <div className="font-mono font-bold text-sm text-[var(--primary)]">{activeTask.fullTaskCode}</div>
                    <p className="text-xs sm:text-sm font-medium text-[var(--foreground)]">{activeTask.taskName}</p>
                  </div>
                  <div className="sm:border-l sm:border-[var(--primary)]/20 sm:pl-4 flex items-center gap-1.5 text-sm font-bold text-[var(--foreground)] shrink-0">
                    <Timer className="w-4 h-4 text-[var(--primary)]" /><span className="tabular-nums">{activeTask.defaultMinutesPerProduct.toLocaleString('vi-VN')} phút/SP</span>
                  </div>
                </div>
                {tasksForPosition.length > 1 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-[var(--ink-muted)] mr-1">Đổi công việc:</span>
                    {tasksForPosition.map((t) => (
                      <button key={t.fullTaskCode} type="button" aria-pressed={activeTaskCode === t.fullTaskCode} onClick={() => setActiveTaskCode(t.fullTaskCode)} className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border cursor-pointer transition-colors ${activeTaskCode === t.fullTaskCode ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-[var(--surface-secondary)] text-[var(--foreground)] border-[var(--border-subtle)] hover:border-[var(--primary)]'}`}>{t.fullTaskCode}</button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="inline-flex rounded-xl bg-[var(--surface-secondary)] p-1 border border-[var(--border-subtle)]">
              <button type="button" onClick={() => setInputMode('live')} className={`inline-flex items-center gap-1.5 min-h-[38px] px-4 rounded-lg text-xs sm:text-sm font-bold cursor-pointer transition-colors ${inputMode === 'live' ? 'bg-[var(--primary)] text-white shadow-2xs' : 'text-[var(--foreground)] hover:text-[var(--primary)]'}`}><Timer className="w-4 h-4" /><span>Đo trực tiếp</span></button>
              <button type="button" onClick={() => setInputMode('manual')} className={`inline-flex items-center gap-1.5 min-h-[38px] px-4 rounded-lg text-xs sm:text-sm font-bold cursor-pointer transition-colors ${inputMode === 'manual' ? 'bg-[var(--primary)] text-white shadow-2xs' : 'text-[var(--foreground)] hover:text-[var(--primary)]'}`}><Edit3 className="w-4 h-4" /><span>Nhập thủ công</span></button>
            </div>

            <div className={inputMode === 'live' ? 'rounded-2xl bg-[var(--surface-tint)]/80 border border-[var(--primary)]/15 p-5 grid grid-cols-1 md:grid-cols-12 items-center gap-4' : 'sr-only'}>
              <div className="md:col-span-5 text-center space-y-1">
                <div className="text-xs font-semibold text-[var(--ink-muted)]">Đồng hồ đo (đo trực tiếp)</div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[var(--foreground)] tracking-wider tabular-nums">{formatTimer(elapsedSec)}</div>
              </div>
              <div className="md:col-span-3 md:border-l md:border-[var(--border-subtle)] md:pl-5 space-y-1">
                <label htmlFor="live-prod-count" className="block text-xs font-semibold text-[var(--ink-muted)]">Số sản phẩm</label>
                <input id="live-prod-count" type="number" min={1} value={productCountInput} onChange={(e) => setProductCountInput(Math.max(1, parseInt(e.target.value || '1', 10)))} className="w-full min-h-[42px] rounded-xl border border-[var(--border)] bg-[var(--sheet)] px-3 text-sm font-bold text-[var(--foreground)]" />
              </div>
              <div className="md:col-span-4 flex flex-wrap items-center justify-end gap-2">
                <button id="task-3-timer" type="button" onClick={() => setRunning(!running)} className="flex-1 sm:flex-initial justify-center inline-flex items-center gap-2 min-h-[44px] px-5 rounded-xl bg-[var(--primary)] text-white text-sm font-bold cursor-pointer shadow-2xs">{running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}<span>{running ? 'Tạm dừng' : 'Bắt đầu đo'}</span></button>
                <button type="button" onClick={handleFinishLiveTimer} className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl bg-[var(--ok)] text-white text-xs sm:text-sm font-bold cursor-pointer"><CheckCircle2 className="w-4 h-4" /><span>Ghi nhận</span></button>
              </div>
            </div>

            <form onSubmit={handleAddManualSession} className={inputMode === 'manual' ? 'rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border-subtle)] p-4 grid grid-cols-2 sm:grid-cols-5 gap-3 items-end' : 'sr-only'}>
              <div><label className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">Ngày thực hiện</label><input type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)} className="w-full min-h-[42px] rounded-xl border border-[var(--border)] bg-[var(--sheet)] px-2.5 text-xs sm:text-sm" /></div>
              <div><label htmlFor="task-3-manual" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">Giờ bắt đầu</label><input id="task-3-manual" type="time" value={manualStart} onChange={(e) => setManualStart(e.target.value)} className="w-full min-h-[42px] rounded-xl border border-[var(--border)] bg-[var(--sheet)] px-2.5 text-xs sm:text-sm" /></div>
              <div><label className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">Giờ kết thúc</label><input type="time" value={manualEnd} onChange={(e) => setManualEnd(e.target.value)} className="w-full min-h-[42px] rounded-xl border border-[var(--border)] bg-[var(--sheet)] px-2.5 text-xs sm:text-sm" /></div>
              <div><label className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">Số sản phẩm</label><input type="number" min={1} value={manualProducts} onChange={(e) => setManualProducts(Math.max(1, parseInt(e.target.value || '1', 10)))} className="w-full min-h-[42px] rounded-xl border border-[var(--border)] bg-[var(--sheet)] px-2.5 text-xs sm:text-sm font-bold" /></div>
              <button type="submit" className="col-span-2 sm:col-span-1 min-h-[42px] rounded-xl bg-[var(--primary)] text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer"><Plus className="w-4 h-4" /><span>Thêm bản ghi</span></button>
            </form>

            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--foreground)]"><ClipboardList className="w-4 h-4 text-[var(--primary)]" /><span>Nhật ký định mức — {sessions.length} bản ghi</span></div>
              {sessions.length === 0 ? (
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-6 flex items-center justify-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[var(--surface-tint)] text-[var(--primary)] flex items-center justify-center shrink-0"><ClipboardList className="w-5 h-5" /></div>
                  <div className="space-y-0.5"><div className="text-sm font-bold text-[var(--foreground)]">Chưa có bản ghi đo định mức</div><p className="text-xs text-[var(--ink-muted)]">Thực hiện đo trực tiếp hoặc nhập thủ công để tạo bản ghi thời gian.</p></div>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
                  <table className="w-full text-xs border-collapse">
                    <thead><tr className="bg-[var(--surface-secondary)] border-b border-[var(--border-subtle)]"><th className="py-2.5 px-3 text-left">Mã CV</th><th className="py-2.5 px-3 text-left">Lượt</th><th className="py-2.5 px-3 text-left">Thời gian</th><th className="py-2.5 px-3 text-right">Phút</th><th className="py-2.5 px-3 text-right">SP</th><th className="py-2.5 px-3 text-right">Phút/SP</th><th className="py-2.5 px-3 text-center">Xóa</th></tr></thead>
                    <tbody className="divide-y divide-[var(--border-subtle)] bg-[var(--sheet)]">
                      {sessions.map((s) => (
                        <tr key={s.id}>
                          <td className="py-2 px-3 font-mono font-bold text-[var(--primary)]">{s.taskCode}</td><td className="py-2 px-3 tabular-nums">Lần {s.runNumber}</td><td className="py-2 px-3">{s.startTime} – {s.endTime}</td><td className="py-2 px-3 text-right tabular-nums">{s.durationMinutes}</td><td className="py-2 px-3 text-right tabular-nums">{s.productCount}</td><td className="py-2 px-3 text-right font-extrabold text-[var(--ok)] tabular-nums">{s.minutesPerProduct}</td>
                          <td className="py-2 px-3 text-center"><button type="button" onClick={() => commitSessions(sessions.filter((x) => x.id !== s.id))} className="text-[var(--fix)] hover:opacity-80 cursor-pointer"><Trash2 className="w-3.5 h-3.5 inline" /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]">
                <span className="text-xs text-[var(--ink-muted)]">ⓘ Mỗi bản ghi được tự động đóng gói thành phiếu khảo sát liên thông sang Giai đoạn 4.</span>
                <div className="flex flex-wrap items-center gap-2">
                  <button id="task-3-export" type="button" onClick={handleExport} className="inline-flex items-center gap-1.5 min-h-[42px] px-4 rounded-xl border border-[var(--border)] bg-[var(--sheet)] hover:border-[var(--primary)] text-[var(--primary)] font-bold text-xs sm:text-sm cursor-pointer"><Download className="w-4 h-4 shrink-0" /><span>Xuất phiếu định mức [{unit.code}] (.xlsx)</span></button>
                  <Link href="/tao-tep?step=4" className="btn-touch inline-flex items-center gap-1.5 min-h-[42px] px-4 rounded-xl bg-[var(--primary)] text-white text-xs sm:text-sm font-bold shadow-2xs"><span>Xuất kết quả &amp; sang Giai đoạn 4</span><ArrowRight className="w-4 h-4" /></Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
