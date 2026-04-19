import type { AppDb } from "../appDb";
import { appDb } from "../appDb";
import type {
  DatasetRepositoryContract,
  ReplaceDatasetPayload,
} from "./contracts";

const BULK_INSERT_CHUNK_SIZE = 2_000;

async function bulkInsertRowsInChunks(
  payload: ReplaceDatasetPayload,
  db: AppDb,
): Promise<void> {
  const totalRows = payload.rows.length;
  if (totalRows === 0) {
    return;
  }

  for (let start = 0; start < totalRows; start += BULK_INSERT_CHUNK_SIZE) {
    const end = Math.min(start + BULK_INSERT_CHUNK_SIZE, totalRows);
    const chunk = payload.rows.slice(start, end);
    await db.rows.bulkAdd(chunk);
  }
}

export class DatasetRepository implements DatasetRepositoryContract {
  constructor(private readonly db: AppDb = appDb) {}

  async replaceActiveDataset(payload: ReplaceDatasetPayload): Promise<void> {
    const datasetToInsert = {
      ...payload.dataset,
      isActive: 1 as const,
    };

    await this.db.transaction("rw", this.db.datasets, this.db.rows, async () => {
      // Full overwrite semantics: keep a single active dataset without row duplication.
      await this.db.rows.clear();
      await this.db.datasets.clear();
      await this.db.datasets.add(datasetToInsert);
      await bulkInsertRowsInChunks(payload, this.db);
    });
  }

  async getActiveDataset() {
    return this.db.datasets.where("isActive").equals(1).first();
  }

  async clearAll(): Promise<void> {
    await this.db.transaction("rw", this.db.datasets, this.db.rows, this.db.importRuns, async () => {
      await this.db.rows.clear();
      await this.db.datasets.clear();
      await this.db.importRuns.clear();
    });
  }
}

export const datasetRepository = new DatasetRepository();
