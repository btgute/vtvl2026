'use client';

import React from 'react';
import { ExcelSheetKey, SheetOrderMode } from './excel-grid-types';
import { HcmuteUnit } from '@/types/vtvl';
import { ValidationReport } from '@/services/validation';
import { OperatorSession } from '@/services/telemetry/operator-session';
import { WorkspaceHeaderRow } from './WorkspaceHeaderRow';
import { WorkspaceActionsRow } from './WorkspaceActionsRow';

interface ScientificWorkspaceCardProps {
  activeSheet: ExcelSheetKey;
  currentUnit: HcmuteUnit;
  unitCode: string;
  activeStep: number;
  activeSheetIndex: number;
  totalSheets: number;
  rowsCount: number;
  isDirty: boolean;
  lastSaved: Date | null;
  qualityReport: ValidationReport;
  session: OperatorSession | null;
  orderMode: SheetOrderMode;
  canNext: boolean;
  isExporting: boolean;
  isC1Unlocked: boolean;
  onSelectSheet: (key: ExcelSheetKey) => void;
  onUnitChange: (code: string) => void;
  onSwitchSession: () => void;
  onToggleOrderMode: (mode: SheetOrderMode) => void;
  onOpenGuidance: () => void;
  onOpenQualityModal: () => void;
  onSaveSheet: () => void;
  onSaveAndNext: () => void;
  onExportWorkbook: () => void;
  onLoadTcnsData: () => void;
  onLoadRecommendedVtvls: () => void;
  onOpenUnlockModal: () => void;
}

export function ScientificWorkspaceCard(props: ScientificWorkspaceCardProps) {
  return (
    <div className="bg-white border border-[#cbd5e1] rounded-2xl shadow-2xs p-3 sm:p-4 flex flex-col gap-3 w-full max-w-full min-w-0">
      <WorkspaceHeaderRow
        activeSheet={props.activeSheet}
        currentUnit={props.currentUnit}
        unitCode={props.unitCode}
        activeStep={props.activeStep}
        activeSheetIndex={props.activeSheetIndex}
        totalSheets={props.totalSheets}
        orderMode={props.orderMode}
        qualityReport={props.qualityReport}
        onSelectSheet={props.onSelectSheet}
        onUnitChange={props.onUnitChange}
        onOpenGuidance={props.onOpenGuidance}
        onOpenQualityModal={props.onOpenQualityModal}
      />

      <WorkspaceActionsRow
        activeSheet={props.activeSheet}
        session={props.session}
        rowsCount={props.rowsCount}
        isDirty={props.isDirty}
        lastSaved={props.lastSaved}
        orderMode={props.orderMode}
        canNext={props.canNext}
        isExporting={props.isExporting}
        isC1Unlocked={props.isC1Unlocked}
        onSwitchSession={props.onSwitchSession}
        onToggleOrderMode={props.onToggleOrderMode}
        onOpenQualityModal={props.onOpenQualityModal}
        onSaveSheet={props.onSaveSheet}
        onSaveAndNext={props.onSaveAndNext}
        onExportWorkbook={props.onExportWorkbook}
        onLoadTcnsData={props.onLoadTcnsData}
        onLoadRecommendedVtvls={props.onLoadRecommendedVtvls}
        onOpenUnlockModal={props.onOpenUnlockModal}
      />
    </div>
  );
}
