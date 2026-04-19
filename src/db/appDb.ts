import Dexie, { type Table } from "dexie";
import {
  DB_NAME,
  DB_VERSION,
  type DatasetEntity,
  type DatasetRowEntity,
  type ImportRunEntity,
} from "./schema";

export class AppDb extends Dexie {
  datasets!: Table<DatasetEntity, string>;
  rows!: Table<DatasetRowEntity, string>;
  importRuns!: Table<ImportRunEntity, number>;

  constructor() {
    super(DB_NAME);

    this.version(DB_VERSION).stores({
      datasets: "&id, importedAt, isActive",
      rows: "&id, datasetId, sheetName, [datasetId+sheetName], [datasetId+rowIndex]",
      importRuns: "++id, datasetId, startedAt, status",
    });
  }
}

export const appDb = new AppDb();
