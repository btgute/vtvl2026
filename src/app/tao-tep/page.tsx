'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { FileSpreadsheet, RefreshCw, ArrowRight, RotateCcw } from 'lucide-react';
import { MilestonesBar } from '@/components/layout/MilestonesBar';
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
    setNgachOverrides({});
    setCustomPositionNames({});
    setCustomCareerLevels({});
    if (result) setStale(true);
  };

  const handleUnitChange = (newCode: string) => {
    setSelectedUnitCode(newCode);
    setCustomPositionNames({});
    if (result) setStale(true);
  };

  const handleCreateFiles = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStale(false);
    try {
      const res = await generateUnitFiles({
        kind, unitCode: currentUnit.code, unitNameVi: currentUnit.nameVi, unitNameEn: currentUnit.nameEn,
        period: HD07_CONSTANTS.STATISTICAL_PERIOD, exportDate: customDate, includeZipPerPosition: includeZip,
        ngachOverrides, customPositionNames, customCareerLevels
      });
      setResult(res);
      recordActivity(res.unitCode, res.unitNameVi, 'TAO_TEP', `Khởi tạo bộ biểu 21 trang tính: ${res.unitFileName}`);
      void syncUnitSplitToSupabase(res);
    } finally {
      setLoading(false);
    }
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const compactDate = customDate.replace(/-/g, '');

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-7">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--sheet)] p-5 sm:p-7 space-y-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
              PHÂN HỆ KHỞI TẠO HỒ SƠ ĐƠN VỊ VÀ TỔNG HỢP PHIẾU KHẢO SÁT (BƯỚC 1, BƯỚC 2 VÀ BƯỚC 4)
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] mt-1">
              Khởi tạo tệp dữ liệu đơn vị và tổng hợp phiếu khảo sát
            </h1>
            <p className="text-xs sm:text-sm text-[var(--ink-muted)] mt-1 max-w-3xl leading-relaxed">
              Chuẩn hóa theo <strong>04 nhóm vị trí việc làm (38 vị trí khung)</strong> tại Phụ lục I và công thức đặt <strong>Tên VTVL cụ thể tại đơn vị</strong> tại Phụ lục II <strong>Hướng dẫn số 02 (1907/HD-ĐHCNKT ngày 17/6/2026)</strong>, kết hợp Nghị định số 232/2026/NĐ-CP và Thông tư số 31/2026/TT-BGDĐT.
            </p>
          </div>
          <Link href="#buoc-4" className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] hover:underline shrink-0">
            <span>Chuyển tới Bước 4: Tổng hợp phiếu khảo sát</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <MilestonesBar />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form onSubmit={handleCreateFiles} className="lg:col-span-8 space-y-6">
          <section className="rounded-3xl border border-[var(--border)] bg-[var(--sheet)] p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[var(--primary)] text-white font-extrabold text-xs flex items-center justify-center">1</span>
              <h2 className="text-base sm:text-lg font-extrabold text-[var(--foreground)]">Bước 1.1: Lựa chọn nhóm đơn vị thuộc Trường</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {UNIT_GROUPS.map((g) => {
                const checked = kind === g.id;
                return (
                  <label key={g.id} className={`cursor-pointer rounded-2xl border p-4 transition-all flex flex-col justify-between gap-2 ${checked ? 'border-[var(--primary)] bg-[var(--primary)]/[0.05] ring-2 ring-[var(--primary)]/15' : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/40'}`}>
                    <div className="flex items-center gap-2">
                      <input type="radio" name="kind" checked={checked} onChange={() => handleGroupChange(g.id)} className="accent-[var(--primary)]" />
                      <span className="font-bold text-sm text-[var(--foreground)]">{g.label}</span>
                    </div>
                    <p className="text-xs text-[var(--ink-muted)] leading-relaxed">{g.shortDesc}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)] text-[11px]">
                      <span className="font-mono bg-[var(--sheet)] px-2 py-0.5 rounded border border-[var(--border)]">
                        {g.sampleFrom} → <strong className="text-[var(--primary)]">{currentUnit.code}-{g.sampleTo.split('-').slice(1).join('-')}</strong>
                      </span>
                      <span className="text-[var(--ink-subtle)] font-medium">{g.factsText}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-[var(--border)] bg-[var(--sheet)] p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[var(--primary)] text-white font-extrabold text-xs flex items-center justify-center">2</span>
                <h2 className="text-base sm:text-lg font-extrabold text-[var(--foreground)]">
                  Bước 1.2: Đặt Tên VTVL cụ thể tại đơn vị, chọn Bậc nghề nghiệp (theo giới hạn) và số nhân sự (D1)
                </h2>
              </div>
              <button type="button" onClick={() => { setCustomPositionNames({}); setCustomCareerLevels({}); if (result) setStale(true); }} className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] text-[var(--primary)] cursor-pointer">
                <RotateCcw className="w-3 h-3" />
                <span>Khôi phục công thức chuẩn HCM-UTE</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-6 space-y-1.5">
                <label className="block text-xs font-bold text-[var(--foreground)]">Đơn vị thuộc HCM-UTE ({unitsOfGroup.length} đơn vị)</label>
                <select value={currentUnit.code} onChange={(e) => handleUnitChange(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm font-semibold">
                  {unitsOfGroup.map((u) => (
                    <option key={u.code} value={u.code}>[{u.code}] {u.nameVi}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-3 space-y-1.5">
                <label className="block text-xs font-bold text-[var(--foreground)]">Mã định danh đơn vị</label>
                <input type="text" readOnly value={currentUnit.code} className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted)] px-3 py-2.5 text-sm font-mono font-bold text-[var(--primary)]" />
              </div>
              <div className="sm:col-span-3 space-y-1.5">
                <label className="block text-xs font-bold text-[var(--foreground)]">Ngày lập hồ sơ</label>
                <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
              </div>
            </div>

            <div className="rounded-xl border border-[var(--primary)]/25 bg-[var(--primary)]/[0.04] px-3.5 py-2.5 text-xs text-[var(--ink-muted)] leading-relaxed">
              <strong className="text-[var(--foreground)]">Công thức đặt Tên VTVL cụ thể tại đơn vị (Mục II.5 — HD 1907/HD-ĐHCNKT):</strong>{' '}
              <code className="font-mono font-bold text-[var(--primary)]">[Khung VTVL của Trường] + [lĩnh vực phụ trách hoặc đánh số thứ tự]</code>.
              Ví dụ: Khung <em>Trưởng khoa</em> → <strong>Trưởng khoa {currentUnit.nameVi.replace(/^Khoa\s+/i, '')}</strong>; Khung <em>Chuyên viên</em> tại Khoa → <strong>Thư ký khoa</strong>; Khung <em>Nhân sự phụ trách xưởng/PTN</em> → <strong>Nhân sự phụ trách phòng thí nghiệm CNC</strong>.
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--sheet)]">
                      <th className="py-2.5 px-2.5 text-left">Nhóm VTVL &amp; Mã</th>
                      <th className="py-2.5 px-2.5 text-left">Khung VTVL của Trường (Cột 2 PL II)</th>
                      <th className="py-2.5 px-2.5 text-left min-w-[230px]">Tên VTVL cụ thể tại đơn vị (Cột 3 PL II)</th>
                      <th className="py-2.5 px-2.5 text-left min-w-[165px]">Bậc nghề nghiệp sử dụng (Cột 4 PL II)</th>
                      <th className="py-2.5 px-2.5 text-right">Số NS (D1)</th>
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
                            <span className="text-[10px] text-[var(--ink-muted)] block">Giới hạn: <strong className="text-[#ED1C24]">{n.defaultCareerLevel}</strong></span>
                          </td>
                          <td className="py-2 px-2.5">
                            <input type="text" value={specificName} placeholder={formulaDefaultName} onChange={(e) => { setCustomPositionNames((prev) => ({ ...prev, [n.code]: e.target.value })); if (result) setStale(true); }} className="w-full rounded-lg border border-[var(--border)] bg-[var(--sheet)] px-2.5 py-1.5 text-xs font-semibold text-[var(--foreground)] focus:border-[var(--primary)]" />
                          </td>
                          <td className="py-2 px-2.5">
                            {allowedLevels.length > 1 ? (
                              <select value={selectedLevel} onChange={(e) => { setCustomCareerLevels((prev) => ({ ...prev, [n.code]: e.target.value })); if (result) setStale(true); }} className="w-full rounded-lg border border-[var(--primary)]/50 bg-[var(--sheet)] px-2 py-1.5 text-xs font-bold text-[var(--primary)]">
                                {allowedLevels.map((lvl) => (
                                  <option key={lvl} value={lvl}>{lvl}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="inline-block rounded-lg border border-[var(--border-subtle)] bg-[var(--muted)]/60 px-2.5 py-1 text-[11px] font-bold text-[var(--ink-muted)]">
                                {selectedLevel} (Cố định)
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-2.5 text-right">
                            <input type="number" min={0} max={200} value={val} onChange={(e) => { setNgachOverrides((prev) => ({ ...prev, [n.code]: Math.max(0, parseInt(e.target.value || '0', 10)) })); if (result) setStale(true); }} className="w-16 text-right rounded-lg border border-[var(--border)] bg-[var(--sheet)] px-2 py-1 font-bold tabular-nums" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section id="buoc-3" className="rounded-3xl border border-[var(--border)] bg-[var(--sheet)] p-5 sm:p-6 space-y-4 shadow-2xs scroll-mt-24">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[var(--primary)] text-white font-extrabold text-xs flex items-center justify-center">3</span>
              <h2 className="text-base sm:text-lg font-extrabold text-[var(--foreground)]">
                Bước 2: Kết xuất tệp đơn vị gốc ({currentUnit.code}_K2526_v1_{compactDate}.xlsx) và gói phiếu khảo sát (.zip)
              </h2>
            </div>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--background)] cursor-pointer">
              <input type="checkbox" checked={includeZip} onChange={(e) => setIncludeZip(e.target.checked)} className="mt-1 accent-[var(--primary)]" />
              <div className="text-xs leading-relaxed">
                <strong className="text-sm block text-[var(--foreground)]">Kết xuất kèm gói tệp nén (.zip) chứa phiếu khảo sát theo từng vị trí việc làm</strong>
                <span className="text-[var(--ink-muted)]">Mỗi vị trí việc làm được tách thành một tệp <code className="font-mono">.xlsx</code> chuẩn 19 cột biểu <code className="font-mono">3. B1_KhoiLuong</code> gắn đúng <strong>Tên VTVL cụ thể tại đơn vị</strong> và <strong>Bậc nghề nghiệp đã chọn</strong>.</span>
              </div>
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" disabled={loading} className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[var(--primary)] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-2xs cursor-pointer disabled:opacity-50">
                <FileSpreadsheet className="w-4 h-4" />
                <span>{loading ? 'Đang khởi tạo bộ biểu…' : `Khởi tạo bộ biểu cho đơn vị ${currentUnit.code}`}</span>
              </button>
              {stale && <span className="text-xs font-semibold text-[var(--warn)] bg-[var(--warn-soft)] px-3 py-1.5 rounded-lg">Thông số đơn vị đã thay đổi, vui lòng khởi tạo lại bộ biểu để cập nhật.</span>}
            </div>

            {result && <SplitResultBanner result={result} onDownload={triggerDownload} />}
          </section>

          <MergeStepSection />
          <Hd07OrderGuideCard unit={currentUnit} splitResult={result} />
        </form>

        <aside className="lg:col-span-4 rounded-3xl border border-[var(--border)] bg-[var(--sheet)] p-5 sm:p-6 space-y-4 lg:sticky lg:top-22 shadow-2xs">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[var(--primary)]" />
            <h2 className="text-sm sm:text-base font-extrabold text-[var(--foreground)]">
              Phân 04 nhóm VTVL &amp; giới hạn bậc theo HD số 02 (1907/HD-ĐHCNKT)
            </h2>
          </div>
          <ol className="space-y-2.5 text-xs">
            <li className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--background)] p-3 space-y-1">
              <strong className="block text-[var(--foreground)]">I. Nhóm VTVL Quản lý (19 vị trí khung)</strong>
              <span className="text-[var(--ink-muted)] block leading-relaxed">Hiệu trưởng, Phó Hiệu trưởng, Trưởng/Phó Khoa, Viện, Phòng, Giám đốc, Chánh VP, Tổng biên tập, Trưởng trạm, <strong>Trưởng Bộ môn, Trưởng Ngành, Phó Trưởng Bộ môn</strong> (<em>Không áp dụng bậc</em>).</span>
            </li>
            <li className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--background)] p-3 space-y-1">
              <strong className="block text-[var(--foreground)]">II. Nhóm VTVL Chuyên môn, nghiệp vụ (12 vị trí)</strong>
              <span className="text-[var(--ink-muted)] block leading-relaxed">Giảng viên cao cấp (<strong>Bậc 5</strong>); Giảng viên chính, NCV chính hạng II (<strong>Bậc 4</strong>); Giảng viên, NCV hạng III (<strong>Bậc 3</strong>); Trợ lý NC hạng IV, Y sĩ (<strong>Bậc 2</strong>); Chuyên viên (Thư ký khoa), Kế toán viên, Thư viện viên, Bác sĩ (<strong>Từ bậc 3 đến bậc 4</strong>); Điều dưỡng (<strong>Từ bậc 2 đến bậc 4</strong>).</span>
            </li>
            <li className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--background)] p-3 space-y-1">
              <strong className="block text-[var(--foreground)]">III. Nhóm VTVL Hỗ trợ (03 vị trí khung)</strong>
              <span className="text-[var(--ink-muted)] block leading-relaxed">Trợ giảng (<strong>Bậc 3</strong>); Nhân sự phụ trách xưởng/phòng thí nghiệm (<strong>Bậc 2</strong>); Thủ quỹ (<strong>Bậc 2</strong>).</span>
            </li>
            <li className="rounded-2xl border border-[var(--primary)]/30 bg-[var(--primary)]/[0.05] p-3 space-y-1">
              <strong className="block text-[var(--primary)]">IV. Nhóm VTVL Phục vụ (04 vị trí khung)</strong>
              <span className="text-[var(--ink-muted)] block leading-relaxed">Nhân viên kỹ thuật, Nhân viên lái xe, Nhân viên bảo vệ, Nhân viên lễ tân, phục vụ, tạp vụ (Giới hạn: <strong>Từ bậc 1 đến bậc 2</strong>).</span>
            </li>
          </ol>
        </aside>
      </div>
    </div>
  );
}
