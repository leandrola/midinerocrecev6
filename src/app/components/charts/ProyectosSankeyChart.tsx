import { useEffect, useMemo, useState } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import type { EChartsCoreOption } from "echarts/core";
import * as echarts from "echarts/core";
import { SankeyChart } from "echarts/charts";
import { TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { SankeyData } from "../../../features/data";
import {
  computeHoveredNodeRouteIsolation,
  resolveFullSubgraphHighlight,
  type SankeyGraphLink,
  toSankeyLinkKey,
} from "./sankeyHighlight";

echarts.use([SankeyChart, TooltipComponent, CanvasRenderer]);

interface Props {
  data: SankeyData;
}

interface SankeyLabelFormatterData {
  displayName?: string;
  stageIndex?: number;
  isFuncionalidadNode?: boolean;
  isDeudaExperienciaNode?: boolean;
}

interface SankeyLabelFormatterParams {
  name?: string;
  dataType?: string;
  data?: SankeyLabelFormatterData;
}

interface SankeyHoverEventParams {
  dataType?: string;
  name?: string;
}

interface SankeyRenderNode extends SankeyLabelFormatterData {
  name: string;
  itemStyle: {
    color: string;
    opacity?: number;
    borderWidth?: number;
    borderColor?: string;
  };
}

interface SankeyRenderLink {
  source: string;
  target: string;
  value: number;
  lineStyle?: {
    opacity?: number;
  };
}

function truncateLabel(value: string, maxLength = 15): string {
  if (!value) {
    return "";
  }

  return value.length > maxLength
    ? `${value.slice(0, maxLength).trim()}...`
    : value;
}

const SANKEY_STAGE_COLORS = [
  "#5B4F8C", // canal
  "#FF6A2B", // funcionalidad
  "#F5B74E", // deudaExperiencia
  "#2F6FD6", // prioridadDiseno
  "#5B4F8C", // factibilidadTecnica
  "#FF6A2B", // estado
] as const;

const SANKEY_FALLBACK_COLOR = "#E6E6E6";

// New mode toggle requested by product.
const USE_HOVER_NODE_ROUTE_ISOLATION = true;
// Previous custom mode remains as rollback path.
const USE_FULL_SUBGRAPH_HIGHLIGHT = false;

const ACTIVE_NODE_OPACITY = 1;
const DIMMED_NODE_OPACITY = 0.14;
const ACTIVE_LINK_OPACITY = 0.42;
const DIMMED_LINK_OPACITY = 0.06;

function buildLabelFormatter(params: SankeyLabelFormatterParams): string {
  const label = params.data?.displayName ?? params.name ?? "";
  if (
    params.dataType === "node" &&
    (params.data?.isDeudaExperienciaNode === true ||
      params.data?.isFuncionalidadNode === true)
  ) {
    return truncateLabel(label);
  }
  return label;
}

function toRenderOptions({
  nodes,
  links,
  useAdjacencyEmphasis,
}: {
  nodes: SankeyRenderNode[];
  links: SankeyRenderLink[];
  useAdjacencyEmphasis: boolean;
}): EChartsCoreOption {
  return {
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
      formatter: (params: {
        dataType?: "node" | "edge";
        data?: {
          displayName?: string;
          source?: string;
          target?: string;
          value?: number;
        };
        value?: number;
      }) => {
        const nodeDisplayNameById = new Map(nodes.map((node) => [node.name, node.displayName ?? node.name]));

        if (params.dataType === "node") {
          const label = params.data?.displayName ?? "";
          const value = params.data?.value ?? params.value;
          return value !== undefined ? `${label}: ${value}` : label;
        }

        if (params.dataType === "edge") {
          const sourceId = params.data?.source ?? "";
          const targetId = params.data?.target ?? "";
          const sourceLabel = nodeDisplayNameById.get(sourceId) ?? sourceId;
          const targetLabel = nodeDisplayNameById.get(targetId) ?? targetId;
          const value = params.data?.value ?? params.value ?? "";
          return `${sourceLabel} → ${targetLabel}: ${String(value)}`;
        }

        return "";
      },
    },
    series: [
      {
        type: "sankey",
        data: nodes,
        links,
        draggable: false,
        emphasis: {
          focus: useAdjacencyEmphasis ? "adjacency" : "none",
        },
        lineStyle: {
          curveness: 0.45,
          opacity: useAdjacencyEmphasis ? 0.3 : ACTIVE_LINK_OPACITY,
          color: "source",
        },
        nodeGap: 14,
        nodeAlign: "justify",
        label: {
          color: "#2b2b2b",
          fontFamily: "Inter, sans-serif",
          fontSize: 12,
          formatter: buildLabelFormatter,
        },
      },
    ],
  };
}

