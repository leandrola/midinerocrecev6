export const DB_NAME = "midinerocrece-v6";
export const DB_VERSION = 1;

export interface DatasetEntity {
  id: string;
  name: string;
  importedAt: string;
  sheetCount: number;
  rowCount: number;
  isActive: 0 | 1;
}

export interface DatasetRowEntity {
  id: string;
  datasetId: string;
  sheetName: string;
  rowIndex: number;
  values: Record<string, unknown>;
}

export interface ImportRunEntity {
  id?: number;
  datasetId: string;
  fileName: string;
  startedAt: string;
  finishedAt: string;
  status: "success" | "error";
  rowCount: number;
  message?: string;
}
