import type { DatasetRowEntity } from "../../db/schema";

export type InsightRecommendationType = "alert" | "risk" | "opportunity";
export type InsightRecommendationSeverity = "high" | "medium" | "low";

export interface InsightRecommendation {
  type: InsightRecommendationType;
  message: string;
  severity: InsightRecommendationSeverity;
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

function safePercentage(count: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return (count / total) * 100;
}

export function buildInsightRecommendations(rows: DatasetRowEntity[]): InsightRecommendation[] {
  const rowValues = rows.map((row) => row.values as RowValues);
  const total = rowValues.length;
  const recommendations: InsightRecommendation[] = [];

  if (total === 0) {
    return recommendations;
  }

  const prioridadAltaNoAbordada = countByCondition(
    rowValues,
    (row) =>
      normalizeForCompare(row.prioridadDiseno) === "prioridad alta" &&
      normalizeForCompare(row.estado) === "no abordada aun",
  );
  if (prioridadAltaNoAbordada > 0) {
    recommendations.push({
      type: "alert",
      severity: "high",
      message: `Hay ${prioridadAltaNoAbordada} iniciativas de Prioridad Alta que aún no fueron abordadas`,
    });
  }

  const prioridadAltaFactibilidadBaja = countByCondition(
    rowValues,
    (row) =>
      normalizeForCompare(row.prioridadDiseno) === "prioridad alta" &&
      (normalizeForCompare(row.factibilidadTecnica) === "baja" ||
        normalizeForCompare(row.factibilidadTecnica) === "factibilidad baja"),
  );
  if (prioridadAltaFactibilidadBaja > 0) {
    recommendations.push({
      type: "alert",
      severity: "high",
      message: "Existen iniciativas de alta prioridad con baja factibilidad técnica",
    });
  }

  const canalCounts = new Map<string, number>();
  for (const row of rowValues) {
    const canal = normalizeText(row.canal) ?? "Sin dato";
    canalCounts.set(canal, (canalCounts.get(canal) ?? 0) + 1);
  }
  let topCanal: { value: string; count: number } | null = null;
  for (const [value, count] of canalCounts.entries()) {
    if (!topCanal || count > topCanal.count) {
      topCanal = { value, count };
    }
  }
  if (topCanal) {
    const concentration = safePercentage(topCanal.count, total);
    if (concentration > 40) {
      recommendations.push({
        type: "risk",
        severity: "medium",
        message: `El canal ${topCanal.value} concentra la mayor parte del portfolio (${concentration.toFixed(1)}%)`,
      });
    }
  }

  const factibilidadAltaNoDesarrollo = countByCondition(
    rowValues,
    (row) =>
      (normalizeForCompare(row.factibilidadTecnica) === "alta" ||
        normalizeForCompare(row.factibilidadTecnica) === "factibilidad alta") &&
      normalizeForCompare(row.estado) !== "en desarrollo",
  );
  if (factibilidadAltaNoDesarrollo > 0) {
    recommendations.push({
      type: "opportunity",
      severity: "medium",
      message: "Hay iniciativas con alta factibilidad que aún no están en desarrollo",
    });
  }

  const deudaCounts = new Map<string, number>();
  for (const row of rowValues) {
    const deuda = normalizeText(row.deudaExperiencia);
    if (!deuda) {
      continue;
    }
    deudaCounts.set(deuda, (deudaCounts.get(deuda) ?? 0) + 1);
  }
  const hasRecurrentDebts = Array.from(deudaCounts.values()).some((count) => count >= 2);
  if (hasRecurrentDebts) {
    recommendations.push({
      type: "opportunity",
      severity: "low",
      message:
        "Se detectaron deudas recurrentes que podrían resolverse con una solución transversal",
    });
  }

  return recommendations;
}
