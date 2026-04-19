import type { DatasetMeta, DatasetSheetSummary } from "./dataset";

export type ImportPhase =
  | "idle"
  | "reading_file"
  | "parsing_workbook"
  | "normalizing_data"
  | "persisting_dataset"
  | "completed"
  | "error";

export interface ImportError {
  message: string;
  details?: string;
}

export interface ImportSummary {
  fileName: string;
  fileSizeBytes: number;
  sheets: DatasetSheetSummary[];
  totalRows: number;
}

export interface ImportResult {
  dataset: DatasetMeta;
  summary: ImportSummary;
}

export interface ImportStatus {
  phase: ImportPhase;
  startedAt: string | null;
  finishedAt: string | null;
  error: ImportError | null;
}
