'use client';

import React, { useMemo } from 'react';
import { X, BarChart3, Users, Briefcase, Scale, Search, ArrowUpRight } from 'lucide-react';
import { ExcelSheetKey, GenericGridRow } from './excel-grid-types';
import { ShadcnSelect } from '@/components/ui/ShadcnSelect';
import { useQueryFilter } from '@/services/query/use-query-filter';

interface WorkforceStructureChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitCode: string;
  unitNameVi: string;
  c1Rows: GenericGridRow[];
  d2Rows: GenericGridRow[];
  onSelectSheet?: (sheet: ExcelSheetKey) => void;
}

interface CombinedWorkforceItem {
  maVtvl: string;
  tenVtvl: string;
  groupKind: 'QL' | 'CM' | 'HT';
  loaiNhanLuc: string;
  canBoTri: number;
  coTheBoTri: number;
  bienCheGiao: number;
  deNghiDieuChinh: number;
}

type ChartFilterParams = { q: string; group: string; laborType: string };

function classifyVtvlGroup(code: string): 'QL' | 'CM' | 'HT' {
  const u = code.toUpperCase();
  if (u.includes('QL') || u.includes('LD')) return 'QL';
  if (u.includes('CM') || u.includes('GV') || u.includes('NC')) return 'CM';
  return 'HT';
}