export function ProyectosSankeyChart({ data }: Props) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  useEffect(() => {
    setHoveredNodeId(null);
  }, [data]);

  const sankeyRenderData = useMemo(() => {
    const nodes: SankeyRenderNode[] = data.nodes.map((node) => {
      return {
        ...node,
        name: node.id,
        itemStyle: {
          color: SANKEY_STAGE_COLORS[node.stageIndex] ?? SANKEY_FALLBACK_COLOR,
        },
      };
    });

    const links: SankeyRenderLink[] = data.links.map((link) => ({
      source: link.source,
      target: link.target,
      value: link.value,
    }));

    const graphLinks: SankeyGraphLink[] = links.map((link, index) => ({
      id: `link:${index}`,
      sourceId: link.source,
      targetId: link.target,
    }));

    return {
      nodes,
      links,
      graphLinks,
    };
  }, [data.links, data.nodes]);

  const routeIsolationOption = useMemo<EChartsCoreOption>(() => {
    const highlight = hoveredNodeId
      ? computeHoveredNodeRouteIsolation(hoveredNodeId, sankeyRenderData.graphLinks)
      : null;

    const nodes = sankeyRenderData.nodes.map((node) => {
      const isIncluded = highlight ? highlight.nodeIds.has(node.name) : true;
      const isHovered = hoveredNodeId === node.name;

      return {
        ...node,
        itemStyle: {
          ...node.itemStyle,
          opacity: isIncluded ? ACTIVE_NODE_OPACITY : DIMMED_NODE_OPACITY,
          borderWidth: isHovered ? 1.2 : 0,
          borderColor: isHovered ? "#2b2b2b" : "transparent",
        },
      };
    });

    const links = sankeyRenderData.links.map((link) => ({
      ...link,
      lineStyle: {
        opacity:
          highlight &&
          !highlight.linkKeys.has(toSankeyLinkKey(link.source, link.target))
            ? DIMMED_LINK_OPACITY
            : ACTIVE_LINK_OPACITY,
      },
    }));

    return toRenderOptions({
      nodes,
      links,
      useAdjacencyEmphasis: false,
    });
  }, [hoveredNodeId, sankeyRenderData.graphLinks, sankeyRenderData.links, sankeyRenderData.nodes]);

  const fullSubgraphOption = useMemo<EChartsCoreOption>(() => {
    const highlight = hoveredNodeId
      ? resolveFullSubgraphHighlight(hoveredNodeId, sankeyRenderData.graphLinks)
      : null;

    const nodes = sankeyRenderData.nodes.map((node) => ({
      ...node,
      itemStyle: {
        ...node.itemStyle,
        opacity:
          highlight && !highlight.nodeIds.has(node.name)
            ? DIMMED_NODE_OPACITY
            : ACTIVE_NODE_OPACITY,
      },
    }));

    const links = sankeyRenderData.links.map((link) => ({
      ...link,
      lineStyle: {
        opacity:
          highlight &&
          !highlight.linkKeys.has(toSankeyLinkKey(link.source, link.target))
            ? DIMMED_LINK_OPACITY
            : ACTIVE_LINK_OPACITY,
      },
    }));

    return toRenderOptions({
      nodes,
      links,
      useAdjacencyEmphasis: false,
    });
  }, [hoveredNodeId, sankeyRenderData.graphLinks, sankeyRenderData.links, sankeyRenderData.nodes]);

  const defaultAdjacencyOption = useMemo<EChartsCoreOption>(
    () =>
      toRenderOptions({
        nodes: sankeyRenderData.nodes,
        links: sankeyRenderData.links,
        useAdjacencyEmphasis: true,
      }),
    [sankeyRenderData.links, sankeyRenderData.nodes],
  );

  const option = USE_HOVER_NODE_ROUTE_ISOLATION
    ? routeIsolationOption
    : USE_FULL_SUBGRAPH_HIGHLIGHT
      ? fullSubgraphOption
      : defaultAdjacencyOption;

  const onEvents = USE_HOVER_NODE_ROUTE_ISOLATION || USE_FULL_SUBGRAPH_HIGHLIGHT
    ? {
        mouseover: (params: SankeyHoverEventParams) => {
          if (params.dataType === "node" && params.name) {
            const nextHoveredNodeId = params.name;
            setHoveredNodeId((current) =>
              current === nextHoveredNodeId ? current : nextHoveredNodeId,
            );
          }
        },
        mouseout: (params: SankeyHoverEventParams) => {
          if (params.dataType === "node") {
            setHoveredNodeId((current) => (current === null ? current : null));
          }
        },
        globalout: () => {
          setHoveredNodeId((current) => (current === null ? current : null));
        },
      }
    : undefined;

  return (
    <div
      className="rounded-[8px]"
      style={{
        height: "100%",
        minHeight: 420,
        border: "1px solid #e6e6e6",
        background: "#fff",
      }}
    >
      <ReactEChartsCore
        echarts={echarts}
        option={option}
        onEvents={onEvents}
        style={{ height: "100%", width: "100%" }}
        notMerge
        lazyUpdate
      />
    </div>
  );
}
