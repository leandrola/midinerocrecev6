export type DatasetId = string;

export interface DatasetMeta {
  id: DatasetId;
  name: string;
  importedAt: string;
  sheetCount: number;
  rowCount: number;
}

export interface DatasetSheetSummary {
  name: string;
  rowCount: number;
  headers: string[];
}

export type DatasetCellValue = string | number | boolean | Date | null;

export interface DatasetRowRecord {
  id: string;
  datasetId: DatasetId;
  sheetName: string;
  rowIndex: number;
  values: Record<string, DatasetCellValue>;
}
