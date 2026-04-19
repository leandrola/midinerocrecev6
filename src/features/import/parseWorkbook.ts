import * as XLSX from "xlsx";
import { DIAGNOSTICO_TEMPLATE_COLUMNS } from "../../types/diagnostico";
import {
  isEmptyRow,
  normalizeFixedWidthRow,
  normalizeTemplateCellValue,
} from "../data/normalize";
import type {
  ParsedDiagnosticoTemplateRow,
  ParsedDiagnosticoWorksheet,
} from "./types";
import { DIAGNOSTICO_TEMPLATE_SHEET_NAME } from "../../types/diagnostico";

function parseSheetMatrix(worksheet: XLSX.WorkSheet): unknown[][] {
  return XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: true,
    defval: null,
    blankrows: false,
  }) as unknown[][];
}

function mapFixedTemplateRow(
  sourceRow: Array<unknown | null>,
  rowIndex: number,
): ParsedDiagnosticoTemplateRow {
  return {
    rowIndex: rowIndex + 1,
    values: {
      producto: normalizeTemplateCellValue(sourceRow[0]),
      funcionalidad: normalizeTemplateCellValue(sourceRow[1]),
      canal: normalizeTemplateCellValue(sourceRow[2]),
      squad: normalizeTemplateCellValue(sourceRow[3]),
      deudaExperiencia: normalizeTemplateCellValue(sourceRow[4]),
      objetivoDolor: normalizeTemplateCellValue(sourceRow[5]),
      kpi: normalizeTemplateCellValue(sourceRow[6]),
      cuandoSeDetecto: normalizeTemplateCellValue(sourceRow[7]),
      recurrencia: normalizeTemplateCellValue(sourceRow[8]),
      criticidad: normalizeTemplateCellValue(sourceRow[9]),
      cliente: normalizeTemplateCellValue(sourceRow[10]),
      prioridadDiseno: normalizeTemplateCellValue(sourceRow[11]),
      prioridadSquad: normalizeTemplateCellValue(sourceRow[12]),
      factibilidadTecnica: normalizeTemplateCellValue(sourceRow[13]),
      racionalNivelIndicado: normalizeTemplateCellValue(sourceRow[14]),
      fueCorregida: normalizeTemplateCellValue(sourceRow[15]),
      estado: normalizeTemplateCellValue(sourceRow[16]),
    },
  };
}

export async function parseWorkbookFile(file: File): Promise<ParsedDiagnosticoWorksheet> {
  const fileBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(fileBuffer, {
    type: "array",
    cellDates: true,
    dense: true,
  });

  const availableSheetNames = [...workbook.SheetNames];
  const selectedSheetName = workbook.SheetNames.includes(DIAGNOSTICO_TEMPLATE_SHEET_NAME)
    ? DIAGNOSTICO_TEMPLATE_SHEET_NAME
    : null;
  if (!selectedSheetName) {
    return {
      availableSheetNames,
      sheetName: null,
      headerRow: [],
      rows: [],
    };
  }

  const worksheet = workbook.Sheets[selectedSheetName];
  if (!worksheet) {
    return {
      availableSheetNames,
      sheetName: null,
      headerRow: [],
      rows: [],
    };
  }

  const matrix = parseSheetMatrix(worksheet);
  const headerRow = normalizeFixedWidthRow(
    matrix[0] ?? [],
    DIAGNOSTICO_TEMPLATE_COLUMNS.length,
  );
  const rows: ParsedDiagnosticoTemplateRow[] = [];

  // Row index 0 is header and must never be persisted as data.
  for (let rowIndex = 1; rowIndex < matrix.length; rowIndex += 1) {
    const normalizedRow = normalizeFixedWidthRow(
      matrix[rowIndex] ?? [],
      DIAGNOSTICO_TEMPLATE_COLUMNS.length,
    );
    if (isEmptyRow(normalizedRow)) {
      continue;
    }

    rows.push(mapFixedTemplateRow(normalizedRow, rowIndex));
  }

  return {
    availableSheetNames,
    sheetName: selectedSheetName,
    headerRow,
    rows,
  };
}
