import type { DatasetCellValue } from "../../types/dataset";

export interface NormalizedRowData {
  rowIndex: number;
  values: Record<string, DatasetCellValue>;
}

export interface NormalizedSheetData {
  sheetName: string;
  headers: string[];
  rows: NormalizedRowData[];
}

export interface NormalizedWorkbookData {
  sheets: NormalizedSheetData[];
}

export type ValidationSeverity = "error" | "warning";

export interface ValidationIssue {
  code: string;
  message: string;
  severity: ValidationSeverity;
  sheetName?: string;
  rowIndex?: number;
  column?: string;
}

export interface ValidationResult<T> {
  ok: boolean;
  data: T;
  issues: ValidationIssue[];
}
