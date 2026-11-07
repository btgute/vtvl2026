'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { FileSpreadsheet, ArrowRight, ArrowLeft, RotateCcw, BookOpenCheck, Timer } from 'lucide-react';
import { WorkflowSidebar, InfoTip } from '@/components/layout/MilestonesBar';
import { HCMUTE_UNITS, UNIT_GROUPS } from '@/configs/hcmute-units';
import { NGACH_LIST_BY_GROUP } from '@/configs/hcmute-quotas';
import { HD07_CONSTANTS } from '@/configs/hcmute-hd07-catalog';
import { buildDefaultSpecificVtvlName } from '@/configs/hcmute-nd232-catalog';
import { SplitResultSummary, UnitGroupKind } from '@/types/vtvl';
import { generateUnitFiles } from '@/services/excel-split/workbook-builder';
import { MergeStepSection } from '@/components/tao-tep/MergeStepSection';
import { SplitResultBanner } from '@/components/tao-tep/SplitResultBanner';
import { Hd07OrderGuideCard } from '@/components/tao-tep/Hd07OrderGuideCard';
import { recordActivity } from '@/services/telemetry/activity-log';
import { syncUnitSplitToSupabase } from '@/services/supabase/vtvl-sync';

export default function TaoTepPage() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [kind, setKind] = useState<UnitGroupKind>('khoa-vien');
  const [selectedUnitCode, setSelectedUnitCode] = useState<string>('FME');
  const [customDate, setCustomDate] = useState<string>('2026-11-07');
  const [includeZip, setIncludeZip] = useState<boolean>(true);
  const [ngachOverrides, setNgachOverrides] = useState<Record<string, number>>({});
  const [customPositionNames, setCustomPositionNames] = useState<Record<string, string>>({});
  const [customCareerLevels, setCustomCareerLevels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [stale, setStale] = useState<boolean>(false);
  const [result, setResult] = useState<SplitResultSummary | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search).get('step');
      if (sp === '2' || window.location.hash === '#buoc-3') setActiveStep(2);
      else if (sp === '4' || window.location.hash === '#buoc-4') setActiveStep(4);
    }
  }, []);

  const unitsOfGroup = useMemo(() => HCMUTE_UNITS.filter((u) => u.group === kind), [kind]);
  const currentUnit = useMemo(
    () => unitsOfGroup.find((u) => u.code === selectedUnitCode) || unitsOfGroup[0] || HCMUTE_UNITS[0],
    [unitsOfGroup, selectedUnitCode]
  );
  const ngachList = useMemo(() => NGACH_LIST_BY_GROUP[kind], [kind]);

  const handleGroupChange = (newKind: UnitGroupKind) => {
    setKind(newKind);
    const firstUnit = HCMUTE_UNITS.find((u) => u.group === newKind);
    if (firstUnit) setSelectedUnitCode(firstUnit.code);
    setNgachOverrides({}); setCustomPositionNames({}); setCustomCareerLevels({});
    if (result) setStale(true);
  };

  const handleUnitChange = (newCode: string) => {
    setSelectedUnitCode(newCode); setCustomPositionNames({});
    if (result) setStale(true);
  };

  const handleCreateFiles = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true); setStale(false);
    try {
      const res = await generateUnitFiles({
        kind, unitCode: currentUnit.code, unitNameVi: currentUnit.nameVi, unitNameEn: currentUnit.nameEn,
        period: HD07_CONSTANTS.STATISTICAL_PERIOD, exportDate: customDate, includeZipPerPosition: includeZip,
        ngachOverrides, customPositionNames, customCareerLevels
      });
      setResult(res); setActiveStep(2);
      recordActivity(res.unitCode, res.unitNameVi, 'TAO_TEP', `Khởi tạo bộ biểu 21 trang tính: ${res.unitFileName}`);
      void syncUnitSplitToSupabase(res);
    } finally { setLoading(false); }
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const compactDate = customDate.replace(/-/g, '');

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-3">
          <WorkflowSidebar activeStep={activeStep} onSelectStep={setActiveStep} unitCode={currentUnit.code} />
        </div>

        <div className="lg:col-span-9 space-y-5">
          {activeStep === 1 && (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] p-5 space-y-4 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-white font-extrabold text-xs flex items-center justify-center mr-2">1</span>
                  <h1 className="text-base sm:text-lg font-extrabold text-[var(--foreground)]">
                    Bước 1: Chọn đơn vị, đặt Tên VTVL cụ thể và chọn Bậc nghề nghiệp
                  </h1>
                  <InfoTip title="Quy định đặt tên & chọn bậc (HD số 02: 1907/HD-ĐHCNKT)">
                    <p><strong>1. Công thức đặt Tên VTVL cụ thể:</strong> <code className="font-mono">[Khung VTVL của Trường] + [lĩnh vực phụ trách / số thứ tự]</code> (VD: <em>Trưởng khoa Cơ khí Chế tạo máy</em>, <em>Thư ký khoa</em>, <em>Nhân sự phụ trách PTN CNC</em>).</p>
                    <p><strong>2. Giới hạn bậc (Phụ lục I):</strong> Quản lý (Không áp dụng bậc); Giảng viên (Bậc 3), GVC (Bậc 4), GVCC (Bậc 5); Chuyên viên/Kế toán/Thư viện/Bác sĩ (Bậc 3–4); Điều dưỡng (Bậc 2–4); Trợ giảng (Bậc 3); PTN/Thủ quỹ (Bậc 2); Nhân viên phục vụ (Bậc 1–2).</p>
                  </InfoTip>
                </div>
                <button type="button" onClick={() => { setCustomPositionNames({}); setCustomCareerLevels({}); if (result) setStale(true); }} className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] text-[var(--primary)] cursor-pointer">
                  <RotateCcw className="w-3 h-3" />
                  <span>Khôi phục mặc định</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {UNIT_GROUPS.map((g) => (
                  <button key={g.id} type="button" onClick={() => handleGroupChange(g.id)} className={`rounded-xl border px-3 py-2 text-left transition-all cursor-pointer ${kind === g.id ? 'border-[var(--primary)] bg-[var(--primary)]/[0.06] ring-1 ring-[var(--primary)]/20' : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/40'}`}>
                    <div className="font-bold text-xs text-[var(--foreground)]">{g.label}</div>
                    <div className="text-[11px] text-[var(--ink-muted)] mt-0.5">{g.factsText}</div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-7">
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1">Đơn vị thuộc HCM-UTE ({unitsOfGroup.length} đơn vị)</label>
                  <select value={currentUnit.code} onChange={(e) => handleUnitChange(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs sm:text-sm font-semibold">
                    {unitsOfGroup.map((u) => <option key={u.code} value={u.code}>[{u.code}] {u.nameVi}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1">Mã đơn vị</label>
                  <input type="text" readOnly value={currentUnit.code} className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-xs sm:text-sm font-mono font-bold text-[var(--primary)]" />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1">Ngày lập hồ sơ</label>
                  <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs sm:text-sm" />
                </div>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--sheet)]">
                        <th className="py-2 px-2.5 text-left">Mã &amp; Nhóm VTVL</th>
                        <th className="py-2 px-2.5 text-left">Khung VTVL của Trường</th>
                        <th className="py-2 px-2.5 text-left min-w-[220px]">
                          Tên VTVL cụ thể tại đơn vị
                          <InfoTip title="Công thức đặt Tên VTVL cụ thể">
                            Ghi theo công thức <code className="font-mono">[Khung VTVL] + [lĩnh vực phụ trách / số thứ tự]</code>. Giảng viên, GVC, GVCC, NCV, Trợ giảng giữ nguyên tên khung; Chuyên viên tại Khoa ghi <strong>Thư ký khoa</strong>.
                          </InfoTip>
                        </th>
                        <th className="py-2 px-2.5 text-left min-w-[160px]">
                          Bậc nghề nghiệp
                          <InfoTip title="Giới hạn Bậc nghề nghiệp (Phụ lục I)" align="right">
                            Chỉ chọn bậc nằm trong giới hạn cho phép của vị trí khung tại Phụ lục I văn bản 1907/HD-ĐHCNKT.
                          </InfoTip>
                        </th>
                        <th className="py-2 px-2.5 text-right">Nhân sự D1</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ngachList.map((n) => {
                        const val = ngachOverrides[n.code] ?? n.defaultCount;
                        const fwTitle = n.frameworkTitle || n.name;
                        const formulaDefaultName = buildDefaultSpecificVtvlName(fwTitle, currentUnit.nameVi, n.specificNameSuffix, kind);
                        const specificName = customPositionNames[n.code] ?? formulaDefaultName;
                        const allowedLevels = n.allowedCareerLevels || [n.defaultCareerLevel || 'Bậc 3'];
                        const selectedLevel = customCareerLevels[n.code] ?? n.defaultCareerLevel ?? allowedLevels[0];
                        return (
                          <tr key={n.code} className="border-b border-[var(--border-subtle)] hover:bg-[var(--sheet)]/60">
                            <td className="py-2 px-2.5">
                              <span className="font-mono font-bold text-[var(--primary)] block">{n.code}</span>
                              <span className="text-[10px] text-[var(--ink-muted)] block">{n.vtvlGroup4}</span>
                            </td>
                            <td className="py-2 px-2.5">
                              <strong className="text-[var(--foreground)] block">{fwTitle}</strong>
                              <span className="text-[10px] text-[var(--ink-muted)]">Giới hạn: <strong className="text-[#ED1C24]">{n.defaultCareerLevel}</strong></span>
                            </td>
                            <td className="py-2 px-2.5">
                              <input type="text" value={specificName} placeholder={formulaDefaultName} onChange={(e) => { setCustomPositionNames((prev) => ({ ...prev, [n.code]: e.target.value })); if (result) setStale(true); }} className="w-full rounded-lg border border-[var(--border)] bg-[var(--sheet)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground)] focus:border-[var(--primary)]" />
                            </td>
                            <td className="py-2 px-2.5">
                              {allowedLevels.length > 1 ? (
                                <select value={selectedLevel} onChange={(e) => { setCustomCareerLevels((prev) => ({ ...prev, [n.code]: e.target.value })); if (result) setStale(true); }} className="w-full rounded-lg border border-[var(--primary)]/50 bg-[var(--sheet)] px-2 py-1 text-xs font-bold text-[var(--primary)]">
                                  {allowedLevels.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
                                </select>
                              ) : (
                                <span className="inline-block rounded-lg border border-[var(--border-subtle)] bg-[var(--muted)]/60 px-2 py-1 text-[11px] font-bold text-[var(--ink-muted)]">{selectedLevel}</span>
                              )}
                            </td>
                            <td className="py-2 px-2.5 text-right">
                              <input type="number" min={0} max={200} value={val} onChange={(e) => { setNgachOverrides((prev) => ({ ...prev, [n.code]: Math.max(0, parseInt(e.target.value || '0', 10)) })); if (result) setStale(true); }} className="w-15 text-right rounded-lg border border-[var(--border)] bg-[var(--sheet)] px-2 py-1 font-bold tabular-nums" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-xs text-[var(--ink-muted)]">
                  Đơn vị đang chọn: <strong className="text-[var(--foreground)]">[{currentUnit.code}] {currentUnit.nameVi}</strong>
                </span>
                <button type="button" disabled={loading} onClick={() => void handleCreateFiles()} className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[var(--primary)] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-2xs cursor-pointer disabled:opacity-50">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{loading ? 'Đang khởi tạo…' : 'Lưu cấu hình & Sang Bước 2 (Xuất tệp)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </section>
          )}

          {activeStep === 2 && (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] p-5 space-y-4 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-white font-extrabold text-xs flex items-center justify-center mr-2">2</span>
                  <h1 className="text-base sm:text-lg font-extrabold text-[var(--foreground)]">
                    Bước 2: Kết xuất tệp gốc ({currentUnit.code}_K2526_v1_{compactDate}.xlsx) &amp; gói phiếu (.zip)
                  </h1>
                  <InfoTip title="Giải thích tệp gốc v1 và gói phiếu .zip">
                    <p><strong>Tệp gốc 21 biểu (v1):</strong> Dùng cho Tổ thư ký đơn vị quản lý tổng thể.</p>
                    <p><strong>Gói phiếu .zip:</strong> Tách riêng từng vị trí việc làm (chỉ gồm biểu <code className="font-mono">3. B1_KhoiLuong</code>, không lặp biểu D1) để gửi cho các bộ môn/cá nhân kê khai.</p>
                  </InfoTip>
                </div>
                <button type="button" onClick={() => setActiveStep(1)} className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] text-[var(--foreground)] cursor-pointer">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay lại Bước 1</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-[var(--foreground)] cursor-pointer">
                  <input type="checkbox" checked={includeZip} onChange={(e) => setIncludeZip(e.target.checked)} className="accent-[var(--primary)]" />
                  <span>Kết xuất kèm gói tệp nén (.zip) chứa phiếu khảo sát theo từng vị trí việc làm</span>
                </label>
                <button type="button" disabled={loading} onClick={() => void handleCreateFiles()} className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-[var(--primary)] text-white font-bold text-xs cursor-pointer">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>{result && !stale ? 'Tạo lại bộ biểu' : `Khởi tạo bộ biểu ${currentUnit.code}`}</span>
                </button>
              </div>

              {result ? (
                <SplitResultBanner result={result} onDownload={triggerDownload} />
              ) : (
                <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-xs text-[var(--ink-muted)]">
                  Bấm nút <strong>Khởi tạo bộ biểu {currentUnit.code}</strong> ở trên để sinh tệp Excel 21 trang tính và gói phiếu khảo sát (.zip).
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <Link href="/bam-gio" className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] text-xs font-bold text-[var(--foreground)]">
                  <Timer className="w-3.5 h-3.5 text-[var(--primary)]" />
                  <span>Sang Bước 3: Đo định mức thời gian</span>
                </Link>
                <button type="button" onClick={() => setActiveStep(4)} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[var(--primary)] text-white text-xs font-bold cursor-pointer">
                  <span>Tiếp tục sang Bước 4: Gộp phiếu khảo sát</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </section>
          )}

          {activeStep === 4 && (
            <div className="space-y-4">
              <MergeStepSection />
              <div className="flex items-center justify-between">
                <button type="button" onClick={() => setActiveStep(2)} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-[var(--border)] bg-[var(--sheet)] text-xs font-bold text-[var(--foreground)] cursor-pointer">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay lại Bước 2</span>
                </button>
                <Link href="/ra-soat" className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-[var(--primary)] text-white text-xs sm:text-sm font-bold shadow-2xs">
                  <span>Tiếp tục sang Bước 5: Thẩm định chéo 6 chỉ tiêu</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          <details className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] overflow-hidden shadow-2xs">
            <summary className="cursor-pointer px-5 py-3.5 text-xs sm:text-sm font-extrabold text-[var(--foreground)] flex items-center justify-between bg-[var(--background)]/60">
              <span className="inline-flex items-center gap-2">
                <BookOpenCheck className="w-4 h-4 text-[var(--primary)]" />
                <span>Tra cứu Khung 38 vị trí việc làm HCM-UTE (04 nhóm), Bảng chuẩn ERD, Thông tư 31/2026 &amp; Tải dự thảo Tờ trình</span>
              </span>
              <span className="text-[11px] font-bold text-[var(--primary)]">Bấm để mở / đóng</span>
            </summary>
            <div className="p-4 border-t border-[var(--border-subtle)]">
              <Hd07OrderGuideCard unit={currentUnit} splitResult={result} />
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
