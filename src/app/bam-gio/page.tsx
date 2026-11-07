'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Timer, Play, Pause, Plus, Download, CheckCircle2, Trash2, ArrowRight } from 'lucide-react';
import { MilestonesBar } from '@/components/layout/MilestonesBar';
import { HCMUTE_UNITS } from '@/configs/hcmute-units';
import { TASK_TEMPLATES_BY_GROUP } from '@/configs/hcmute-quotas';
import { TimeSessionRow } from '@/types/vtvl';
import { exportPersonalTimerWorkbook } from '@/services/excel-split/personal-timer-export';
import { recordActivity } from '@/services/telemetry/activity-log';

export default function BamGioPage() {
  const [selectedUnitCode, setSelectedUnitCode] = useState<string>('FME');
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

  const unit = useMemo(() => HCMUTE_UNITS.find((u) => u.code === selectedUnitCode) || HCMUTE_UNITS[0], [selectedUnitCode]);
  const tasksOfUnit = useMemo(() => {
    const list = TASK_TEMPLATES_BY_GROUP[unit.group];
    return list.map((t) => ({ ...t, fullVtvlCode: `${unit.code}-${t.vtvlSuffix}`, fullTaskCode: `${unit.code}-${t.taskSuffix}` }));
  }, [unit]);

  const vtvlOptions = useMemo(() => {
    const map = new Map<string, { suffix: string; code: string; name: string }>();
    tasksOfUnit.forEach((t) => {
      if (!map.has(t.vtvlSuffix)) map.set(t.vtvlSuffix, { suffix: t.vtvlSuffix, code: t.fullVtvlCode, name: t.vtvlName });
    });
    return Array.from(map.values());
  }, [tasksOfUnit]);

  const tasksForPosition = useMemo(() => tasksOfUnit.filter((t) => t.vtvlSuffix === selectedVtvlSuffix), [tasksOfUnit, selectedVtvlSuffix]);

  useEffect(() => {
    if (tasksForPosition.length > 0 && !activeTaskCode) setActiveTaskCode(tasksForPosition[0].fullTaskCode);
  }, [tasksForPosition, activeTaskCode]);

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
    setRunning(false);
    setElapsedSec(0);
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
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--sheet)] p-5 sm:p-7 space-y-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
              PHÂN HỆ ĐO ĐỊNH MỨC THỜI GIAN THỰC HIỆN CÔNG VIỆC (BƯỚC 3 — BIỂU 3. B1_KHOILUONG)
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] mt-1">
              Đo định mức thời gian thực hiện sản phẩm (Trung bình phút/sản phẩm)
            </h1>
            <p className="text-xs sm:text-sm text-[var(--ink-muted)] mt-1 max-w-3xl leading-relaxed">
              Viên chức lựa chọn đơn vị công tác và vị trí việc làm đảm nhiệm, thực hiện đo trực tiếp hoặc kê khai nhật ký thời gian thực hiện công việc để kết xuất phiếu định mức cá nhân chuẩn 19 cột (Cột D biểu <code className="font-mono">3. B1_KhoiLuong</code>).
            </p>
          </div>
          <Link href="/tao-tep#buoc-4" className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] hover:underline shrink-0">
            <span>Chuyển tới Bước 4: Tổng hợp phiếu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <MilestonesBar />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-3xl border border-[var(--border)] bg-[var(--sheet)] p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-[var(--primary)] text-white font-extrabold text-xs flex items-center justify-center">1</span>
            <h2 className="text-base font-extrabold text-[var(--foreground)]">Bước 3.1: Chọn đơn vị và vị trí việc làm</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold mb-1">Đơn vị công tác thuộc HCM-UTE</label>
              <select
                value={selectedUnitCode}
                onChange={(e) => {
                  const newCode = e.target.value;
                  setSelectedUnitCode(newCode);
                  const u = HCMUTE_UNITS.find((x) => x.code === newCode) || HCMUTE_UNITS[0];
                  const firstSuffix = TASK_TEMPLATES_BY_GROUP[u.group][0]?.vtvlSuffix || 'QL-01';
                  setSelectedVtvlSuffix(firstSuffix);
                  setActiveTaskCode(`${u.code}-${TASK_TEMPLATES_BY_GROUP[u.group][0]?.taskSuffix}`);
                }}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold"
              >
                {HCMUTE_UNITS.map((u) => (
                  <option key={u.code} value={u.code}>[{u.code}] {u.nameVi}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Vị trí việc làm đảm nhiệm (Biểu 6. C1_VTVL)</label>
              <select value={selectedVtvlSuffix} onChange={(e) => setSelectedVtvlSuffix(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold">
                {vtvlOptions.map((v) => (
                  <option key={v.suffix} value={v.suffix}>[{v.code}] {v.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Chức danh viên chức kê khai</label>
              <input type="text" value={performerTitle} onChange={(e) => setPerformerTitle(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-3 space-y-2">
            <div className="text-xs font-bold text-[var(--foreground)]">Danh mục công việc thuộc vị trí ({tasksForPosition.length} đầu việc):</div>
            {tasksForPosition.map((t) => (
              <div key={t.fullTaskCode} onClick={() => setActiveTaskCode(t.fullTaskCode)} className={`cursor-pointer rounded-xl border p-3 text-xs transition-all ${activeTaskCode === t.fullTaskCode ? 'border-[var(--primary)] bg-[var(--primary)]/[0.06]' : 'border-[var(--border)] bg-[var(--background)]'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-[var(--primary)]">{t.fullTaskCode}</span>
                  <span className="text-[11px] text-[var(--ink-subtle)]">Nhóm {t.romanGroup} · Định mức chuẩn: <strong>{t.defaultMinutesPerProduct} phút/SP</strong></span>
                </div>
                <p className="mt-1 font-medium text-[var(--foreground)]">{t.taskName}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--sheet)] p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-[var(--primary)] text-white font-extrabold text-xs flex items-center justify-center">2</span>
              <h2 className="text-base font-extrabold text-[var(--foreground)]">Bước 3.2: Ghi nhận thời gian thực hiện đối với mã <code className="font-mono text-[var(--primary)]">{activeTaskCode}</code></h2>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center"><Timer className="w-5 h-5" /></div>
                <div>
                  <div className="text-xs text-[var(--ink-muted)]">Bộ đếm thời gian xử lý trực tiếp</div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--foreground)] tabular-nums">{formatTimer(elapsedSec)}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => setRunning(!running)} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold cursor-pointer">
                  {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{running ? 'Tạm dừng' : 'Bắt đầu đo'}</span>
                </button>
                <div className="flex items-center gap-1.5 text-xs">
                  <span>Số SP:</span>
                  <input type="number" min={1} value={productCountInput} onChange={(e) => setProductCountInput(Math.max(1, parseInt(e.target.value || '1', 10)))} className="w-16 rounded-lg border border-[var(--border)] bg-[var(--sheet)] px-2 py-1 text-center font-bold" />
                </div>
                <button type="button" onClick={handleFinishLiveTimer} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-[var(--ok)] text-white text-xs font-bold cursor-pointer">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ghi nhận</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleAddManualSession} className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 items-end pt-1">
              <div>
                <label className="block text-[11px] font-bold mb-1">Ngày thực hiện</label>
                <input type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-2.5 py-2 text-xs" />
              </div>
              <div>
                <label className="block text-[11px] font-bold mb-1">Giờ bắt đầu</label>
                <input type="time" value={manualStart} onChange={(e) => setManualStart(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-2.5 py-2 text-xs" />
              </div>
              <div>
                <label className="block text-[11px] font-bold mb-1">Giờ kết thúc</label>
                <input type="time" value={manualEnd} onChange={(e) => setManualEnd(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-2.5 py-2 text-xs" />
              </div>
              <div>
                <label className="block text-[11px] font-bold mb-1">Số sản phẩm</label>
                <input type="number" min={1} value={manualProducts} onChange={(e) => setManualProducts(Math.max(1, parseInt(e.target.value || '1', 10)))} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-2.5 py-2 text-xs font-bold" />
              </div>
              <button type="submit" className="h-9 rounded-xl bg-[var(--sheet)] border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white font-bold text-xs inline-flex items-center justify-center gap-1 cursor-pointer transition-colors">
                <Plus className="w-3.5 h-3.5" />
                <span>Bổ sung bản ghi</span>
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--sheet)] p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-[var(--primary)] text-white font-extrabold text-xs flex items-center justify-center">3</span>
                <h2 className="text-base font-extrabold text-[var(--foreground)]">Bước 3.3: Nhật ký định mức ({sessions.length} bản ghi) và kết xuất phiếu (.xlsx)</h2>
              </div>
              <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[var(--primary)] text-white font-bold text-xs cursor-pointer shadow-2xs">
                <Download className="w-4 h-4" />
                <span>Xuất phiếu kê khai định mức cá nhân (.xlsx)</span>
              </button>
            </div>

            {sessions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] p-5 text-center text-xs text-[var(--ink-muted)]">
                Chưa có bản ghi định mức thời gian. Viên chức sử dụng bộ đếm trực tiếp hoặc bổ sung bản ghi theo khung giờ làm việc thực tế ở mục trên.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-[var(--background)] border-b border-[var(--border)]">
                      <th className="py-2 px-3 text-left">Mã công việc</th>
                      <th className="py-2 px-3 text-left">Lượt đo</th>
                      <th className="py-2 px-3 text-left">Khung thời gian</th>
                      <th className="py-2 px-3 text-right">Tổng phút</th>
                      <th className="py-2 px-3 text-right">Số SP</th>
                      <th className="py-2 px-3 text-right">Phút/SP</th>
                      <th className="py-2 px-3 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr key={s.id} className="border-b border-[var(--border-subtle)]">
                        <td className="py-2 px-3 font-mono font-bold text-[var(--primary)]">{s.taskCode}</td>
                        <td className="py-2 px-3 tabular-nums">Lần {s.runNumber}</td>
                        <td className="py-2 px-3">{s.startTime} – {s.endTime}</td>
                        <td className="py-2 px-3 text-right tabular-nums">{s.durationMinutes}</td>
                        <td className="py-2 px-3 text-right tabular-nums">{s.productCount}</td>
                        <td className="py-2 px-3 text-right font-extrabold text-[var(--ok)] tabular-nums">{s.minutesPerProduct}</td>
                        <td className="py-2 px-3 text-center">
                          <button type="button" onClick={() => setSessions((prev) => prev.filter((x) => x.id !== s.id))} className="text-[#ED1C24] hover:opacity-80 cursor-pointer" title="Xóa bản ghi">
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
        </div>
      </div>
    </div>
  );
}
