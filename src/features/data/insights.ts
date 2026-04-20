import type { DatasetRowEntity } from "../../db/schema";

export interface InsightsKpis {
  totalIniciativas: number;
  enDesarrollo: number;
  noAbordadaAun: number;
  prioridadAlta: number;
}

export interface InsightsRiskMetric {
  id: string;
  label: string;
  count: number;
  percentage: number;
}

export interface InsightsRankItem {
  value: string;
  count: number;
  percentage: number;
}

export interface InsightsSummary {
  totalRows: number;
  kpis: InsightsKpis;
  riskCombinations: InsightsRiskMetric[];
  topDeudaExperiencia: InsightsRankItem[];
  estadoDistribution: InsightsRankItem[];
  topCanal: InsightsRankItem[];
}

type RowValues = Record<string, unknown>;

function normalizeText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function normalizeForCompare(value: unknown): string {
  return (
    normalizeText(value)
      ?.normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase() ?? ""
  );
}

function safePercentage(count: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return (count / total) * 100;
}

function countByCondition(
  rows: RowValues[],
  predicate: (row: RowValues) => boolean,
): number {
  let count = 0;
  for (const row of rows) {
    if (predicate(row)) {
      count += 1;
    }
  }
  return count;
}

function groupByField(rows: RowValues[], field: string): Map<string, number> {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const raw = normalizeText(row[field]) ?? "Sin dato";
    counts.set(raw, (counts.get(raw) ?? 0) + 1);
  }

  return counts;
}

function topFromField(
  rows: RowValues[],
  field: string,
  total: number,
  limit = 5,
): InsightsRankItem[] {
  const grouped = groupByField(rows, field);

  return Array.from(grouped.entries())
    .map(([value, count]) => ({
      value,
      count,
      percentage: safePercentage(count, total),
    }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.value.localeCompare(b.value, "es");
    })
    .slice(0, limit);
}

export function buildInsightsSummary(rows: DatasetRowEntity[]): InsightsSummary {
  const rowValues = rows.map((row) => row.values as RowValues);
  const totalRows = rowValues.length;

  const kpis: InsightsKpis = {
    totalIniciativas: totalRows,
    enDesarrollo: countByCondition(
      rowValues,
      (row) => normalizeForCompare(row.estado) === "en desarrollo",
    ),
    noAbordadaAun: countByCondition(
      rowValues,
      (row) => normalizeForCompare(row.estado) === "no abordada aun",
    ),
    prioridadAlta: countByCondition(
      rowValues,
      (row) => normalizeForCompare(row.prioridadDiseno) === "prioridad alta",
    ),
  };

  const riskCombinations: InsightsRiskMetric[] = [
    {
      id: "alta_no_abordada",
      label: "Prioridad Alta + No abordada aún",
      count: countByCondition(
        rowValues,
        (row) =>
          normalizeForCompare(row.prioridadDiseno) === "prioridad alta" &&
          normalizeForCompare(row.estado) === "no abordada aún",
      ),
      percentage: 0,
    },
    {
      id: "alta_factibilidad_baja",
      label: "Prioridad Alta + Factibilidad Baja",
      count: countByCondition(
        rowValues,
        (row) =>
          normalizeForCompare(row.prioridadDiseno) === "prioridad alta" &&
          normalizeForCompare(row.factibilidadTecnica) === "factibilidad baja",
      ),
      percentage: 0,
    },
    {
      id: "alta_en_desarrollo",
      label: "Prioridad Alta + En desarrollo",
      count: countByCondition(
        rowValues,
        (row) =>
          normalizeForCompare(row.prioridadDiseno) === "prioridad alta" &&
          normalizeForCompare(row.estado) === "en desarrollo",
      ),
      percentage: 0,
    },
    {
      id: "media_no_abordada",
      label: "Prioridad Media + No abordada aún",
      count: countByCondition(
        rowValues,
        (row) =>
          normalizeForCompare(row.prioridadDiseno) === "prioridad media" &&
          normalizeForCompare(row.estado) === "no abordada aun",
      ),
      percentage: 0,
    },
  ].map((metric) => ({
    ...metric,
    percentage: safePercentage(metric.count, totalRows),
  }));

  return {
    totalRows,
    kpis,
    riskCombinations,
    topDeudaExperiencia: topFromField(rowValues, "deudaExperiencia", totalRows, 5),
    estadoDistribution: topFromField(rowValues, "estado", totalRows, 20),
    topCanal: topFromField(rowValues, "canal", totalRows, 5),
  };
}
