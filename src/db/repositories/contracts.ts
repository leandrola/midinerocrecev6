import type { DatasetEntity, DatasetRowEntity } from "../schema";

export interface ReplaceDatasetPayload {
  dataset: DatasetEntity;
  rows: DatasetRowEntity[];
}

export interface DatasetRepositoryContract {
  replaceActiveDataset(
    payload: ReplaceDatasetPayload,
  ): Promise<void>;
  getActiveDataset(): Promise<DatasetEntity | undefined>;
  clearAll(): Promise<void>;
}

export interface RowPageQuery {
  datasetId: string;
  page: number;
  perPage: number;
}

export interface RowRepositoryContract {
  getCountByDataset(datasetId: string): Promise<number>;
  getAllByDataset(datasetId: string): Promise<DatasetRowEntity[]>;
  getPageByDataset(query: RowPageQuery): Promise<DatasetRowEntity[]>;
  getByDatasetAndSheet(datasetId: string, sheetName: string): Promise<DatasetRowEntity[]>;
}
