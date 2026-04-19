import type {
  NormalizedSheetData,
  NormalizedWorkbookData,
  ValidationIssue,
  ValidationResult,
} from "./types";
import type { ParsedDiagnosticoWorksheet } from "../import/types";
import { DIAGNOSTICO_TEMPLATE_SHEET_NAME } from "../../types/diagnostico";

function duplicateHeaders(headers: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const header of headers) {
    if (seen.has(header)) {
      duplicates.add(header);
    }
    seen.add(header);
  }

  return [...duplicates];
}

export function validateSheetStructure(sheet: NormalizedSheetData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (sheet.headers.length === 0) {
    issues.push({
      code: "SHEET_HEADERS_EMPTY",
      message: "Sheet has no headers after normalization.",
      severity: "warning",
      sheetName: sheet.sheetName,
    });
  }

  for (const header of duplicateHeaders(sheet.headers)) {
    issues.push({
      code: "SHEET_HEADER_DUPLICATE",
      message: `Duplicate header detected: ${header}`,
      severity: "error",
      sheetName: sheet.sheetName,
      column: header,
    });
  }

  for (const row of sheet.rows) {
    const keys = Object.keys(row.values);
    if (keys.length === 0) {
      issues.push({
        code: "ROW_EMPTY_AFTER_NORMALIZE",
        message: "Row became empty after normalization.",
        severity: "warning",
        sheetName: sheet.sheetName,
        rowIndex: row.rowIndex,
      });
      continue;
    }

    for (const key of keys) {
      if (!sheet.headers.includes(key)) {
        issues.push({
          code: "ROW_COLUMN_NOT_IN_HEADERS",
          message: `Row references column not present in headers: ${key}`,
          severity: "error",
          sheetName: sheet.sheetName,
          rowIndex: row.rowIndex,
          column: key,
        });
      }
    }
  }

  return issues;
}

export function validateWorkbookStructure(
  workbook: NormalizedWorkbookData,
): ValidationResult<NormalizedWorkbookData> {
  const issues: ValidationIssue[] = [];

  if (workbook.sheets.length === 0) {
    issues.push({
      code: "WORKBOOK_SHEETS_EMPTY",
      message: "Workbook does not contain sheets.",
      severity: "error",
    });
  }

  for (const sheet of workbook.sheets) {
    issues.push(...validateSheetStructure(sheet));
  }

  const totalRows = workbook.sheets.reduce((acc, sheet) => acc + sheet.rows.length, 0);
  if (totalRows === 0) {
    issues.push({
      code: "WORKBOOK_ROWS_EMPTY",
      message: "Workbook does not contain non-empty data rows.",
      severity: "error",
    });
  }

  return {
    ok: issues.every((issue) => issue.severity !== "error"),
    data: workbook,
    issues,
  };
}

export function validateDiagnosticoTemplateWorksheet(
  worksheet: ParsedDiagnosticoWorksheet,
): ValidationResult<ParsedDiagnosticoWorksheet> {
  const issues: ValidationIssue[] = [];

  if (worksheet.availableSheetNames.length !== 1) {
    issues.push({
      code: "WORKSHEET_COUNT_INVALID",
      message: "El archivo debe contener exactamente una hoja.",
      severity: "error",
    });
  }

  if (!worksheet.availableSheetNames.includes(DIAGNOSTICO_TEMPLATE_SHEET_NAME)) {
    issues.push({
      code: "WORKSHEET_TEMPLATE_NAME_MISSING",
      message: `No se encontró la hoja "${DIAGNOSTICO_TEMPLATE_SHEET_NAME}".`,
      severity: "error",
    });
  }

  if (!worksheet.sheetName) {
    issues.push({
      code: "WORKSHEET_MISSING",
      message: `No se pudo seleccionar la hoja "${DIAGNOSTICO_TEMPLATE_SHEET_NAME}".`,
      severity: "error",
    });
  }

  if (worksheet.rows.length === 0) {
    issues.push({
      code: "ROWS_EMPTY_AFTER_HEADER",
      message: "No hay filas de datos válidas después del encabezado.",
      severity: "error",
      sheetName: worksheet.sheetName ?? undefined,
    });
  }

  return {
    ok: issues.every((issue) => issue.severity !== "error"),
    data: worksheet,
    issues,
  };
}
