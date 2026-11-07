'use client';

import React, { useState } from 'react';
import { Split, Plus, Trash2, ArrowDownToLine, Calculator, CheckCircle2 } from 'lucide-react';
import { DM_CHUC_DANH_TT31_TABLE } from '@/configs/hcmute-erd-tables';
import { NgachAllocationRow, ProposedVtvlRow, UnitGroupKind, UnitScaleMetrics } from '@/types/vtvl';

interface Props {
  unitCode: string;
  kind: UnitGroupKind;
  scaleMetrics: UnitScaleMetrics;
  ngachAllocations: NgachAllocationRow[];
  positions: ProposedVtvlRow[];
  onChangeScaleMetrics: (next: UnitScaleMetrics) => void;
  onChangeNgachAllocations: (next: NgachAllocationRow[]) => void;
  onPushToPositionStaffCounts: (staffByPositionId: Record<string, number>) => void;
}

const EXTRA_ADMIN_NGACH: { code: string; name: string }[] = [
  { code: '01.002', name: 'Chuyên viên chính (Hành chính – Quản trị ĐH)' },
  { code: '01.003', name: 'Chuyên viên (Phòng/Ban / Thư ký Khoa)' },
  { code: '01.004', name: 'Cán sự (Hành chính – Văn thư)' },
  { code: '01.005', name: 'Nhân viên / Thủ quỹ (Hỗ trợ – Phục vụ)' },
  { code: '06.031', name: 'Kế toán viên (Tài chính – Kế toán)' },
  { code: 'V.05.01.02', name: 'Nghiên cứu viên chính (Hạng II)' },
  { code: 'V.05.01.03', name: 'Nghiên cứu viên (Hạng III)' },
  { code: 'V.05.02.07', name: 'Kỹ thuật viên / Phụ trách Phòng thí nghiệm – Xưởng' },
  { code: 'V.10.02.06', name: 'Thư viện viên (Hạng III)' },
  { code: 'V.08.01.03', name: 'Bác sĩ y tế trường học' }
];

const ALL_NGACH_CATALOG = [
  ...DM_CHUC_DANH_TT31_TABLE.map((c) => ({ code: c.maSoChucDanh, name: c.tenChucDanh })),
  ...EXTRA_ADMIN_NGACH
];

export function normalizeNgachCode(raw: string): string {
  const cleaned = String(raw || '').trim().toUpperCase().replace(/\s+/g, '');
  return cleaned.replace(/^([A-Z])(?=[0-9])/, '$1.');
}

export function lookupNgachName(code: string): string {
  const norm = normalizeNgachCode(code);
  const found = ALL_NGACH_CATALOG.find((item) => item.code.toUpperCase() === norm);
  return found ? found.name : 'Mã ngạch / Chức danh nghề nghiệp đơn vị';
}

export function computeScaleMultiplier(m: UnitScaleMetrics, kind: UnitGroupKind): number {
  if (kind === 'khoa-vien') {
    const base = (m.studentCount / 1800) * 0.5 + (m.courseSectionCount / 220) * 0.3 + (m.labWorkshopCount / 8) * 0.2;
    return Number(Math.max(0.5, Math.min(3.5, base || 1)).toFixed(2));
  }
  const adminBase = (m.adminDocCount / 1200) * 0.7 + (m.researchTopicCount / 5) * 0.3;
  return Number(Math.max(0.5, Math.min(3.5, adminBase || 1)).toFixed(2));
}

