import type { DatasetCellValue } from "../../types/dataset";
import type { NormalizedRowData, NormalizedSheetData } from "./types";

const HEADER_FALLBACK_PREFIX = "column";

function slugifyHeader(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function isEmptyCell(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  return false;
}

export function isEmptyRow(values: unknown[]): boolean {
  return values.every((value) => isEmptyCell(value));
}

export function normalizeCellValue(value: unknown): DatasetCellValue {
  if (value === null || value === undefined) {
    return null;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value instanceof Date
  ) {
    return value;
  }

  return String(value);
}

export function normalizeTemplateCellValue(value: unknown): DatasetCellValue {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    value instanceof Date
  ) {
    return value;
  }

  const serialized = String(value).trim();
  return serialized.length > 0 ? serialized : null;
}

export function normalizeFixedWidthRow(
  sourceRow: unknown[],
  width: number,
): Array<unknown | null> {
  const safeWidth = Math.max(0, width);
  const normalized = Array.from({ length: safeWidth }, (_, index) => {
    const value = sourceRow[index];
    return value === undefined ? null : value;
  });

  return normalized;
}

export function normalizeHeaders(rawHeaders: unknown[]): string[] {
  const normalized = rawHeaders.map((raw, index) => {
    const base =
      typeof raw === "string"
        ? slugifyHeader(raw)
        : typeof raw === "number"
          ? slugifyHeader(String(raw))
          : "";

    return base.length > 0 ? base : `${HEADER_FALLBACK_PREFIX}_${index + 1}`;
  });

  const uniqueHeaders: string[] = [];
  const seen = new Map<string, number>();

  for (const header of normalized) {
    const currentCount = seen.get(header) ?? 0;
    const nextCount = currentCount + 1;
    seen.set(header, nextCount);

    uniqueHeaders.push(currentCount === 0 ? header : `${header}_${nextCount}`);
  }

  return uniqueHeaders;
}

export interface NormalizeSheetInput {
  sheetName: string;
  matrix: unknown[][];
  headerRowIndex?: number;
}

export function normalizeSheetFromMatrix({
  sheetName,
  matrix,
  headerRowIndex = 0,
}: NormalizeSheetInput): NormalizedSheetData {
  const safeHeaderRow = Math.max(0, headerRowIndex);
  const headerSource = matrix[safeHeaderRow] ?? [];
  const headers = normalizeHeaders(headerSource);
  const rows: NormalizedRowData[] = [];

  for (let rowIndex = safeHeaderRow + 1; rowIndex < matrix.length; rowIndex += 1) {
    const sourceRow = matrix[rowIndex] ?? [];
    if (isEmptyRow(sourceRow)) {
      continue;
    }

    const values: Record<string, DatasetCellValue> = {};
    for (let columnIndex = 0; columnIndex < headers.length; columnIndex += 1) {
      const key = headers[columnIndex];
      if (!key) {
        continue;
      }

      const rawValue = sourceRow[columnIndex];
      values[key] = normalizeCellValue(rawValue);
    }

    rows.push({
      rowIndex: rowIndex + 1,
      values,
    });
  }

  return {
    sheetName,
    headers,
    rows,
  };
}