export function WorkforceStructureChartModal({
  isOpen, onClose, unitCode, unitNameVi, c1Rows, d2Rows, onSelectSheet
}: WorkforceStructureChartModalProps) {
  const combinedItems = useMemo<CombinedWorkforceItem[]>(() => {
    const d2Map = new Map<string, GenericGridRow>();
    d2Rows.forEach((r) => { const c = String(r.maVtvl || '').trim(); if (c) d2Map.set(c, r); });
    const seen = new Set<string>();
    const list: CombinedWorkforceItem[] = [];

    c1Rows.forEach((c) => {
      const code = String(c.maVtvl || '').trim();
      if (!code) return;
      seen.add(code);
      const d2 = d2Map.get(code);
      const canBoTri = Number(d2?.soNguoiCanBoTri ?? 1) || 0;
      const coTheBoTri = Number(d2?.soNguoiCoTheBoTri ?? 1) || 0;
      list.push({
        maVtvl: code,
        tenVtvl: String(c.tenVtvl || code),
        groupKind: classifyVtvlGroup(code),
        loaiNhanLuc: String(c.loaiNhanLuc || 'Viên chức'),
        canBoTri,
        coTheBoTri,
        bienCheGiao: Number(d2?.bienCheGiao ?? coTheBoTri) || 0,
        deNghiDieuChinh: Number(d2?.deNghiDieuChinh ?? (canBoTri - coTheBoTri)) || 0
      });
    });

    d2Rows.forEach((d2) => {
      const code = String(d2.maVtvl || '').trim();
      if (!code || seen.has(code)) return;
      const canBoTri = Number(d2.soNguoiCanBoTri ?? 1) || 0;
      const coTheBoTri = Number(d2.soNguoiCoTheBoTri ?? 1) || 0;
      list.push({
        maVtvl: code,
        tenVtvl: `Vị trí ${code}`,
        groupKind: classifyVtvlGroup(code),
        loaiNhanLuc: 'Viên chức',
        canBoTri,
        coTheBoTri,
        bienCheGiao: Number(d2.bienCheGiao ?? coTheBoTri) || 0,
        deNghiDieuChinh: Number(d2.deNghiDieuChinh ?? (canBoTri - coTheBoTri)) || 0
      });
    });
    return list;
  }, [c1Rows, d2Rows]);

  const { params, setParam, data: filteredItems } = useQueryFilter<CombinedWorkforceItem, ChartFilterParams>({
    queryKey: ['workforce-chart-c1-d2', unitCode],
    initialParams: { q: '', group: 'all', laborType: 'all' },
    data: combinedItems,
    syncUrl: false,
    queryFn: ({ params: p, data }) => data.filter((item) => {
      if (p.group !== 'all' && item.groupKind !== p.group) return false;
      if (p.laborType !== 'all' && item.loaiNhanLuc !== p.laborType) return false;
      if (p.q.trim()) {
        const term = p.q.trim().toLowerCase();
        if (!item.maVtvl.toLowerCase().includes(term) && !item.tenVtvl.toLowerCase().includes(term)) return false;
      }
      return true;
    })
  });

  const stats = useMemo(() => {
    const totalPositions = filteredItems.length;
    const totalRequired = filteredItems.reduce((s, i) => s + i.canBoTri, 0);
    const totalAvailable = filteredItems.reduce((s, i) => s + i.coTheBoTri, 0);
    const totalAdjustment = filteredItems.reduce((s, i) => s + i.deNghiDieuChinh, 0);
    const maxHeadcount = Math.max(1, ...filteredItems.map((i) => Math.max(i.canBoTri, i.coTheBoTri, i.bienCheGiao, 1)));

    const byGroup = [
      { key: 'QL', label: 'Lãnh đạo, quản lý (QL)', color: '#004776' },
      { key: 'CM', label: 'Chuyên môn, nghề nghiệp (CM)', color: '#005fa3' },
      { key: 'HT', label: 'Hỗ trợ, phục vụ (HT)', color: '#13653f' }
    ].map((g) => {
      const m = filteredItems.filter((i) => i.groupKind === g.key);
      return {
        ...g, count: m.length, people: m.reduce((s, i) => s + i.canBoTri, 0),
        pct: totalPositions > 0 ? Math.round((m.length / totalPositions) * 100) : 0
      };
    });

    const laborTypes = ['Viên chức', 'Hợp đồng lao động', 'Hợp đồng khoán việc', 'Thuê dịch vụ'].map((lt) => {
      const m = filteredItems.filter((i) => i.loaiNhanLuc === lt);
      return { label: lt, count: m.length, pct: totalPositions > 0 ? Math.round((m.length / totalPositions) * 100) : 0 };
    });

    return { totalPositions, totalRequired, totalAvailable, totalAdjustment, maxHeadcount, byGroup, laborTypes };
  }, [filteredItems]);

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="workforce-chart-modal-title" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/55 select-none" onClick={onClose}>
      <div className="relative w-full max-w-5xl max-h-[92dvh] sm:max-h-[90dvh] bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-[#cbd5e1] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header — Solid Primary Fresh Blue (#005fa3), no gradient, no white outline */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-[#005fa3] text-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#004776] flex items-center justify-center shrink-0"><BarChart3 className="w-5 h-5 text-white" /></div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="workforce-chart-modal-title" className="text-base font-semibold text-white">Biểu đồ cơ cấu nhân lực (Biểu C1 &amp; D2)</h2>
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-[#004776] text-white">[{unitCode}] {unitNameVi}</span>
              </div>
              <p className="text-xs text-white/90 truncate">Trực quan hóa danh mục vị trí việc làm (6. C1_VTVL) và phương án bố trí biên chế (10. D2_PhuongAn)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onSelectSheet && (
              <>
                <button type="button" onClick={() => { onSelectSheet('C1'); onClose(); }} className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg bg-[#004776] hover:bg-[#00385c] text-white text-xs font-medium cursor-pointer transition-colors"><span>Mở Biểu C1</span><ArrowUpRight className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => { onSelectSheet('D2'); onClose(); }} className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg bg-[#004776] hover:bg-[#00385c] text-white text-xs font-medium cursor-pointer transition-colors"><span>Mở Biểu D2</span><ArrowUpRight className="w-3.5 h-3.5" /></button>
              </>
            )}
            <button type="button" onClick={onClose} aria-label="Đóng biểu đồ" className="w-8 h-8 rounded-lg bg-[#004776] hover:bg-[#00385c] text-white inline-flex items-center justify-center cursor-pointer transition-colors"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Filter Bar using queryFn + ShadcnSelect */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#f8fafc] border-b border-[#cbd5e1] grid grid-cols-1 sm:grid-cols-12 gap-2.5 shrink-0">
          <div className="sm:col-span-5 relative flex items-center">
            <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 pointer-events-none" />
            <input type="text" value={params.q} onChange={(e) => setParam('q', e.target.value)} placeholder="Tìm theo mã VTVL hoặc tên vị trí..." className="w-full h-9 pl-8 pr-3 text-xs rounded-lg border border-[#cbd5e1] bg-white text-[#004776] focus:border-[#005fa3] focus:ring-2 focus:ring-[#005fa3]/20 outline-hidden" />
          </div>
          <div className="sm:col-span-4">
            <ShadcnSelect size="sm" value={params.group} ariaLabel="Lọc theo nhóm VTVL" onChange={(v) => setParam('group', v)} options={[
              { value: 'all', label: 'Tất cả nhóm VTVL (QL, CM, HT)' },
              { value: 'QL', label: 'Nhóm Lãnh đạo, quản lý (QL)' },
              { value: 'CM', label: 'Nhóm Chuyên môn, nghề nghiệp (CM)' },
              { value: 'HT', label: 'Nhóm Hỗ trợ, phục vụ (HT)' }
            ]} />
          </div>
          <div className="sm:col-span-3">
            <ShadcnSelect size="sm" value={params.laborType} ariaLabel="Lọc theo loại nhân lực C1" onChange={(v) => setParam('laborType', v)} options={[
              { value: 'all', label: 'Tất cả loại nhân lực (C1)' },
              { value: 'Viên chức', label: 'Viên chức' },
              { value: 'Hợp đồng lao động', label: 'Hợp đồng lao động' },
              { value: 'Hợp đồng khoán việc', label: 'Hợp đồng khoán việc' },
              { value: 'Thuê dịch vụ', label: 'Thuê dịch vụ' }
            ]} />
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-white">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#cbd5e1] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#eef5ff] text-[#005fa3] flex items-center justify-center shrink-0"><Briefcase className="w-4 h-4" /></div>
              <div><div className="text-xs text-[#476885]">Tổng vị trí (Biểu C1)</div><div className="text-lg font-semibold text-[#004776] tabular-nums">{stats.totalPositions} VTVL</div></div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#eef5ff] border border-[#005fa3]/25 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#005fa3] text-white flex items-center justify-center shrink-0"><Users className="w-4 h-4" /></div>
              <div><div className="text-xs text-[#004776]">Nhu cầu cần bố trí (D2)</div><div className="text-lg font-semibold text-[#005fa3] tabular-nums">{stats.totalRequired} người</div></div>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--ok-soft)] border border-[var(--ok)]/25 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--ok)] text-white flex items-center justify-center shrink-0"><Users className="w-4 h-4" /></div>
              <div><div className="text-xs text-[var(--ok)]">Hiện có có thể bố trí (D2)</div><div className="text-lg font-semibold text-[var(--ok)] tabular-nums">{stats.totalAvailable} người</div></div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#cbd5e1] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#004776] text-white flex items-center justify-center shrink-0"><Scale className="w-4 h-4" /></div>
              <div><div className="text-xs text-[#476885]">Đề nghị điều chỉnh (D2)</div><div className={`text-lg font-semibold tabular-nums ${stats.totalAdjustment > 0 ? 'text-[var(--warn)]' : stats.totalAdjustment < 0 ? 'text-[var(--fix)]' : 'text-[var(--ok)]'}`}>{stats.totalAdjustment > 0 ? `+${stats.totalAdjustment}` : stats.totalAdjustment} người</div></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[#cbd5e1] bg-white space-y-3">
              <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-[#004776]">1. Cơ cấu VTVL theo 03 nhóm chức danh (Biểu C1)</h3><span className="text-xs text-[#476885] tabular-nums">{stats.totalPositions} vị trí</span></div>
              <div className="w-full h-3.5 rounded-full bg-[#f1f5f9] overflow-hidden flex">
                {stats.byGroup.map((g) => g.pct > 0 && <div key={g.key} style={{ width: `${g.pct}%`, backgroundColor: g.color }} title={`${g.label}: ${g.count} VTVL (${g.pct}%)`} className="h-full transition-all" />)}
              </div>
              <div className="space-y-2 pt-1">
                {stats.byGroup.map((g) => (
                  <div key={g.key} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium text-[#004776]"><span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: g.color }} /><span>{g.label}</span></span>
                    <span className="tabular-nums text-[#476885]"><strong className="text-[#004776]">{g.count}</strong> VTVL · <strong className="text-[#005fa3]">{g.people}</strong> người ({g.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#cbd5e1] bg-white space-y-3">
              <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-[#004776]">2. Cơ cấu theo Loại nhân lực (Biểu C1)</h3><span className="text-xs text-[#476885]">Chuẩn Data Validation</span></div>
              <div className="space-y-2.5">
                {stats.laborTypes.map((lt) => (
                  <div key={lt.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs"><span className="font-medium text-[#004776]">{lt.label}</span><span className="tabular-nums text-[#476885]"><strong className="text-[#004776]">{lt.count}</strong> VTVL ({lt.pct}%)</span></div>
                    <div className="w-full h-2 rounded-full bg-[#f1f5f9] overflow-hidden"><div className="h-full rounded-full bg-[#005fa3] transition-all" style={{ width: `${Math.max(lt.count > 0 ? 6 : 0, lt.pct)}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[#cbd5e1] bg-white space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e2e8f0] pb-2.5">
              <div>
                <h3 className="text-sm font-semibold text-[#004776]">3. Đối chiếu Nhu cầu cần bố trí và Nhân lực có thể bố trí theo từng VTVL (Biểu D2 ↔ C1)</h3>
                <p className="text-xs text-[#476885]">So sánh Cột C (Người cần bố trí), Cột D (Người có thể bố trí) và Cột G (Đề nghị điều chỉnh) tại Biểu 10. D2_PhuongAn</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 text-[#004776] font-medium"><span className="w-3 h-3 rounded-xs bg-[#005fa3]" /> Cần bố trí (D2.C)</span>
                <span className="inline-flex items-center gap-1.5 text-[#004776] font-medium"><span className="w-3 h-3 rounded-xs bg-[#13653f]" /> Có thể bố trí (D2.D)</span>
                <span className="inline-flex items-center gap-1.5 text-[#004776] font-medium"><span className="w-3 h-3 rounded-xs bg-[#94a3b8]" /> Biên chế giao (D2.E)</span>
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#64748b]">Không có vị trí việc làm nào khớp điều kiện lọc.</div>
            ) : (
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {filteredItems.map((item) => {
                  const reqPct = Math.round((item.canBoTri / stats.maxHeadcount) * 100);
                  const availPct = Math.round((item.coTheBoTri / stats.maxHeadcount) * 100);
                  const allocPct = Math.round((item.bienCheGiao / stats.maxHeadcount) * 100);
                  return (
                    <div key={item.maVtvl} className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="px-2 py-0.5 rounded bg-[#eef5ff] text-[#005fa3] font-semibold shrink-0">{item.maVtvl}</span>
                          <span className="font-semibold text-[#004776] truncate" title={item.tenVtvl}>{item.tenVtvl}</span>
                          <span className="text-[#64748b] hidden sm:inline">· {item.loaiNhanLuc}</span>
                        </div>
                        <div className="flex items-center gap-2 tabular-nums shrink-0">
                          <span className="text-[#476885]">Cần: <strong className="text-[#005fa3]">{item.canBoTri}</strong> · Hiện có: <strong className="text-[#13653f]">{item.coTheBoTri}</strong></span>
                          <span className={`px-2 py-0.5 rounded font-semibold ${item.deNghiDieuChinh > 0 ? 'bg-[var(--warn-soft)] text-[var(--warn)]' : item.deNghiDieuChinh < 0 ? 'bg-[var(--fix-soft)] text-[var(--fix)]' : 'bg-[var(--ok-soft)] text-[var(--ok)]'}`}>
                            {item.deNghiDieuChinh > 0 ? `+${item.deNghiDieuChinh} cần bổ sung` : item.deNghiDieuChinh < 0 ? `${item.deNghiDieuChinh} dôi dư` : 'Cân đối (0)'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex items-center gap-2"><span className="w-24 text-[#476885] shrink-0">Cần bố trí</span><div className="flex-1 h-2.5 bg-white rounded-full overflow-hidden border border-[#e2e8f0]"><div className="h-full bg-[#005fa3] rounded-full transition-all" style={{ width: `${Math.max(item.canBoTri > 0 ? 6 : 0, reqPct)}%` }} /></div><span className="w-8 text-right font-semibold text-[#005fa3] tabular-nums">{item.canBoTri}</span></div>
                        <div className="flex items-center gap-2"><span className="w-24 text-[#476885] shrink-0">Có thể bố trí</span><div className="flex-1 h-2.5 bg-white rounded-full overflow-hidden border border-[#e2e8f0]"><div className="h-full bg-[#13653f] rounded-full transition-all" style={{ width: `${Math.max(item.coTheBoTri > 0 ? 6 : 0, availPct)}%` }} /></div><span className="w-8 text-right font-semibold text-[#13653f] tabular-nums">{item.coTheBoTri}</span></div>
                        <div className="flex items-center gap-2"><span className="w-24 text-[#476885] shrink-0">Biên chế giao</span><div className="flex-1 h-2 bg-white rounded-full overflow-hidden border border-[#e2e8f0]"><div className="h-full bg-[#94a3b8] rounded-full transition-all" style={{ width: `${Math.max(item.bienCheGiao > 0 ? 6 : 0, allocPct)}%` }} /></div><span className="w-8 text-right font-medium text-[#476885] tabular-nums">{item.bienCheGiao}</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