export function UnitScaleAndNgachTool({
  unitCode,
  kind,
  scaleMetrics,
  ngachAllocations,
  positions,
  onChangeScaleMetrics,
  onChangeNgachAllocations,
  onPushToPositionStaffCounts
}: Props) {
  const [pushedMsg, setPushedMsg] = useState<string>('');

  const updateScaleField = (field: keyof UnitScaleMetrics, val: number) => {
    const nextRaw = { ...scaleMetrics, [field]: Math.max(0, val) };
    const mult = computeScaleMultiplier(nextRaw, kind);
    onChangeScaleMetrics({ ...nextRaw, scaleMultiplier: mult });
  };

  const handleUpdateNgachRow = (id: string, patch: Partial<NgachAllocationRow>) => {
    onChangeNgachAllocations(
      ngachAllocations.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, ...patch };
        if (patch.ngachCode !== undefined) {
          const norm = normalizeNgachCode(patch.ngachCode);
          updated.ngachCode = norm;
          updated.ngachName = lookupNgachName(norm);
        }
        return updated;
      })
    );
  };

  // Tách 1 mã ngạch thành 2 dòng để phân bổ cho lãnh đạo/kiêm nhiệm giữ ngạch giảng viên/chuyên viên
  const handleSplitNgachRow = (row: NgachAllocationRow, index: number) => {
    const firstCount = row.count > 1 ? Math.ceil(row.count / 2) : 1;
    const secondCount = Math.max(1, row.count - firstCount);
    const altPos = positions.find((p) => p.id !== row.targetPositionId) || positions[0];
    const splitRow: NgachAllocationRow = {
      id: `ngach-split-${Date.now()}-${index}`,
      ngachCode: row.ngachCode,
      ngachName: row.ngachName,
      count: secondCount,
      targetPositionId: altPos ? altPos.id : row.targetPositionId,
      isSplitRow: true,
      note: 'Tách từ mã ngạch bảng lương (lãnh đạo/kiêm nhiệm)'
    };
    const next = [...ngachAllocations];
    next[index] = { ...row, count: firstCount };
    next.splice(index + 1, 0, splitRow);
    onChangeNgachAllocations(next);
  };

  const handleAddNgachRow = () => {
    const defaultPos = positions[0];
    onChangeNgachAllocations([
      ...ngachAllocations,
      {
        id: `ngach-add-${Date.now()}`,
        ngachCode: defaultPos?.ngachCode || 'V.07.01.03',
        ngachName: lookupNgachName(defaultPos?.ngachCode || 'V.07.01.03'),
        count: 1,
        targetPositionId: defaultPos?.id || ''
      }
    ]);
  };

  const handleRemoveNgachRow = (id: string) => {
    if (ngachAllocations.length <= 1) return;
    onChangeNgachAllocations(ngachAllocations.filter((r) => r.id !== id));
  };

  const handlePushToD1 = () => {
    const map: Record<string, number> = {};
    positions.forEach((p) => { map[p.id] = 0; });
    ngachAllocations.forEach((r) => {
      if (r.targetPositionId) {
        map[r.targetPositionId] = (map[r.targetPositionId] || 0) + Math.max(0, Number(r.count || 0));
      }
    });
    onPushToPositionStaffCounts(map);
    const totalPushed = Object.values(map).reduce((a, b) => a + b, 0);
    setPushedMsg(`Đã cộng dồn ${totalPushed} nhân sự từ bảng mã ngạch vào cột Nhân sự hiện có (D1) của ${positions.length} VTVL.`);
  };

  const totalNgachStaff = ngachAllocations.reduce((s, r) => s + Number(r.count || 0), 0);
  const totalPositionStaff = positions.reduce((s, p) => s + Number(p.staffCount || 0), 0);

  return (
    <details className="rounded-2xl border border-[var(--primary)]/30 bg-[var(--background)]/70 overflow-hidden">
      <summary className="cursor-pointer px-4 py-3 min-h-[48px] flex flex-wrap items-center justify-between gap-2 text-sm font-extrabold text-[var(--foreground)] bg-[var(--sheet)]">
        <span className="inline-flex items-center gap-2">
          <Calculator className="w-4 h-4 text-[var(--primary)] shrink-0" />
          <span>Số liệu đơn vị để điền sẵn &amp; Bảng nhân sự theo mã ngạch (Bảng lương 09/2026)</span>
        </span>
        <span className="text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-2.5 py-1 rounded-full">
          Hệ số quy mô: ×{scaleMetrics.scaleMultiplier} · Tổng ngạch: {totalNgachStaff} người
        </span>
      </summary>

      <div className="p-4 space-y-5 border-t border-[var(--border-subtle)]">
        {/* PHẦN A: CHỈ SỐ QUY MÔ ĐƠN VỊ ĐỂ TỰ NỘI SUY SỐ SẢN PHẨM ĐIỀN SẴN */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold text-[var(--foreground)]">
              A. Chỉ số quy mô đơn vị [{unitCode}] kỳ 01/10/2025–30/9/2026 (nội suy số sản phẩm điền sẵn ở ô màu cam)
            </h3>
            <span className="text-xs font-bold text-[var(--ok)]">
              Hệ số nội suy sản lượng tự động: ×{scaleMetrics.scaleMultiplier}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <div>
              <label htmlFor="sldv-sv" className="block text-xs font-bold text-[var(--foreground)] mb-1">Sinh viên / Học viên</label>
              <input id="sldv-sv" type="number" min={0} value={scaleMetrics.studentCount} onChange={(e) => updateScaleField('studentCount', Number(e.target.value))} className="w-full rounded-xl border border-[var(--border)] bg-[var(--sheet)] px-2.5 py-1.5 text-sm font-bold text-right" />
            </div>
            <div>
              <label htmlFor="sldv-ctdt" className="block text-xs font-bold text-[var(--foreground)] mb-1">Số ngành / CTĐT</label>
              <input id="sldv-ctdt" type="number" min={0} value={scaleMetrics.programCount} onChange={(e) => updateScaleField('programCount', Number(e.target.value))} className="w-full rounded-xl border border-[var(--border)] bg-[var(--sheet)] px-2.5 py-1.5 text-sm font-bold text-right" />
            </div>
            <div>
              <label htmlFor="sldv-lhp" className="block text-xs font-bold text-[var(--foreground)] mb-1">Lớp học phần / năm</label>
              <input id="sldv-lhp" type="number" min={0} value={scaleMetrics.courseSectionCount} onChange={(e) => updateScaleField('courseSectionCount', Number(e.target.value))} className="w-full rounded-xl border border-[var(--border)] bg-[var(--sheet)] px-2.5 py-1.5 text-sm font-bold text-right" />
            </div>
            <div>
              <label htmlFor="sldv-ptn" className="block text-xs font-bold text-[var(--foreground)] mb-1">Phòng TN / Xưởng</label>
              <input id="sldv-ptn" type="number" min={0} value={scaleMetrics.labWorkshopCount} onChange={(e) => updateScaleField('labWorkshopCount', Number(e.target.value))} className="w-full rounded-xl border border-[var(--border)] bg-[var(--sheet)] px-2.5 py-1.5 text-sm font-bold text-right" />
            </div>
            <div>
              <label htmlFor="sldv-nckh" className="block text-xs font-bold text-[var(--foreground)] mb-1">Đề tài NCKH / năm</label>
              <input id="sldv-nckh" type="number" min={0} value={scaleMetrics.researchTopicCount} onChange={(e) => updateScaleField('researchTopicCount', Number(e.target.value))} className="w-full rounded-xl border border-[var(--border)] bg-[var(--sheet)] px-2.5 py-1.5 text-sm font-bold text-right" />
            </div>
            <div>
              <label htmlFor="sldv-vb" className="block text-xs font-bold text-[var(--foreground)] mb-1">Văn bản / Hồ sơ năm</label>
              <input id="sldv-vb" type="number" min={0} value={scaleMetrics.adminDocCount} onChange={(e) => updateScaleField('adminDocCount', Number(e.target.value))} className="w-full rounded-xl border border-[var(--border)] bg-[var(--sheet)] px-2.5 py-1.5 text-sm font-bold text-right" />
            </div>
          </div>
        </div>

        {/* PHẦN B: NHÂN SỰ THEO MÃ NGẠCH TỪ BẢNG LƯƠNG (CÓ NÚT TÁCH & ĐƯA VÀO D1) */}
        <div className="space-y-3 pt-2 border-t border-[var(--border-subtle)]">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-[var(--foreground)]">
              B. Nhân sự theo mã ngạch đối chiếu bảng lương tháng 9/2026
            </h3>
            <p className="text-xs text-[var(--ink-muted)]">
              Gõ số người từng mã ngạch như trên bảng lương (ví dụ <code className="font-mono font-bold">V.07.01.01</code>, <code className="font-mono font-bold">V.07.01.02</code>, <code className="font-mono font-bold">01.003</code>). Trưởng/Phó đơn vị hoặc người giữ ngạch giảng viên nhưng làm vị trí khác: bấm <strong>Tách</strong> rồi chọn vị trí việc làm đang đảm nhận.
            </p>
          </div>

          <datalist id="hcmute-ngach-datalist">
            {ALL_NGACH_CATALOG.map((item) => (
              <option key={item.code} value={item.code}>{item.name}</option>
            ))}
          </datalist>

          <div className="space-y-2">
            {ngachAllocations.map((row, idx) => (
              <div key={row.id} className={`grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-2.5 rounded-xl border ${row.isSplitRow ? 'border-[var(--primary)]/40 bg-[var(--primary)]/5' : 'border-[var(--border)] bg-[var(--sheet)]'}`}>
                <div className="sm:col-span-2">
                  <label className="block sm:hidden text-xs font-bold mb-0.5">Mã ngạch</label>
                  <input type="text" list="hcmute-ngach-datalist" aria-label={`Mã ngạch dòng ${idx + 1}`} value={row.ngachCode} onChange={(e) => handleUpdateNgachRow(row.id, { ngachCode: e.target.value })} placeholder="V.07.01.02" className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs sm:text-sm font-mono font-bold text-[var(--primary)]" />
                </div>
                <div className="sm:col-span-3">
                  <span className="text-xs font-semibold text-[var(--foreground)] block truncate" title={row.ngachName}>{row.isSplitRow ? `↳ [Dòng tách] ${row.ngachName}` : row.ngachName}</span>
                </div>
                <div className="sm:col-span-2">
                  <label className="block sm:hidden text-xs font-bold mb-0.5">Số người</label>
                  <input type="number" min={0} aria-label={`Số người mã ngạch ${row.ngachCode}`} value={row.count} onChange={(e) => handleUpdateNgachRow(row.id, { count: Math.max(0, Number(e.target.value)) })} className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs sm:text-sm font-extrabold text-right tabular-nums" />
                </div>
                <div className="sm:col-span-3">
                  <label className="block sm:hidden text-xs font-bold mb-0.5">Xếp vào vị trí việc làm</label>
                  <select aria-label={`Vị trí việc làm của mã ngạch ${row.ngachCode}`} value={row.targetPositionId} onChange={(e) => handleUpdateNgachRow(row.id, { targetPositionId: e.target.value })} className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs sm:text-sm font-semibold">
                    {positions.map((pos) => <option key={pos.id} value={pos.id}>[{unitCode}-{pos.vtvlSuffix}] {pos.specificName}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2 flex items-center justify-end gap-1.5">
                  <button type="button" onClick={() => handleSplitNgachRow(row, idx)} title="Tách dòng mã ngạch này để xếp cho Lãnh đạo / Kiêm nhiệm vị trí khác" className="inline-flex items-center gap-1 min-h-[38px] px-2.5 rounded-lg border border-[var(--primary)]/40 bg-[var(--background)] hover:border-[var(--primary)] text-xs font-bold text-[var(--primary)] cursor-pointer">
                    <Split className="w-3.5 h-3.5" /><span>Tách</span>
                  </button>
                  <button type="button" disabled={ngachAllocations.length <= 1} onClick={() => handleRemoveNgachRow(row.id)} aria-label="Xóa dòng mã ngạch" className="inline-flex items-center justify-center min-h-[38px] min-w-[38px] rounded-lg border border-[var(--border)] bg-[var(--background)] hover:border-[var(--fix)] text-[var(--fix)] disabled:opacity-40 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={handleAddNgachRow} className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-xl border border-[var(--border)] bg-[var(--sheet)] hover:border-[var(--primary)] text-xs sm:text-sm font-bold text-[var(--foreground)] cursor-pointer">
                <Plus className="w-4 h-4 text-[var(--primary)]" /><span>Thêm dòng mã ngạch</span>
              </button>
              <button type="button" onClick={handlePushToD1} className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl bg-[var(--primary)] text-white text-xs sm:text-sm font-extrabold cursor-pointer shadow-2xs">
                <ArrowDownToLine className="w-4 h-4" /><span>Đưa vào bảng số người theo vị trí (D1)</span>
              </button>
            </div>
            <div className="text-xs font-bold text-[var(--foreground)]">
              Tổng theo mã ngạch: <strong>{totalNgachStaff}</strong> người · Đang ghi tại bảng VTVL (D1): <strong>{totalPositionStaff}</strong> người
            </div>
          </div>

          {pushedMsg && (
            <div role="status" className="rounded-xl border border-[var(--ok)]/40 bg-[var(--ok-soft)] p-2.5 text-xs font-bold text-[var(--ok)] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{pushedMsg}</span>
            </div>
          )}
        </div>
      </div>
    </details>
  );
}
