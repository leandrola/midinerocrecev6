import type { DatasetMeta } from "../../types/dataset";
import { validateDiagnosticoTemplateWorksheet } from "../data/validate";
import { datasetRepository } from "../../db/repositories/datasetRepository";
import type { DatasetEntity, DatasetRowEntity } from "../../db/schema";
import {
  DIAGNOSTICO_TEMPLATE_COLUMNS,
  DIAGNOSTICO_TEMPLATE_SHEET_NAME,
} from "../../types/diagnostico";
import { buildRowId } from "../../utils/ids";
import { nowIso } from "../../utils/time";
import { parseWorkbookFile } from "./parseWorkbook";
import type { ImportExecutionResult, ImportProgressCallback } from "./types";

function buildDatasetId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `dataset_${Date.now()}`;
}

function toDatasetMeta(entity: DatasetEntity): DatasetMeta {
  return {
    id: entity.id,
    name: entity.name,
    importedAt: entity.importedAt,
    rowCount: entity.rowCount,
    sheetCount: entity.sheetCount,
  };
}

function toDatasetRows(
  datasetId: string,
  sheetName: string,
  rows: Array<{ rowIndex: number; values: Record<string, unknown> }>,
): DatasetRowEntity[] {
  return rows.map((row) => ({
    id: buildRowId(datasetId, sheetName, row.rowIndex),
    datasetId,
    sheetName,
    rowIndex: row.rowIndex,
    values: row.values,
  }));
}

function ensureXlsxFile(file: File): void {
  const normalizedName = file.name.toLowerCase();
  if (!normalizedName.endsWith(".xlsx")) {
    throw new Error("Solo se permiten archivos .xlsx");
  }
}

export async function importDatasetFromXlsx(
  file: File,
  onProgress?: ImportProgressCallback,
): Promise<ImportExecutionResult> {
  ensureXlsxFile(file);
  onProgress?.("reading_file");

  onProgress?.("parsing_workbook");
  const parsedWorksheet = await parseWorkbookFile(file);

  onProgress?.("normalizing_data");
  const validation = validateDiagnosticoTemplateWorksheet(parsedWorksheet);
  if (!validation.ok) {
    const errors = validation.issues.filter((issue) => issue.severity === "error");
    const message =
      errors.length > 0
        ? errors.map((issue) => issue.message).join("; ")
        : "El archivo no cumple la estructura mínima requerida.";
    throw new Error(message);
  }

  const datasetId = buildDatasetId();
  const sheetName = validation.data.sheetName ?? DIAGNOSTICO_TEMPLATE_SHEET_NAME;
  const datasetEntity: DatasetEntity = {
    id: datasetId,
    name: file.name,
    importedAt: nowIso(),
    sheetCount: 1,
    rowCount: validation.data.rows.length,
    isActive: 1,
  };

  const rows = toDatasetRows(
    datasetId,
    sheetName,
    validation.data.rows.map((row) => ({
      rowIndex: row.rowIndex,
      values: row.values as unknown as Record<string, unknown>,
    })),
  );

  onProgress?.("persisting_dataset");
  await datasetRepository.replaceActiveDataset({
    dataset: datasetEntity,
    rows,
  });

  return {
    dataset: toDatasetMeta(datasetEntity),
    summary: {
      fileName: file.name,
      fileSizeBytes: file.size,
      sheets: [
        {
          name: sheetName,
          rowCount: validation.data.rows.length,
          headers: DIAGNOSTICO_TEMPLATE_COLUMNS.map((column) => column.label),
        },
      ],
      totalRows: rows.length,
    },
    issues: validation.issues,
  };
}

export async function loadActiveDatasetMeta(): Promise<DatasetMeta | null> {
  const active = await datasetRepository.getActiveDataset();
  if (!active) {
    return null;
  }

  return toDatasetMeta(active);
}
