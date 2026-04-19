import type { ValidationIssue } from "../data/types";
import type { ImportResult, ImportPhase } from "../../types/import";
import type { DiagnosticoTemplateRow } from "../../types/diagnostico";

export interface ImportExecutionResult extends ImportResult {
  issues: ValidationIssue[];
}

export type ImportProgressCallback = (phase: ImportPhase) => void;

export interface ParsedDiagnosticoTemplateRow {
  rowIndex: number;
  values: DiagnosticoTemplateRow;
}

export interface ParsedDiagnosticoWorksheet {
  availableSheetNames: string[];
  sheetName: string | null;
  headerRow: unknown[];
  rows: ParsedDiagnosticoTemplateRow[];
}
