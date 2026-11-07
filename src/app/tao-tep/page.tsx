'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { FileSpreadsheet, ArrowRight, ArrowLeft, RotateCcw, BookOpenCheck, Timer, Plus, Copy, Trash2, AlertCircle } from 'lucide-react';
import { WorkflowSidebar, InfoTip, focusTaskTarget } from '@/components/layout/MilestonesBar';
import { HCMUTE_UNITS, UNIT_GROUPS } from '@/configs/hcmute-units';
import { HD07_CONSTANTS } from '@/configs/hcmute-hd07-catalog';
import { ND232_2026_VTVL_CATALOG, buildDefaultProposedPositionsForUnit, buildProposedPositionFromFramework } from '@/configs/hcmute-nd232-catalog';
import { HcmuteVtvlGroup4, ProposedVtvlRow, SplitResultSummary, UnitGroupKind, WorkforceMethod } from '@/types/vtvl';
import { generateUnitFiles } from '@/services/excel-split/workbook-builder';
import { MergeStepSection } from '@/components/tao-tep/MergeStepSection';
import { SplitResultBanner } from '@/components/tao-tep/SplitResultBanner';
import { Hd07OrderGuideCard } from '@/components/tao-tep/Hd07OrderGuideCard';
import { getActiveUnitSession, recordActivity, saveActiveUnitSession, setSessionRootWorkbook } from '@/services/telemetry/activity-log';
import { syncUnitSplitToSupabase } from '@/services/supabase/vtvl-sync';

const METHODS: WorkforceMethod[] = ['PP1', 'PP2', 'PP3', 'PP1+PP2', 'PP2+PP3'];
const FOUR_GROUPS: HcmuteVtvlGroup4[] = ['I. Nhóm VTVL Quản lý', 'II. Nhóm VTVL Chuyên môn, nghiệp vụ', 'III. Nhóm VTVL Hỗ trợ', 'IV. Nhóm VTVL Phục vụ'];
const ROLE_PRESETS = [
  'Trưởng đơn vị (Trưởng khoa / Viện trưởng / Trưởng phòng / Giám đốc)',
  'Phó Trưởng đơn vị phụ trách VTVL',
  'Thư ký Tổ công tác VTVL đơn vị',
  'Trưởng Bộ môn / Trưởng Ngành',
  'Chuyên viên / Thư ký khoa tổng hợp hồ sơ'
];

