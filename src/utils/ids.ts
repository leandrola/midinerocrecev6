export function buildRowId(datasetId: string, sheetName: string, rowIndex: number): string {
  return `${datasetId}:${sheetName}:${rowIndex}`;
}
