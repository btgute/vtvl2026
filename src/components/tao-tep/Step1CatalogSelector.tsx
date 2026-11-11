'use client';

import React, { useState } from 'react';
import { Search, Plus, CheckSquare, Square, Filter, CheckCircle2 } from 'lucide-react';
import { ND232_2026_VTVL_CATALOG, Nd232PositionCatalogItem } from '@/configs/hcmute-nd232-catalog';
import { HcmuteVtvlGroup4, UnitGroupKind } from '@/types/vtvl';
import { ShadcnSelect } from '@/components/ui/ShadcnSelect';
import { useQueryFilter } from '@/services/query/use-query-filter';

const FOUR_GROUPS: HcmuteVtvlGroup4[] = [
  'I. Nhóm VTVL Quản lý',
  'II. Nhóm VTVL Chuyên môn, nghiệp vụ',
  'III. Nhóm VTVL Hỗ trợ',
  'IV. Nhóm VTVL Phục vụ'
];

const LEVEL_FILTERS = ['Tất cả bậc', 'Không áp dụng bậc', 'Bậc 1', 'Bậc 2', 'Bậc 3', 'Bậc 4', 'Bậc 5'];

function isRecommendedForUnitGroup(item: Nd232PositionCatalogItem, kind: UnitGroupKind): boolean {
  const name = item.positionName.toLowerCase();
  const scope = item.hcmuteUnitsHint.toLowerCase();
  if (kind === 'khoa-vien') {
    return (
      name.includes('khoa') ||
      name.includes('viện') ||
      name.includes('bộ môn') ||
      name.includes('ngành') ||
      name.includes('giảng viên') ||
      name.includes('nghiên cứu') ||
      name.includes('kỹ thuật') ||
      name.includes('chuyên viên')
    );
  }
  if (kind === 'phong-ban') {
    return (
      scope.includes('chức năng') ||
      name.includes('phòng') ||
      name.includes('văn phòng') ||
      name.includes('chuyên viên') ||
      name.includes('kế toán') ||
      name.includes('văn thư') ||
      name.includes('thủ quỹ') ||
      item.vtvlGroup4 === 'III. Nhóm VTVL Hỗ trợ' ||
      item.vtvlGroup4 === 'IV. Nhóm VTVL Phục vụ'
    );
  }
  if (kind === 'trung-tam') {
    return (
      name.includes('giám đốc') ||
      name.includes('trung tâm') ||
      name.includes('thư viện') ||
      name.includes('kỹ thuật') ||
      name.includes('chuyên viên') ||
      name.includes('giảng viên')
    );
  }
  return name.includes('văn phòng') || name.includes('chuyên viên') || item.vtvlGroup4 === 'III. Nhóm VTVL Hỗ trợ';
}

interface Step1CatalogSelectorProps {
  unitNameVi: string;
  kind: UnitGroupKind;
  existingFrameworkIds: string[];
  onAddMultiplePositions: (frameworkIds: string[]) => void;
}

