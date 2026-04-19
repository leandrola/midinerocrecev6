import type { DatasetMeta } from "../types/dataset";
import type { ImportStatus } from "../types/import";

export interface DatasetUiFilters {
  searchQuery: string;
  showFilters: boolean;
}

export interface DatasetStateSnapshot {
  activeDataset: DatasetMeta | null;
  importStatus: ImportStatus;
  filters: DatasetUiFilters;
}
