import type { DatasetRowEntity } from "../../db/schema";
import type { DatasetCellValue } from "../../types/dataset";

const SANKEY_EMPTY_LABEL = "Sin dato";

const SANKEY_FIELD_ORDER = [
  "canal",
  "funcionalidad",
  "deudaExperiencia",
  "prioridadDiseno",
  "factibilidadTecnica",
  "estado",
] as const;

type SankeyField = (typeof SANKEY_FIELD_ORDER)[number];

export interface SankeyNode {
  id: string;
  name: string;
  displayName: string;
  stageIndex: number;
  isFuncionalidadNode: boolean;
  isDeudaExperienciaNode: boolean;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

function normalizeCellToLabel(value: DatasetCellValue | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    return value.trim();
  }

  return String(value).trim();
}

function isEmptyLabel(value: string): boolean {
  return value.length === 0;
}

function buildStageScopedNodeId(stageIndex: number, label: string): string {
  return `stage_${stageIndex}::${label}`;
}

export function toDiagnosticoSankeyData(rows: DatasetRowEntity[]): SankeyData {
  const nodesById = new Map<string, SankeyNode>();
  const linkCounts = new Map<string, SankeyLink>();

  for (const row of rows) {
    const values = row.values as Record<string, DatasetCellValue>;
    const normalizedPath = SANKEY_FIELD_ORDER.map((field) =>
      normalizeCellToLabel(values[field]),
    );

    const isCompletelyEmpty = normalizedPath.every((value) => isEmptyLabel(value));
    if (isCompletelyEmpty) {
      continue;
    }

    const path = normalizedPath.map((value) =>
      isEmptyLabel(value) ? SANKEY_EMPTY_LABEL : value,
    );

    for (let stageIndex = 0; stageIndex < path.length; stageIndex += 1) {
      const label = path[stageIndex];
      const field = SANKEY_FIELD_ORDER[stageIndex];
      if (!label || !field) {
        continue;
      }

      const nodeId = buildStageScopedNodeId(stageIndex, label);
      if (!nodesById.has(nodeId)) {
        nodesById.set(nodeId, {
          id: nodeId,
          name: nodeId,
          displayName: label,
          stageIndex,
          isFuncionalidadNode: field === "funcionalidad",
          isDeudaExperienciaNode: field === "deudaExperiencia",
        });
      }
    }

    for (let stageIndex = 0; stageIndex < path.length - 1; stageIndex += 1) {
      const sourceLabel = path[stageIndex];
      const targetLabel = path[stageIndex + 1];
      if (!sourceLabel || !targetLabel) {
        continue;
      }

      const source = buildStageScopedNodeId(stageIndex, sourceLabel);
      const target = buildStageScopedNodeId(stageIndex + 1, targetLabel);
      const key = `${source}\u0000${target}`;
      const current = linkCounts.get(key);
      if (current) {
        current.value += 1;
      } else {
        linkCounts.set(key, {
          source,
          target,
          value: 1,
        });
      }
    }
  }

  return {
    nodes: Array.from(nodesById.values()),
    links: Array.from(linkCounts.values()),
  };
}
