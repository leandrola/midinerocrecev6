import type { DatasetCellValue } from "../../types/dataset";
import type { DatasetRowEntity } from "../../db/schema";

export type SortDirection = "asc" | "desc" | null;

export interface DataTableRow {
  id: string;
  sheetName: string;
  rowIndex: number;
  values: Record<string, DatasetCellValue>;
}

export function toDataTableRows(rows: DatasetRowEntity[]): DataTableRow[] {
  return rows.map((row) => ({
    id: row.id,
    sheetName: row.sheetName,
    rowIndex: row.rowIndex,
    values: row.values as Record<string, DatasetCellValue>,
  }));
}

export function extractColumnKeys(rows: DataTableRow[]): string[] {
  const keys = new Set<string>();

  for (const row of rows) {
    for (const key of Object.keys(row.values)) {
      keys.add(key);
    }
  }

  return Array.from(keys);
}

export function filterRowsBySearch(rows: DataTableRow[], searchQuery: string): DataTableRow[] {
  const query = searchQuery.trim().toLowerCase();
  if (!query) {
    return rows;
  }

  return rows.filter((row) => {
    if (row.sheetName.toLowerCase().includes(query)) {
      return true;
    }

    return Object.values(row.values).some((value) =>
      String(value ?? "").toLowerCase().includes(query),
    );
  });
}

function toComparable(value: DatasetCellValue): string | number {
  if (typeof value === "number") {
    return value;
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }
  return String(value ?? "");
}

export function sortRows(
  rows: DataTableRow[],
  sortKey: string | null,
  sortDirection: SortDirection,
): DataTableRow[] {
  if (!sortKey || !sortDirection) {
    return rows;
  }

  const sorted = [...rows].sort((left, right) => {
    const leftValue = toComparable(left.values[sortKey] ?? null);
    const rightValue = toComparable(right.values[sortKey] ?? null);

    if (typeof leftValue === "number" && typeof rightValue === "number") {
      return leftValue - rightValue;
    }

    return String(leftValue).localeCompare(String(rightValue), "es");
  });

  return sortDirection === "asc" ? sorted : sorted.reverse();
}

export function paginateRows(
  rows: DataTableRow[],
  page: number,
  perPage: number,
): DataTableRow[] {
  const safePage = Math.max(1, page);
  const safePerPage = Math.max(1, perPage);
  const offset = (safePage - 1) * safePerPage;
  return rows.slice(offset, offset + safePerPage);
}
