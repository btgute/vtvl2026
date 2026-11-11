'use client';

import React from 'react';
import {
  Building2, UserCheck, Briefcase, GraduationCap, ChevronDown,
  ChevronRight, Users, CheckSquare, PlusCircle, MinusCircle
} from 'lucide-react';
import { UnitOrgNode } from '@/services/org-chart/unit-org-tree-types';

interface UnitOrgTreeViewProps {
  node: UnitOrgNode;
  selectedNodeId: string;
  expandedIds: Set<string>;
  onToggleExpand: (nodeId: string) => void;
  onSelectNode: (node: UnitOrgNode) => void;
  level?: number;
}

export function UnitOrgTreeView({
  node,
  selectedNodeId,
  expandedIds,
  onToggleExpand,
  onSelectNode,
  level = 0
}: UnitOrgTreeViewProps) {
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedNodeId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectNode(node);
    if (hasChildren) {
      onToggleExpand(node.id);
    }
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(node.id);
  };

  const getNodeIcon = () => {
    switch (node.nodeType) {
      case 'unit':
        return <Building2 className="w-4 h-4 text-[#005fa3]" />;
      case 'dean':
        return <UserCheck className="w-4 h-4 text-emerald-600" />;
      case 'vice-dean':
        return <Briefcase className="w-4 h-4 text-sky-600" />;
      default:
        return <GraduationCap className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getNodeBadgeClass = () => {
    switch (node.nodeType) {
      case 'unit':
        return 'bg-[#004776] text-white';
      case 'dean':
        return 'bg-emerald-700 text-white';
      case 'vice-dean':
        return 'bg-sky-700 text-white';
      default:
        return 'bg-indigo-50 text-indigo-800 border border-indigo-200';
    }
  };

  return (
    <div className="relative select-none">
      {/* Node container */}
      <div
        onClick={handleCardClick}
        className={`group flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
          isSelected
            ? 'border-[#005fa3] bg-sky-50/80 shadow-xs ring-2 ring-[#005fa3]/25'
            : 'border-[#cbd5e1] hover:border-[#005fa3]/50 bg-white hover:bg-slate-50/70'
        }`}
      >
        {/* Toggle chevron (nếu có con) */}
        <div className="pt-0.5 shrink-0">
          {hasChildren ? (
            <button
              type="button"
              onClick={handleToggleClick}
              className="w-6 h-6 rounded-md hover:bg-black/5 flex items-center justify-center text-[#64748b] transition-colors cursor-pointer"
              title={isExpanded ? 'Thu gọn nhánh dưới' : 'Mở rộng nhánh con'}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-[#004776]" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[#004776]" />
              )}
            </button>
          ) : (
            <div className="w-6 h-6 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#cbd5e1]" />
            </div>
          )}
        </div>

        {/* Node icon & info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              {getNodeIcon()}
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${getNodeBadgeClass()}`}>
              {node.levelLabel}
            </span>
            <span className="text-[11px] font-semibold text-[#64748b]">
              [{node.roleCode}]
            </span>
          </div>

          <h4 className="text-xs sm:text-sm font-bold text-[#004776] mt-1 line-clamp-2 leading-snug">
            {node.title}
          </h4>

          {node.groupLabel && (
            <p className="text-[11px] text-[#64748b] mt-0.5 truncate">
              {node.groupLabel}
            </p>
          )}

          {/* Quick stats chips */}
          <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px]">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <Users className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>{node.expectedStaffCount} người</span>
            </span>

            <span className="inline-flex items-center gap-1 font-semibold text-[#004776] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              <CheckSquare className="w-3 h-3 text-[#005fa3] shrink-0" />
              <span>{node.tasks.length} công việc</span>
            </span>

            {hasChildren && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#64748b] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 ml-auto">
                {isExpanded ? 'Đang mở' : `+${node.children.length} cấp dưới`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Children branches */}
      {hasChildren && isExpanded && (
        <div className="mt-2 pl-4 sm:pl-6 ml-3 sm:ml-4 border-l-2 border-dashed border-[#cbd5e1] space-y-2">
          {node.children.map((child) => (
            <UnitOrgTreeView
              key={child.id}
              node={child}
              selectedNodeId={selectedNodeId}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onSelectNode={onSelectNode}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
