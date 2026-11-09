import { ExcelSheetKey, ExcelSheetMeta } from './excel-grid-types';
import { CORE_EXCEL_SHEET_METAS } from './excel-sheet-metas-core';
import { EVAL_EXCEL_SHEET_METAS } from './excel-sheet-metas-eval';

export const EXCEL_SHEET_METAS: Record<ExcelSheetKey, ExcelSheetMeta> = {
  ...CORE_EXCEL_SHEET_METAS,
  ...EVAL_EXCEL_SHEET_METAS
};

export { CORE_EXCEL_SHEET_METAS, EVAL_EXCEL_SHEET_METAS };
