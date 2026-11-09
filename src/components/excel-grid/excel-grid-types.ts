export type ExcelSheetKey =
  | 'C1'
  | 'A1'
  | 'A2'
  | 'DM_SP'
  | 'B1'
  | 'B2_CT'
  | 'B2'
  | 'C2'
  | 'D1'
  | 'C3'
  | 'DU_BAO'
  | 'D2'
  | 'K'
  | 'T'
  | 'S';

export interface ExcelColumnDef {
  colLetter: string;
  field: string;
  headerName: string;
  width?: string;
  type?: 'text' | 'number' | 'select' | 'status';
  isFormula?: boolean;
  formulaHint?: string;
  selectOptions?: string[];
  readOnly?: boolean;
}

export interface ExcelSheetMeta {
  key: ExcelSheetKey;
  stepNum: number;
  sheetNumberPrefix: string;
  sheetName: string;
  shortLabel: string;
  title: string;
  guideDesc: string;
  ruleHint: string;
  columns: ExcelColumnDef[];
}

export interface GenericGridRow {
  id: string;
  [key: string]: string | number | boolean | undefined;
}

export interface GridWorkbookState {
  unitCode: string;
  unitNameVi: string;
  activeSheet: ExcelSheetKey;
  data: Record<ExcelSheetKey, GenericGridRow[]>;
  lastSavedAt: string;
}

export const WORKFLOW_SHEET_ORDER: ExcelSheetKey[] = [
  'C1',
  'A1',
  'A2',
  'DM_SP',
  'B1',
  'B2_CT',
  'B2',
  'C2',
  'D1',
  'C3',
  'DU_BAO',
  'D2',
  'K',
  'T',
  'S'
];
