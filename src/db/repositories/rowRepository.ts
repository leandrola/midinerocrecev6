import type { AppDb } from "../appDb";
import { appDb } from "../appDb";
import type { RowPageQuery, RowRepositoryContract } from "./contracts";

export class RowRepository implements RowRepositoryContract {
  constructor(private readonly db: AppDb = appDb) {}

  async getCountByDataset(datasetId: string): Promise<number> {
    return this.db.rows.where("datasetId").equals(datasetId).count();
  }

  async getAllByDataset(datasetId: string) {
    return this.db.rows.where("datasetId").equals(datasetId).toArray();
  }

  async getPageByDataset(query: RowPageQuery) {
    const safePage = Math.max(1, query.page);
    const safePerPage = Math.max(1, query.perPage);
    const offset = (safePage - 1) * safePerPage;

    return this.db.rows
      .where("datasetId")
      .equals(query.datasetId)
      .offset(offset)
      .limit(safePerPage)
      .toArray();
  }

  async getByDatasetAndSheet(datasetId: string, sheetName: string) {
    return this.db.rows
      .where("[datasetId+sheetName]")
      .equals([datasetId, sheetName])
      .toArray();
  }
}

export const rowRepository = new RowRepository();