export function Step1CatalogSelector({
  unitNameVi,
  kind,
  existingFrameworkIds,
  onAddMultiplePositions
}: Step1CatalogSelectorProps) {
  const [priorityOnly, setPriorityOnly] = useState<boolean>(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [addedBanner, setAddedBanner] = useState<string>('');

  const { params, setParam, data: filteredCatalog } = useQueryFilter<
    Nd232PositionCatalogItem,
    { cq: string; cgroup: string; clevel: string }
  >({
    queryKey: ['step1-catalog', kind, String(priorityOnly)],
    initialParams: { cq: '', cgroup: 'ALL', clevel: 'Tất cả bậc' },
    data: ND232_2026_VTVL_CATALOG,
    syncUrl: false,
    queryFn: ({ params: p, data }) =>
      data.filter((item) => {
        if (priorityOnly && !isRecommendedForUnitGroup(item, kind)) return false;
        if (p.cgroup !== 'ALL' && item.vtvlGroup4 !== p.cgroup) return false;
        if (p.clevel !== 'Tất cả bậc') {
          const matchLvl = item.careerLevel.includes(p.clevel) || item.allowedLevels.some((l) => l.includes(p.clevel));
          if (!matchLvl) return false;
        }
        if (p.cq.trim()) {
          const q = p.cq.toLowerCase();
          if (!`${item.positionName} ${item.maDanhMucNd232} ${item.maChucDanhTt31} ${item.linkedCodeHint}`.toLowerCase().includes(q)) return false;
        }
        return true;
      })
  });
  const searchQuery = params.cq;
  const groupFilter = params.cgroup;
  const levelFilter = params.clevel;
  const setSearchQuery = (v: string) => setParam('cq', v);
  const setGroupFilter = (v: string) => setParam('cgroup', v);
  const setLevelFilter = (v: string) => setParam('clevel', v);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleConfirmAdd = () => {
    if (selectedIds.length === 0) return;
    onAddMultiplePositions(selectedIds);
    setAddedBanner(`Đã thêm ${selectedIds.length} vị trí việc làm vào danh sách của ${unitNameVi}.`);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-extrabold text-[var(--foreground)]">
            Chọn vị trí việc làm từ Khung 38 vị trí của Trường
          </h3>
          <p className="text-xs sm:text-sm text-[var(--ink-muted)]">
            Tìm kiếm, lọc theo nhóm hoặc bậc nghề nghiệp và đánh dấu chọn nhiều vị trí để thêm cùng lúc vào <strong>{unitNameVi}</strong>.
          </p>
        </div>
        <button
          type="button"
          aria-pressed={priorityOnly}
          onClick={() => setPriorityOnly((p) => !p)}
          className={`inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-xl border text-xs sm:text-sm font-bold cursor-pointer transition-colors ${
            priorityOnly
              ? 'border-2 border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
              : 'border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]/45'
          }`}
        >
          <Filter className="w-4 h-4 shrink-0" />
          <span>{priorityOnly ? '✓ Đang ưu tiên VTVL phù hợp khối đơn vị' : 'Đang hiển thị toàn bộ 38 VTVL của Trường'}</span>
        </button>
      </div>

      {/* Bộ lọc tìm kiếm, nhóm VTVL và bậc nghề nghiệp */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-5">
          <label htmlFor="task-1-add" className="block text-sm font-bold text-[var(--foreground)] mb-1">
            Tìm theo tên hoặc mã vị trí việc làm
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--ink-subtle)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="task-1-add"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="VD: Giảng viên, Chuyên viên, V.07.01..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] pl-10 pr-3.5 py-2.5 text-sm font-semibold"
            />
          </div>
        </div>

        <div className="sm:col-span-4">
          <label htmlFor="filter-vtvl-group" className="block text-sm font-bold text-[var(--foreground)] mb-1">
            Lọc theo nhóm vị trí việc làm
          </label>
          <ShadcnSelect
            id="filter-vtvl-group"
            value={groupFilter}
            onValueChange={setGroupFilter}
            options={[{ value: 'ALL', label: 'Tất cả 04 nhóm vị trí việc làm' }, ...FOUR_GROUPS.map((g) => ({ value: g, label: g }))]}
            size="md"
          />
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="filter-vtvl-level" className="block text-sm font-bold text-[var(--foreground)] mb-1">
            Lọc theo bậc nghề nghiệp
          </label>
          <ShadcnSelect
            id="filter-vtvl-level"
            value={levelFilter}
            onValueChange={setLevelFilter}
            options={LEVEL_FILTERS.map((lvl) => ({ value: lvl, label: lvl }))}
            size="md"
          />
        </div>
      </div>

      {addedBanner && (
        <div role="status" className="rounded-xl border border-[var(--ok)]/40 bg-[var(--ok-soft)] px-4 py-2.5 text-sm font-bold text-[var(--ok)]">
          ✓ {addedBanner}
        </div>
      )}

      {/* Danh sách chọn nhiều vị trí việc làm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
        {filteredCatalog.map((item) => {
          const checked = selectedIds.includes(item.maDanhMucNd232);
          const alreadyCount = existingFrameworkIds.filter((id) => id === item.maDanhMucNd232).length;
          const isAdded = alreadyCount > 0;
          return (
            <button
              key={item.maDanhMucNd232}
              type="button"
              aria-pressed={checked}
              onClick={() => toggleSelect(item.maDanhMucNd232)}
              className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                checked
                  ? 'border-2 border-[var(--primary)] bg-[var(--primary)]/10 shadow-2xs'
                  : isAdded
                    ? 'border-[var(--ok)] bg-[var(--ok-soft)] hover:border-[var(--ok)]'
                    : 'border-[var(--border)] bg-[var(--sheet)] hover:bg-[var(--muted)]/50 hover:border-[var(--primary)]/50'
              }`}
            >
              <span className="mt-0.5 shrink-0">
                {checked ? (
                  <CheckSquare className="w-5 h-5 text-[var(--primary)]" />
                ) : isAdded ? (
                  <CheckCircle2 className="w-5 h-5 text-[var(--ok)]" />
                ) : (
                  <Square className="w-5 h-5 text-[var(--ink-subtle)]" />
                )}
              </span>
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <strong className={`text-sm font-extrabold ${isAdded ? 'text-[var(--ok)]' : 'text-[var(--foreground)]'}`}>
                    {item.positionName}
                  </strong>
                  <span className={`text-xs font-bold ${isAdded ? 'text-[var(--ok)]' : 'text-[var(--primary)]'}`}>
                    {item.maChucDanhTt31}
                  </span>
                </div>
                <div className="text-xs text-[var(--ink-muted)]">
                  {item.vtvlGroup4.replace('. Nhóm VTVL ', '. ')} · Giới hạn: <strong>{item.careerLevel}</strong>
                </div>
                {isAdded && (
                  <div className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full bg-[var(--ok)]/15 text-xs font-extrabold text-[var(--ok)]">
                    ✓ Đã có {alreadyCount} vị trí trong danh sách đơn vị
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]">
        <span className="text-sm font-semibold text-[var(--ink-muted)]">
          Hiển thị <strong>{filteredCatalog.length}</strong> vị trí · Đang đánh dấu chọn: <strong className="text-[var(--primary)]">{selectedIds.length} vị trí</strong>
        </span>
        <button
          type="button"
          disabled={selectedIds.length === 0}
          onClick={handleConfirmAdd}
          className="w-full sm:w-auto justify-center inline-flex items-center gap-2 min-h-[44px] px-5 rounded-xl bg-[var(--primary)] text-white text-sm font-extrabold shadow-2xs disabled:opacity-45 cursor-pointer"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Thêm {selectedIds.length > 0 ? `${selectedIds.length} ` : ''}vị trí đã chọn vào đơn vị</span>
        </button>
      </div>
    </div>
  );
}

