'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { X, Network, Building2, Maximize2, Minimize2 } from 'lucide-react';
import { QD2266_GROUPED_UNITS_CATALOG } from '@/configs/hcmute-qd2266-missions';
import { ShadcnSelect } from '@/components/ui/ShadcnSelect';
import { buildUnitOrgTree } from '@/services/org-chart/unit-org-tree-builder';
import { GenericGridRow } from '@/components/excel-grid/excel-grid-types';
import { UnitOrgNode } from '@/services/org-chart/unit-org-tree-types';
import { UnitOrgTreeView } from './UnitOrgTreeView';
import { UnitOrgNodeDetailPane } from './UnitOrgNodeDetailPane';

interface UnitOrgTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUnitCode?: string;
  workbookData?: Record<string, GenericGridRow[]>;
}

export function UnitOrgTreeModal({
  isOpen,
  onClose,
  defaultUnitCode = 'TCNS',
  workbookData
}: UnitOrgTreeModalProps) {
  const [selectedUnitCode, setSelectedUnitCode] = useState(defaultUnitCode);
  const [selectedNode, setSelectedNode] = useState<UnitOrgNode | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const treeData = useMemo(() => {
    return buildUnitOrgTree(
      selectedUnitCode,
      selectedUnitCode === defaultUnitCode ? workbookData : undefined
    );
  }, [selectedUnitCode, defaultUnitCode, workbookData]);

  useEffect(() => {
    if (defaultUnitCode) {
      setSelectedUnitCode(defaultUnitCode);
    }
  }, [defaultUnitCode]);

  useEffect(() => {
    const root = treeData.rootNode;
    const initialExpanded = new Set<string>([root.id]);
    if (root.children && root.children.length > 0) {
      root.children.forEach((head) => {
        initialExpanded.add(head.id);
      });
    }
    setExpandedIds(initialExpanded);
    setSelectedNode(root.children[0] || root);
  }, [treeData]);

  if (!isOpen) return null;

  const handleToggleExpand = (nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    const all = new Set<string>();
    const collect = (n: UnitOrgNode) => {
      all.add(n.id);
      n.children?.forEach(collect);
    };
    collect(treeData.rootNode);
    setExpandedIds(all);
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set([treeData.rootNode.id]));
  };

  const currentViewingNode = selectedNode || treeData.rootNode;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-6xl max-h-[92dvh] bg-white rounded-2xl shadow-2xl border border-[#cbd5e1] overflow-hidden flex flex-col">
        {/* Header Modal chuẩn màu xanh tươi #005fa3 */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#005fa3] text-white shrink-0 border-b border-[#004776]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#004776] flex items-center justify-center shrink-0">
              <Network className="w-5 h-5 text-sky-200" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  Sơ đồ Vị trí việc làm &amp; Công việc dự kiến
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#004776] text-sky-100">
                  {treeData.unitCode}
                </span>
              </div>
              <p className="text-xs text-white/90 truncate">
                {treeData.unitNameVi} · Chuẩn hóa theo Hướng dẫn số 07-HD/BTCTW &amp; QĐ 2266/QĐ-ĐHCNKT
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-[#004776] transition-colors cursor-pointer"
            aria-label="Đóng cửa sổ sơ đồ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar: Bộ chọn đơn vị & Thống kê nhanh */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#f8fafc] border-b border-[#cbd5e1] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2.5 min-w-0 flex-1">
            <span className="text-xs font-bold text-[#004776] shrink-0">Chọn đơn vị:</span>
            <div className="w-64 sm:w-80">
              <ShadcnSelect
                value={selectedUnitCode}
                onValueChange={setSelectedUnitCode}
                options={QD2266_GROUPED_UNITS_CATALOG.flatMap((grp) =>
                  grp.units.map((u) => ({
                    value: u.code,
                    label: `[${u.code}] ${u.nameVi}`,
                    group: grp.groupLabel
                  }))
                )}
                searchable={true}
                size="sm"
              />
            </div>

            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-[#64748b]">
              <span className="px-2.5 py-1 rounded-md bg-white border border-[#cbd5e1] text-[#004776]">
                {treeData.totalPositions} VTVL
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white border border-[#cbd5e1] text-emerald-800">
                {treeData.totalExpectedStaff} người dự kiến
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white border border-[#cbd5e1] text-sky-800">
                {treeData.totalTasks} đầu việc
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleExpandAll}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#004776] bg-white hover:bg-slate-100 border border-[#cbd5e1] rounded-lg transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Mở tất cả</span>
            </button>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#64748b] bg-white hover:bg-slate-100 border border-[#cbd5e1] rounded-lg transition-colors cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Thu gọn</span>
            </button>
          </div>
        </div>

        {/* Nội dung chính: 2 cột (Cây sơ đồ bên trái - Chi tiết công việc bên phải) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-0 divide-y md:divide-y-0 md:divide-x divide-[#cbd5e1]">
          {/* Cột trái: Sơ đồ cây (Tree view) */}
          <div className="md:col-span-5 p-4 overflow-y-auto space-y-3 bg-[#f8fafc]/50">
            <div className="flex items-center justify-between pb-1 border-b border-[#e2e8f0]">
              <h4 className="text-xs font-bold text-[#004776] uppercase tracking-wide">
                Sơ đồ phân cấp thứ bậc VTVL
              </h4>
              <span className="text-[11px] text-[#64748b] italic">
                Bấm vào node cha để sổ cấp dưới
              </span>
            </div>

            <UnitOrgTreeView
              node={treeData.rootNode}
              selectedNodeId={currentViewingNode.id}
              expandedIds={expandedIds}
              onToggleExpand={handleToggleExpand}
              onSelectNode={setSelectedNode}
            />
          </div>

          {/* Cột phải: Chi tiết vị trí & Danh mục công việc dự kiến */}
          <div className="md:col-span-7 flex flex-col overflow-hidden bg-white">
            <UnitOrgNodeDetailPane node={currentViewingNode} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 bg-[#f8fafc] border-t border-[#cbd5e1] flex items-center justify-between shrink-0">
          <span className="text-xs text-[#64748b]">
            Dữ liệu sơ đồ được liên kết tự động từ 15 sheet nghiệp vụ của {treeData.unitNameVi}.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#004776] text-white hover:bg-[#00385c] transition-colors cursor-pointer shadow-2xs"
          >
            Đóng sơ đồ
          </button>
        </div>
      </div>
    </div>
  );
}
