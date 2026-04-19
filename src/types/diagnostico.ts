import type { DatasetCellValue } from "./dataset";

export interface DiagnosticoTemplateRow {
  producto: DatasetCellValue;
  funcionalidad: DatasetCellValue;
  canal: DatasetCellValue;
  squad: DatasetCellValue;
  deudaExperiencia: DatasetCellValue;
  objetivoDolor: DatasetCellValue;
  kpi: DatasetCellValue;
  cuandoSeDetecto: DatasetCellValue;
  recurrencia: DatasetCellValue;
  criticidad: DatasetCellValue;
  cliente: DatasetCellValue;
  prioridadDiseno: DatasetCellValue;
  prioridadSquad: DatasetCellValue;
  factibilidadTecnica: DatasetCellValue;
  racionalNivelIndicado: DatasetCellValue;
  fueCorregida: DatasetCellValue;
  estado: DatasetCellValue;
}

export type DiagnosticoTemplateField = keyof DiagnosticoTemplateRow;

export interface DiagnosticoTemplateColumn {
  index: number;
  field: DiagnosticoTemplateField;
  label: string;
}

export const DIAGNOSTICO_TEMPLATE_SHEET_NAME = "Deuda de Experiencia";

export const DIAGNOSTICO_TEMPLATE_COLUMNS: readonly DiagnosticoTemplateColumn[] = [
  { index: 0, field: "producto", label: "Productos" },
  { index: 1, field: "funcionalidad", label: "Funcionalidad" },
  { index: 2, field: "canal", label: "Canal" },
  { index: 3, field: "squad", label: "Squad" },
  { index: 4, field: "deudaExperiencia", label: "Deuda de Experiencia" },
  { index: 5, field: "objetivoDolor", label: "Objetivo / Dolor" },
  { index: 6, field: "kpi", label: "KPI" },
  { index: 7, field: "cuandoSeDetecto", label: "Cuándo se detectó" },
  { index: 8, field: "recurrencia", label: "Recurrencia" },
  { index: 9, field: "criticidad", label: "Criticidad" },
  { index: 10, field: "cliente", label: "Renta Cliente" },
  { index: 11, field: "prioridadDiseno", label: "Prioridad diseño" },
  { index: 12, field: "prioridadSquad", label: "Prioridad Squad" },
  { index: 13, field: "factibilidadTecnica", label: "Factibilidad técnica" },
  { index: 14, field: "racionalNivelIndicado", label: "Racional del nivel indicado" },
  { index: 15, field: "fueCorregida", label: "¿Fue corregida?" },
  { index: 16, field: "estado", label: "Estado" },
] as const;
