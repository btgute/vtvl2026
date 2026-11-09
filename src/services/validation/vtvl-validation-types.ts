import { ExcelSheetKey, GenericGridRow } from '@/components/excel-grid/excel-grid-types';

export type ValidationSeverity = 'fix' | 'evidence' | 'review';

export interface ValidationIssue {
  id: string;
  ruleId: string;
  sheetKey: ExcelSheetKey;
  sheetName: string;
  cellRef: string; // Tọa độ ví dụ: '1. A1_NhiemVu!A3' hoặc 'B1!C5'
  rowId?: string;
  field?: string;
  severity: ValidationSeverity;
  title: string;
  currentValue: string;
  suggestion: string;
  legalBasis?: string;
}

export interface ValidationSummary {
  totalIssues: number;
  fixCount: number;
  evidenceCount: number;
  reviewCount: number;
  countsBySheet: Record<string, number>;
  isEligibleToSubmit: boolean; // Đạt điều kiện nộp khi fixCount === 0
  scorePercent: number; // Tỷ lệ đạt chuẩn chất lượng dữ liệu (0..100)
}

export interface ValidationReport {
  unitCode: string;
  unitName: string;
  summary: ValidationSummary;
  issues: ValidationIssue[];
  validatedAt: string;
}

export interface SheetValidatorContext {
  unitCode: string;
  unitName: string;
  allData: Record<ExcelSheetKey, GenericGridRow[]>;
}

