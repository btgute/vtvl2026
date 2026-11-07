'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Timer, Play, Pause, Plus, Download, CheckCircle2, Trash2, ArrowRight, Building2 } from 'lucide-react';
import { WorkflowSidebar, InfoTip } from '@/components/layout/MilestonesBar';
import { HCMUTE_UNITS } from '@/configs/hcmute-units';
import { NGACH_LIST_BY_GROUP, TASK_TEMPLATES_BY_GROUP } from '@/configs/hcmute-quotas';
import { buildDefaultSpecificVtvlName } from '@/configs/hcmute-nd232-catalog';
import { TimeSessionRow, ProposedVtvlRow } from '@/types/vtvl';
import { exportPersonalTimerWorkbook } from '@/services/excel-split/personal-timer-export';
import { getActiveUnitSession, recordActivity } from '@/services/telemetry/activity-log';

export default function BamGioPage() {
  const [unitCode, setUnitCode] = useState<string>('FME');
  const [proposedPositions, setProposedPositions] = useState<ProposedVtvlRow[]>([]);
  const [customPositionNames, setCustomPositionNames] = useState<Record<string, string>>({});
  const [customCareerLevels, setCustomCareerLevels] = useState<Record<string, string>>({});
  const [performerTitle, setPerformerTitle] = useState<string>('Giảng viên chính');
  const [selectedVtvlSuffix, setSelectedVtvlSuffix] = useState<string>('DT-GV-02');
  const [sessions, setSessions] = useState<TimeSessionRow[]>([]);

  const [activeTaskCode, setActiveTaskCode] = useState<string>('');
  const [running, setRunning] = useState<boolean>(false);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [productCountInput, setProductCountInput] = useState<number>(1);

  const [manualDate, setManualDate] = useState<string>('2026-11-07');
  const [manualStart, setManualStart] = useState<string>('08:00');
  const [manualEnd, setManualEnd] = useState<string>('10:30');
  const [manualProducts, setManualProducts] = useState<number>(1);

  const unit = useMemo(() => HCMUTE_UNITS.find((u) => u.code === unitCode) || HCMUTE_UNITS[0], [unitCode]);

  useEffect(() => {
    const saved = getActiveUnitSession();
    const matched = HCMUTE_UNITS.find((u) => u.code === saved.unitCode) || HCMUTE_UNITS[0];
    setUnitCode(matched.code);
    setProposedPositions(saved.proposedPositions || []);
    setCustomPositionNames(saved.customPositionNames || {});
    setCustomCareerLevels(saved.customCareerLevels || {});
    setManualDate(saved.customDate || '2026-11-07');

    if (saved.proposedPositions && saved.proposedPositions.length > 0) {
      setSelectedVtvlSuffix(saved.proposedPositions[0].vtvlSuffix);
    } else {
      const groupTasks = TASK_TEMPLATES_BY_GROUP[matched.group];
      if (groupTasks.length > 0) {
        setSelectedVtvlSuffix(groupTasks[0].vtvlSuffix);
        setActiveTaskCode(`${matched.code}-${groupTasks[0].taskSuffix}`);
      }
    }
  }, []);

  const tasksOfUnit = useMemo(() => {
    const list = TASK_TEMPLATES_BY_GROUP[unit.group];
    return list.map((t) => ({ ...t, fullVtvlCode: `${unit.code}-${t.vtvlSuffix}`, fullTaskCode: `${unit.code}-${t.taskSuffix}` }));
  }, [unit]);

  const vtvlOptions = useMemo(() => {
    if (proposedPositions.length > 0) {
      return proposedPositions.map((p) => ({ suffix: p.vtvlSuffix, code: `${unit.code}-${p.vtvlSuffix}`, name: p.specificName, level: p.careerLevel, ngachCode: p.ngachCode }));
    }
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
    if (direct.length > 0) return direct;
    const selectedOpt = vtvlOptions.find((v) => v.suffix === selectedVtvlSuffix);
    const byNgach = selectedOpt ? tasksOfUnit.filter((t) => t.ngachCode === selectedOpt.ngachCode) : [];
    return byNgach.length > 0 ? byNgach : tasksOfUnit.slice(0, 2);
  }, [tasksOfUnit, selectedVtvlSuffix, vtvlOptions]);

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

  const formatTimer = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  const handleFinishLiveTimer = () => {
    const task = tasksOfUnit.find((t) => t.fullTaskCode === activeTaskCode) || tasksForPosition[0];
    if (!task) return;
    const durationMin = Math.max(1, Math.round(elapsedSec / 60));
    const prods = Math.max(1, productCountInput);
    const minPerProd = Number((durationMin / prods).toFixed(1));
    const runNum = sessions.filter((s) => s.taskCode === task.fullTaskCode).length + 1;
    const now = new Date();
    const endStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setSessions((prev) => [
      ...prev,
      { id: `${Date.now()}`, taskCode: task.fullTaskCode, taskName: task.taskName, runNumber: runNum, date: manualDate, startTime: 'Đo trực tiếp', endTime: endStr, durationMinutes: durationMin, productCount: prods, minutesPerProduct: minPerProd, performerTitle }
    ]);
    setRunning(false); setElapsedSec(0);
  };

  const handleAddManualSession = (e: React.FormEvent) => {
    e.preventDefault();
    const task = tasksOfUnit.find((t) => t.fullTaskCode === activeTaskCode) || tasksForPosition[0];
    if (!task) return;
    const [sh, sm] = manualStart.split(':').map(Number);
    const [eh, em] = manualEnd.split(':').map(Number);
    const durationMin = Math.max(5, eh * 60 + em - (sh * 60 + sm));
    const prods = Math.max(1, manualProducts);
    const minPerProd = Number((durationMin / prods).toFixed(1));
    const runNum = sessions.filter((s) => s.taskCode === task.fullTaskCode).length + 1;
    setSessions((prev) => [
      ...prev,
      { id: `${Date.now()}`, taskCode: task.fullTaskCode, taskName: task.taskName, runNumber: runNum, date: manualDate, startTime: manualStart, endTime: manualEnd, durationMinutes: durationMin, productCount: prods, minutesPerProduct: minPerProd, performerTitle }
    ]);
  };

  const handleExport = () => {
    const fileName = exportPersonalTimerWorkbook(unit, selectedVtvlSuffix, performerTitle, tasksForPosition, sessions, manualDate);
    recordActivity(unit.code, unit.nameVi, 'BAM_GIO', `Kết xuất phiếu kê khai định mức thời gian: ${fileName}`);
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-3">
          <WorkflowSidebar activeStep={3} unitCode={unit.code} />
        </div>

        <div className="lg:col-span-9 space-y-5 min-w-0">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] p-3.5 sm:p-5 space-y-4 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-white font-extrabold text-xs flex items-center justify-center mr-2">3</span>
                <h1 className="text-base sm:text-lg font-extrabold text-[var(--foreground)]">
                  Bước 3: Đo định mức thời gian tại [{unit.code}] {unit.nameVi}
                </h1>
                <InfoTip title="Hướng dẫn đo định mức (Biểu 3. B1_KhoiLuong)">
                  <p>Hệ thống tự động giữ nguyên đơn vị <strong>[{unit.code}] {unit.nameVi}</strong> cùng các Tên VTVL cụ thể và Bậc nghề nghiệp đã đặt ở Bước 1.</p>
                  <p>Khi bấm <strong>Xuất phiếu định mức (.xlsx)</strong>, phiếu được tải về máy đồng thời tự động chuyển sang <strong>Bước 4 (Gộp phiếu)</strong>.</p>
                </InfoTip>
              </div>
              <Link href="/tao-tep?step=4" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[var(--primary)] text-white text-xs font-bold hover:opacity-95">
                <span>Sang Bước 4: Gộp phiếu ({unit.code})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[var(--foreground)]">Đơn vị (đã chọn ở Bước 1)</label>
                  <Link href="/tao-tep?step=1" className="text-[11px] font-bold text-[var(--primary)] hover:underline">Đổi tại Bước 1</Link>
                </div>
                <div className="w-full rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/[0.06] px-3 py-2 text-xs sm:text-sm font-extrabold text-[var(--foreground)] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[var(--primary)] shrink-0" />
                  <span className="truncate">[{unit.code}] {unit.nameVi}</span>
                </div>
              </div>
              <div className="sm:col-span-4">
                <label htmlFor="task-3-vtvl" className="block text-xs font-bold mb-1">Vị trí việc làm cụ thể tại [{unit.code}]</label>
                <select id="task-3-vtvl" value={selectedVtvlSuffix} onChange={(e) => setSelectedVtvlSuffix(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs sm:text-sm font-semibold">
                  {vtvlOptions.map((v) => <option key={v.suffix} value={v.suffix}>[{v.code}] {v.name} — {v.level}</option>)}
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold mb-1">Chức danh &amp; bậc kê khai</label>
                <input type="text" value={performerTitle} onChange={(e) => setPerformerTitle(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs sm:text-sm font-semibold" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tasksForPosition.map((t) => (
                <div key={t.fullTaskCode} onClick={() => setActiveTaskCode(t.fullTaskCode)} className={`cursor-pointer rounded-xl border p-3 text-xs transition-all ${activeTaskCode === t.fullTaskCode ? 'border-[var(--primary)] bg-[var(--primary)]/[0.06] ring-1 ring-[var(--primary)]/20' : 'border-[var(--border)] bg-[var(--background)]'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-[var(--primary)]">{t.fullTaskCode}</span>
                    <span className="text-[11px] text-[var(--ink-subtle)]">Nhóm {t.romanGroup} · Chuẩn: <strong>{t.defaultMinutesPerProduct} phút/SP</strong></span>
                  </div>
                  <p className="mt-1 font-medium text-[var(--foreground)] line-clamp-2">{t.taskName}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center"><Timer className="w-5 h-5" /></div>
                <div>
                  <div className="text-[11px] text-[var(--ink-muted)]">Đang đo mã <code className="font-mono font-bold text-[var(--primary)]">{activeTaskCode}</code></div>
                  <div className="text-2xl font-extrabold font-mono text-[var(--foreground)] tabular-nums">{formatTimer(elapsedSec)}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button id="task-3-timer" type="button" onClick={() => setRunning(!running)} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-[var(--primary)] text-white text-xs font-bold cursor-pointer">
                  {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{running ? 'Tạm dừng' : 'Bắt đầu đo'}</span>
                </button>
                <div className="flex items-center gap-1 text-xs">
                  <span>Số SP:</span>
                  <input type="number" min={1} value={productCountInput} onChange={(e) => setProductCountInput(Math.max(1, parseInt(e.target.value || '1', 10)))} className="w-14 rounded-lg border border-[var(--border)] bg-[var(--sheet)] px-2 py-1 text-center font-bold" />
                </div>
                <button type="button" onClick={handleFinishLiveTimer} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-[var(--ok)] text-white text-xs font-bold cursor-pointer">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ghi nhận</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleAddManualSession} className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 items-end">
              <div>
                <label className="block text-[11px] font-bold mb-1">Ngày thực hiện</label>
                <input type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs" />
              </div>
              <div>
                <label htmlFor="task-3-manual" className="block text-[11px] font-bold mb-1">Giờ bắt đầu</label>
                <input id="task-3-manual" type="time" value={manualStart} onChange={(e) => setManualStart(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs" />
              </div>
              <div>
                <label className="block text-[11px] font-bold mb-1">Giờ kết thúc</label>
                <input type="time" value={manualEnd} onChange={(e) => setManualEnd(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs" />
              </div>
              <div>
                <label className="block text-[11px] font-bold mb-1">Số sản phẩm</label>
                <input type="number" min={1} value={manualProducts} onChange={(e) => setManualProducts(Math.max(1, parseInt(e.target.value || '1', 10)))} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs font-bold" />
              </div>
              <button type="submit" className="col-span-2 sm:col-span-1 h-8.5 rounded-xl bg-[var(--sheet)] border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white font-bold text-xs inline-flex items-center justify-center gap-1 cursor-pointer transition-colors">
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm bản ghi</span>
              </button>
            </form>

            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <strong className="text-xs sm:text-sm text-[var(--foreground)]">Nhật ký đã ghi tại [{unit.code}] ({sessions.length} bản ghi)</strong>
                <button id="task-3-export" type="button" onClick={handleExport} className="w-full sm:w-auto justify-center inline-flex items-center gap-1.5 min-h-9 py-1.5 px-4 rounded-xl bg-[var(--primary)] text-white font-bold text-xs cursor-pointer shadow-2xs">
                  <Download className="w-3.5 h-3.5 shrink-0" />
                  <span>Xuất phiếu định mức [{unit.code}] (.xlsx) &amp; Đính kèm sang Bước 4</span>
                </button>
              </div>

              {sessions.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-[var(--background)] border-b border-[var(--border)]">
                        <th className="py-2 px-2.5 text-left">Mã CV</th>
                        <th className="py-2 px-2.5 text-left">Lượt</th>
                        <th className="py-2 px-2.5 text-left">Thời gian</th>
                        <th className="py-2 px-2.5 text-right">Phút</th>
                        <th className="py-2 px-2.5 text-right">SP</th>
                        <th className="py-2 px-2.5 text-right">Phút/SP</th>
                        <th className="py-2 px-2.5 text-center">Xóa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((s) => (
                        <tr key={s.id} className="border-b border-[var(--border-subtle)]">
                          <td className="py-1.5 px-2.5 font-mono font-bold text-[var(--primary)]">{s.taskCode}</td>
                          <td className="py-1.5 px-2.5 tabular-nums">Lần {s.runNumber}</td>
                          <td className="py-1.5 px-2.5">{s.startTime} – {s.endTime}</td>
                          <td className="py-1.5 px-2.5 text-right tabular-nums">{s.durationMinutes}</td>
                          <td className="py-1.5 px-2.5 text-right tabular-nums">{s.productCount}</td>
                          <td className="py-1.5 px-2.5 text-right font-extrabold text-[var(--ok)] tabular-nums">{s.minutesPerProduct}</td>
                          <td className="py-1.5 px-2.5 text-center">
                            <button type="button" onClick={() => setSessions((prev) => prev.filter((x) => x.id !== s.id))} className="text-[#ED1C24] hover:opacity-80 cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
