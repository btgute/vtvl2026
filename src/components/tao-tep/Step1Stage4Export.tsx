'use client';

import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { HcmuteUnit, ProposedVtvlRow, UnitScaleMetrics, NgachAllocationRow, SplitResultSummary, UnitGroupKind } from '@/types/vtvl';
import { UnitScaleAndNgachTool } from './UnitScaleAndNgachTool';
import { Step1ReviewConfirm } from './Step1ReviewConfirm';
import { SplitResultBanner, RegenFormsFromUnitBox } from './SplitResultBanner';

interface Step1Stage4ExportProps {
  currentUnit: HcmuteUnit;
  kind: UnitGroupKind;
  scaleMetrics: UnitScaleMetrics;
  ngachAllocations: NgachAllocationRow[];
  positions: ProposedVtvlRow[];
  actorEmail: string;
  actorTitle: string;
  customDate: string;
  loading: boolean;
  includeZip: boolean;
  result: SplitResultSummary | null;
  stale: boolean;
  onSetIncludeZip: (v: boolean) => void;
  onChangeScaleMetrics: (next: UnitScaleMetrics) => void;
  onChangeNgachAllocations: (next: NgachAllocationRow[]) => void;
  onPushToPositionStaffCounts: (staffByPos: Record<string, number>) => void;
  onJumpToError: (err: { stage: 1 | 2 | 3 | 4 | 5; targetId: string }) => void;
  onConfirmExport: () => void;
  onDownload: (blob: Blob, filename: string) => void;
}

export function Step1Stage4Export({
  currentUnit,
  kind,
  scaleMetrics,
  ngachAllocations,
  positions,
  actorEmail,
  actorTitle,
  customDate,
  loading,
  includeZip,
  result,
  stale,
  onSetIncludeZip,
  onChangeScaleMetrics,
  onChangeNgachAllocations,
  onPushToPositionStaffCounts,
  onJumpToError,
  onConfirmExport,
  onDownload
}: Step1Stage4ExportProps) {
  return (
    <div className="space-y-5">
      <UnitScaleAndNgachTool
        unitCode={currentUnit.code}
        kind={kind}
        scaleMetrics={scaleMetrics}
        ngachAllocations={ngachAllocations}
        positions={positions}
        onChangeScaleMetrics={onChangeScaleMetrics}
        onChangeNgachAllocations={onChangeNgachAllocations}
        onPushToPositionStaffCounts={onPushToPositionStaffCounts}
      />
      <Step1ReviewConfirm
        unit={currentUnit}
        actorEmail={actorEmail}
        actorTitle={actorTitle}
        customDate={customDate}
        positions={positions}
        loading={loading}
        onJumpToError={onJumpToError}
        onConfirmExport={onConfirmExport}
      />
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            id="task-2-zip"
            type="checkbox"
            checked={includeZip}
            onChange={(e) => onSetIncludeZip(e.target.checked)}
            className="w-5 h-5 mt-0.5 accent-[var(--primary)] shrink-0"
          />
          <span className="space-y-0.5">
            <span className="block text-sm font-bold text-[var(--foreground)]">
              Kèm gói phiếu khảo sát B1–B2 riêng từng vị trí (.zip)
            </span>
            <span className="block text-xs text-[var(--ink-muted)]">
              Xuất thêm 1 tệp .zip cho {positions.length} vị trí của <strong>[{currentUnit.code}]</strong> để gửi cá nhân kê khai Bước 3 &amp; Bước 4.
            </span>
          </span>
        </label>
        <button
          id="task-2-export"
          type="button"
          disabled={loading}
          onClick={onConfirmExport}
          className="w-full sm:w-auto justify-center inline-flex items-center gap-2 min-h-[44px] px-5 rounded-xl bg-[var(--primary)] text-white font-bold text-sm shrink-0 cursor-pointer shadow-2xs"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{result && !stale ? 'Tạo lại 4 tệp' : `Khởi tạo 4 tệp ${currentUnit.code}`}</span>
        </button>
      </div>
      {result && <SplitResultBanner result={result} onDownload={onDownload} />}
      <RegenFormsFromUnitBox exportDate={customDate} includeZip={includeZip} onDownload={onDownload} />
    </div>
  );
}