export default function TaoTepPage() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [kind, setKind] = useState<UnitGroupKind>('khoa-vien');
  const [selectedUnitCode, setSelectedUnitCode] = useState<string>('FME');
  const [customDate, setCustomDate] = useState<string>('2026-11-07');
  const [actorEmail, setActorEmail] = useState<string>('');
  const [actorTitle, setActorTitle] = useState<string>('');
  const [actorError, setActorError] = useState<string | null>(null);
  const [includeZip, setIncludeZip] = useState<boolean>(true);
  const [positions, setPositions] = useState<ProposedVtvlRow[]>(() => buildDefaultProposedPositionsForUnit('Khoa Cơ khí Chế tạo máy', 'khoa-vien'));
  const [newFwId, setNewFwId] = useState<string>('HD1907-II-08');
  const [loading, setLoading] = useState<boolean>(false);
  const [stale, setStale] = useState<boolean>(false);
  const [result, setResult] = useState<SplitResultSummary | null>(null);

  useEffect(() => {
    const saved = getActiveUnitSession();
    setKind(saved.kind); setSelectedUnitCode(saved.unitCode); setCustomDate(saved.customDate);
    setActorEmail(saved.actorEmail); setActorTitle(saved.actorTitle); setPositions(saved.proposedPositions);
    const sp = new URLSearchParams(window.location.search).get('step');
    if (sp === '2' || window.location.hash === '#buoc-3') setActiveStep(2);
    else if (sp === '4' || window.location.hash === '#buoc-4') setActiveStep(4);
  }, []);

  const unitsOfGroup = useMemo(() => HCMUTE_UNITS.filter((u) => u.group === kind), [kind]);
  const currentUnit = useMemo(() => unitsOfGroup.find((u) => u.code === selectedUnitCode) || unitsOfGroup[0] || HCMUTE_UNITS[0], [unitsOfGroup, selectedUnitCode]);

  const syncPositions = (next: ProposedVtvlRow[], unitCode = currentUnit.code, nextKind = kind) => {
    setPositions(next); saveActiveUnitSession({ unitCode, kind: nextKind, proposedPositions: next });
    if (result) setStale(true);
  };

  const handleGroupChange = (newKind: UnitGroupKind) => {
    setKind(newKind); const firstUnit = HCMUTE_UNITS.find((u) => u.group === newKind) || HCMUTE_UNITS[0];
    setSelectedUnitCode(firstUnit.code); syncPositions(buildDefaultProposedPositionsForUnit(firstUnit.nameVi, newKind), firstUnit.code, newKind);
  };
  const handleUnitChange = (newCode: string) => {
    setSelectedUnitCode(newCode); const u = HCMUTE_UNITS.find((x) => x.code === newCode) || HCMUTE_UNITS[0];
    syncPositions(buildDefaultProposedPositionsForUnit(u.nameVi, u.group), u.code, u.group);
    if (!actorEmail.trim()) focusTaskTarget('task-1-actor');
  };
  const handleActorChange = (nextEmail: string, nextTitle: string) => {
    setActorEmail(nextEmail); setActorTitle(nextTitle);
    if (nextEmail.trim() && nextTitle.trim()) setActorError(null);
    saveActiveUnitSession({ actorEmail: nextEmail, actorTitle: nextTitle });
  };
  const validateActor = (): boolean => {
    if (!actorEmail.trim() || !actorEmail.includes('@')) {
      setActorError('Bắt buộc nhập Email công vụ hợp lệ của người đang thực hiện (VD: ten@hcmute.edu.vn) ngay sau khi chọn đơn vị.');
      focusTaskTarget('task-1-actor');
      return false;
    }
    if (!actorTitle.trim()) {
      setActorError('Bắt buộc nhập hoặc chọn Chức vụ của người đang thực hiện tại đơn vị.');
      focusTaskTarget('task-1-role');
      return false;
    }
    setActorError(null);
    return true;
  };

  const handleUpdateRow = (id: string, patch: Partial<ProposedVtvlRow>) => syncPositions(positions.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const handleChangeRowFramework = (rowId: string, fwId: string) => {
    const idx = positions.findIndex((r) => r.id === rowId);
    const rebuilt = buildProposedPositionFromFramework(fwId, currentUnit.nameVi, kind, idx + 1);
    syncPositions(positions.map((r) => (r.id === rowId ? { ...rebuilt, id: rowId } : r)));
  };
  const handleAddPosition = () => syncPositions([...positions, buildProposedPositionFromFramework(newFwId, currentUnit.nameVi, kind, positions.length + 1)]);
  const handleDuplicateRow = (row: ProposedVtvlRow) => {
    const seq = positions.length + 1; const baseCode = row.vtvlSuffix.replace(/-\d+$/, '');
    syncPositions([...positions, { ...row, id: `pos-${Date.now()}-${seq}`, vtvlSuffix: `${baseCode}-${String(seq).padStart(2, '0')}`, specificName: `${row.specificName} (${seq})` }]);
  };
  const handleRemoveRow = (id: string) => { if (positions.length > 1) syncPositions(positions.filter((r) => r.id !== id)); };

  const handleCreateFiles = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateActor()) { setActiveStep(1); return; }
    setLoading(true); setStale(false);
    try {
      saveActiveUnitSession({ unitCode: currentUnit.code, kind, customDate, actorEmail: actorEmail.trim(), actorTitle: actorTitle.trim(), proposedPositions: positions });
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
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
  };

  const totalStaffD1 = positions.reduce((s, p) => s + p.staffCount, 0);
  const totalFteC3 = Number(positions.reduce((s, p) => s + p.proposedFte, 0).toFixed(2));
  const compactDate = customDate.replace(/-/g, '');

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-3">
          <WorkflowSidebar activeStep={activeStep} onSelectStep={(s) => { if (s > 1 && !validateActor()) return; setActiveStep(s); }} unitCode={currentUnit.code} />
        </div>

        <div className="lg:col-span-9 space-y-5 min-w-0">
          {activeStep === 1 && (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] p-3.5 sm:p-5 space-y-4 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-white font-extrabold text-xs flex items-center justify-center mr-2">1</span>
                  <h1 className="text-base sm:text-lg font-extrabold text-[var(--foreground)]">Bước 1: Chọn đơn vị, Người thực hiện &amp; Đề xuất Vị trí việc làm</h1>
                  <InfoTip title="Quyền tự chủ đề xuất VTVL tại đơn vị (HD số 02: 1907/HD-ĐHCNKT)">
                    <p><strong>1. Người thực hiện bắt buộc:</strong> Sau khi chọn đơn vị, bắt buộc nhập Email công vụ và Chức vụ người đang thực hiện để ghi nhận vào nhật ký thao tác phần mềm (<code className="font-mono">15. S_NhatKy</code> &amp; Supabase).</p>
                    <p><strong>2. Tạo mới / Tùy chỉnh VTVL:</strong> Đơn vị chủ động thêm vị trí từ 38 vị trí khung của Trường (04 nhóm), đặt Tên VTVL cụ thể, chọn Bậc nghề nghiệp, Phương pháp (<code className="font-mono">PP1/PP2/PP3</code>), Quỹ giờ chuẩn và FTE đề xuất.</p>
                  </InfoTip>
                </div>
                <button type="button" onClick={() => syncPositions(buildDefaultProposedPositionsForUnit(currentUnit.nameVi, kind))} className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] text-[var(--primary)] cursor-pointer">
                  <RotateCcw className="w-3 h-3" /><span>Khôi phục mặc định</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {UNIT_GROUPS.map((g) => (
                  <button key={g.id} type="button" title={g.factsText} onClick={() => handleGroupChange(g.id)} className={`rounded-xl border px-3 py-2 text-center transition-all cursor-pointer ${kind === g.id ? 'border-[var(--primary)] bg-[var(--primary)]/[0.08] font-extrabold text-[var(--primary)] ring-1 ring-[var(--primary)]/20' : 'border-[var(--border)] bg-[var(--background)] font-bold text-[var(--foreground)] hover:border-[var(--primary)]/40'}`}>
                    <span className="text-xs">{g.label}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-7">
                  <label htmlFor="task-1-unit" className="block text-xs font-bold text-[var(--foreground)] mb-1">1. Chọn đơn vị thuộc HCM-UTE ({unitsOfGroup.length} đơn vị)</label>
                  <select id="task-1-unit" value={currentUnit.code} onChange={(e) => handleUnitChange(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs sm:text-sm font-semibold">
                    {unitsOfGroup.map((u) => <option key={u.code} value={u.code}>[{u.code}] {u.nameVi}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2"><label className="block text-xs font-bold text-[var(--foreground)] mb-1">Mã đơn vị</label><input type="text" readOnly value={currentUnit.code} className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-xs sm:text-sm font-mono font-bold text-[var(--primary)]" /></div>
                <div className="sm:col-span-3"><label className="block text-xs font-bold text-[var(--foreground)] mb-1">Ngày lập hồ sơ</label><input type="date" value={customDate} onChange={(e) => { setCustomDate(e.target.value); saveActiveUnitSession({ customDate: e.target.value }); }} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs sm:text-sm" /></div>
              </div>

              {/* Thông tin người đang thực hiện bắt buộc ngay sau khi chọn đơn vị */}
              <div className={`rounded-xl border p-3 space-y-2 ${actorError ? 'border-[#ED1C24] bg-[#ED1C24]/[0.04]' : 'border-[var(--primary)]/35 bg-[var(--primary)]/[0.03]'}`}>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-6">
                    <label htmlFor="task-1-actor" className="block text-xs font-extrabold text-[var(--foreground)] mb-1">2. Email công vụ người đang thực hiện <span className="text-[#ED1C24]">*</span></label>
                    <input id="task-1-actor" type="email" required value={actorEmail} onChange={(e) => handleActorChange(e.target.value, actorTitle)} placeholder={`VD: ${currentUnit.code.toLowerCase()}@hcmute.edu.vn`} className="w-full rounded-xl border border-[var(--border)] bg-[var(--sheet)] px-3 py-2 text-xs sm:text-sm font-semibold text-[var(--foreground)] focus:border-[var(--primary)]" />
                  </div>
                  <div className="sm:col-span-6">
                    <label htmlFor="task-1-role" className="block text-xs font-extrabold text-[var(--foreground)] mb-1">3. Chức vụ / Vai trò người đang thực hiện <span className="text-[#ED1C24]">*</span></label>
                    <input id="task-1-role" type="text" list="hcmute-actor-roles" required value={actorTitle} onChange={(e) => handleActorChange(actorEmail, e.target.value)} placeholder={`VD: ${currentUnit.headTitleVi} / Thư ký Đề án VTVL đơn vị`} className="w-full rounded-xl border border-[var(--border)] bg-[var(--sheet)] px-3 py-2 text-xs sm:text-sm font-semibold text-[var(--foreground)] focus:border-[var(--primary)]" />
                    <datalist id="hcmute-actor-roles">{ROLE_PRESETS.map((r) => <option key={r} value={r} />)}</datalist>
                  </div>
                </div>
                {actorError && <p className="text-xs font-bold text-[#ED1C24] flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 shrink-0" /><span>{actorError}</span></p>}
              </div>

              <div className="rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/[0.04] p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs font-extrabold text-[var(--primary)] shrink-0">Thêm VTVL từ Khung Trường:</span>
                  <select id="task-1-add" value={newFwId} onChange={(e) => setNewFwId(e.target.value)} className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--sheet)] px-2.5 py-1.5 text-xs font-bold text-[var(--foreground)]">
                    {FOUR_GROUPS.map((gCode) => <optgroup key={gCode} label={gCode}>{ND232_2026_VTVL_CATALOG.filter((item) => item.vtvlGroup4 === gCode).map((item) => <option key={item.maDanhMucNd232} value={item.maDanhMucNd232}>[{item.ttToanTruong}] {item.positionName} ({item.careerLevel}) — Mã {item.maChucDanhTt31}</option>)}</optgroup>)}
                  </select>
                </div>
                <button type="button" onClick={handleAddPosition} className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-lg bg-[var(--primary)] text-white text-xs font-bold cursor-pointer shrink-0 shadow-2xs"><Plus className="w-3.5 h-3.5" /><span>Thêm vị trí vào đơn vị</span></button>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--sheet)]">
                        <th className="py-2 px-2 text-left min-w-[175px]">Khung VTVL của Trường</th><th className="py-2 px-2 text-left min-w-[210px]">Mã &amp; Tên VTVL cụ thể đề xuất</th><th className="py-2 px-2 text-left min-w-[135px]">Bậc nghề nghiệp</th><th className="py-2 px-2 text-left min-w-[140px]">Phương pháp &amp; Giờ</th><th className="py-2 px-2 text-right">Hiện có D1</th><th className="py-2 px-2 text-right">Đề xuất C3</th><th className="py-2 px-2 text-center">Tác vụ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((pos) => (
                        <tr key={pos.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--sheet)]/60">
                          <td className="py-2 px-2 align-top">
                            <select value={pos.frameworkId} onChange={(e) => handleChangeRowFramework(pos.id, e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-[var(--sheet)] px-2 py-1 text-xs font-bold text-[var(--foreground)]">
                              {FOUR_GROUPS.map((gCode) => <optgroup key={gCode} label={gCode}>{ND232_2026_VTVL_CATALOG.filter((item) => item.vtvlGroup4 === gCode).map((item) => <option key={item.maDanhMucNd232} value={item.maDanhMucNd232}>{item.positionName}</option>)}</optgroup>)}
                            </select>
                            <span className="text-[10px] text-[var(--ink-muted)] block mt-0.5 font-mono">{pos.ngachCode} · {pos.vtvlGroup4.replace('. Nhóm VTVL ', '. ')}</span>
                          </td>
                          <td className="py-2 px-2 align-top space-y-1">
                            <input data-task="task-1-name" type="text" value={pos.specificName} onChange={(e) => handleUpdateRow(pos.id, { specificName: e.target.value })} className="w-full rounded-lg border border-[var(--border)] bg-[var(--sheet)] px-2 py-1 text-xs font-bold text-[var(--foreground)] focus:border-[var(--primary)]" />
                            <div className="flex items-center gap-1"><span className="text-[10px] font-mono text-[var(--ink-muted)]">{currentUnit.code}-</span><input type="text" value={pos.vtvlSuffix} onChange={(e) => handleUpdateRow(pos.id, { vtvlSuffix: e.target.value.toUpperCase() })} className="w-24 rounded border border-[var(--border-subtle)] bg-[var(--sheet)] px-1.5 py-0.5 text-[10px] font-mono font-bold text-[var(--primary)]" /></div>
                          </td>
                          <td className="py-2 px-2 align-top">
                            {pos.allowedLevels.length > 1 ? (
                              <select data-task="task-1-level" value={pos.careerLevel} onChange={(e) => handleUpdateRow(pos.id, { careerLevel: e.target.value })} className="w-full rounded-lg border border-[var(--primary)]/50 bg-[var(--sheet)] px-2 py-1 text-xs font-bold text-[var(--primary)]">{pos.allowedLevels.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}</select>
                            ) : <span className="inline-block rounded-lg border border-[var(--border-subtle)] bg-[var(--muted)]/60 px-2 py-1 text-[11px] font-bold text-[var(--ink-muted)]">{pos.careerLevel}</span>}
                          </td>
                          <td className="py-2 px-2 align-top space-y-1">
                            <select data-task="task-1-params" value={pos.method} onChange={(e) => handleUpdateRow(pos.id, { method: e.target.value as WorkforceMethod })} className="w-full rounded-lg border border-[var(--border)] bg-[var(--sheet)] px-1.5 py-0.5 text-[11px] font-bold text-[var(--foreground)]">{METHODS.map((m) => <option key={m} value={m}>{m}</option>)}</select>
                            <select value={pos.standardHoursYear} onChange={(e) => { const h = Number(e.target.value); handleUpdateRow(pos.id, { standardHoursYear: h, workingRegime: h === 1760 ? 'Đặc thù' : 'Phổ biến (40 giờ/tuần)' }); }} className="w-full rounded-lg border border-[var(--border)] bg-[var(--sheet)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--ink-muted)]"><option value={1904}>1.904h (Phổ biến)</option><option value={1760}>1.760h (Đặc thù GV)</option></select>
                          </td>
                          <td className="py-2 px-2 align-top text-right"><input data-task="task-1-staff" type="number" min={0} max={200} value={pos.staffCount} onChange={(e) => handleUpdateRow(pos.id, { staffCount: Math.max(0, parseInt(e.target.value || '0', 10)) })} className="w-14 text-right rounded-lg border border-[var(--border)] bg-[var(--sheet)] px-1.5 py-1 font-bold tabular-nums" /></td>
                          <td className="py-2 px-2 align-top text-right"><input type="number" min={0} max={200} step="0.5" value={pos.proposedFte} onChange={(e) => handleUpdateRow(pos.id, { proposedFte: Math.max(0, parseFloat(e.target.value || '0')) })} className="w-14 text-right rounded-lg border border-[var(--primary)]/50 bg-[var(--sheet)] px-1.5 py-1 font-extrabold text-[var(--primary)] tabular-nums" /></td>
                          <td className="py-2 px-2 align-top text-center"><div className="inline-flex items-center gap-1"><button type="button" title="Nhân bản vị trí này" onClick={() => handleDuplicateRow(pos)} className="p-1 rounded hover:bg-[var(--primary)]/10 text-[var(--primary)] cursor-pointer"><Copy className="w-3.5 h-3.5" /></button><button type="button" title="Xóa vị trí này" disabled={positions.length <= 1} onClick={() => handleRemoveRow(pos.id)} className="p-1 rounded hover:bg-[#ED1C24]/10 text-[#ED1C24] disabled:opacity-30 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                  <span>Đơn vị: <strong>[{currentUnit.code}] {currentUnit.nameVi}</strong></span><span>· Tổng VTVL: <strong>{positions.length}</strong></span><span>· Nhân sự D1: <strong>{totalStaffD1}</strong></span><span>· Đề xuất C3: <strong className="text-[var(--primary)]">{totalFteC3} FTE</strong></span>
                </div>
                <button type="button" disabled={loading} onClick={() => void handleCreateFiles()} className="w-full sm:w-auto justify-center inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[var(--primary)] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-2xs cursor-pointer disabled:opacity-50"><FileSpreadsheet className="w-4 h-4 shrink-0" /><span>{loading ? 'Đang khởi tạo…' : 'Lưu đề xuất & Sang Bước 2 (Xuất tệp)'}</span><ArrowRight className="w-4 h-4 shrink-0" /></button>
              </div>
            </section>
          )}

          {activeStep === 2 && (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] p-3.5 sm:p-5 space-y-4 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-white font-extrabold text-xs flex items-center justify-center mr-2">2</span>
                  <h1 className="text-base sm:text-lg font-extrabold text-[var(--foreground)]">Bước 2: Kết xuất tệp gốc ({currentUnit.code}_K2526_v1_{compactDate}.xlsx) &amp; gói phiếu (.zip)</h1>
                </div>
                <button type="button" onClick={() => setActiveStep(1)} className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] text-[var(--foreground)] cursor-pointer"><ArrowLeft className="w-3.5 h-3.5" /><span>Quay lại Bước 1</span></button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-[var(--foreground)] cursor-pointer">
                  <input id="task-2-zip" type="checkbox" checked={includeZip} onChange={(e) => setIncludeZip(e.target.checked)} className="accent-[var(--primary)]" />
                  <span>Kết xuất kèm gói tệp nén (.zip) chứa phiếu khảo sát theo {positions.length} vị trí đề xuất của <strong>[{currentUnit.code}]</strong></span>
                </label>
                <button id="task-2-export" type="button" disabled={loading} onClick={() => void handleCreateFiles()} className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-[var(--primary)] text-white font-bold text-xs cursor-pointer">
                  <FileSpreadsheet className="w-3.5 h-3.5" /><span>{result && !stale ? 'Tạo lại bộ biểu' : `Khởi tạo bộ biểu ${currentUnit.code}`}</span>
                </button>
              </div>

              {result ? <SplitResultBanner result={result} onDownload={triggerDownload} /> : <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-xs text-[var(--ink-muted)]">Bấm nút <strong>Khởi tạo bộ biểu {currentUnit.code}</strong> ở trên để sinh tệp Excel 21 trang tính và gói phiếu khảo sát (.zip).</div>}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <Link href="/bam-gio" className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] text-xs font-bold text-[var(--foreground)]"><Timer className="w-3.5 h-3.5 text-[var(--primary)]" /><span>Sang Bước 3: Đo định mức ({currentUnit.code})</span></Link>
                <button type="button" onClick={() => setActiveStep(4)} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[var(--primary)] text-white text-xs font-bold cursor-pointer"><span>Tiếp tục sang Bước 4: Gộp phiếu ({currentUnit.code})</span><ArrowRight className="w-3.5 h-3.5" /></button>
              </div>
            </section>
          )}

          {activeStep === 4 && (
            <div className="space-y-4">
              <MergeStepSection unit={currentUnit} />
              <div className="flex items-center justify-between">
                <button type="button" onClick={() => setActiveStep(2)} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-[var(--border)] bg-[var(--sheet)] text-xs font-bold text-[var(--foreground)] cursor-pointer"><ArrowLeft className="w-3.5 h-3.5" /><span>Quay lại Bước 2</span></button>
                <Link href="/ra-soat" className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-[var(--primary)] text-white text-xs sm:text-sm font-bold shadow-2xs"><span>Tiếp tục sang Bước 5: Thẩm định chéo ({currentUnit.code})</span><ArrowRight className="w-4 h-4" /></Link>
              </div>
            </div>
          )}

          <details className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] overflow-hidden shadow-2xs">
            <summary className="cursor-pointer px-5 py-3.5 text-xs sm:text-sm font-extrabold text-[var(--foreground)] flex items-center justify-between bg-[var(--background)]/60">
              <span className="inline-flex items-center gap-2"><BookOpenCheck className="w-4 h-4 text-[var(--primary)]" /><span>Tra cứu Khung 38 vị trí việc làm HCM-UTE, Bảng chuẩn ERD &amp; Tải dự thảo Tờ trình của [{currentUnit.code}]</span></span>
              <span className="text-[11px] font-bold text-[var(--primary)]">Bấm để mở / đóng</span>
            </summary>
            <div className="p-4 border-t border-[var(--border-subtle)]"><Hd07OrderGuideCard unit={currentUnit} splitResult={result} /></div>
          </details>
        </div>
      </div>
    </div>
  );
}
