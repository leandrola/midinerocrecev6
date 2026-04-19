export interface SankeyGraphLink {
  id: string;
  sourceId: string;
  targetId: string;
}

export interface SankeySubgraphHighlight {
  nodeIds: Set<string>;
  linkKeys: Set<string>;
}

function buildAdjacencyMaps(links: SankeyGraphLink[]) {
  const outgoing = new Map<string, Set<string>>();
  const incoming = new Map<string, Set<string>>();
  const outgoingLinks = new Map<string, Set<string>>();
  const incomingLinks = new Map<string, Set<string>>();
  const linksById = new Map<string, SankeyGraphLink>();

  for (const link of links) {
    linksById.set(link.id, link);

    const sourceTargets = outgoing.get(link.sourceId) ?? new Set<string>();
    sourceTargets.add(link.targetId);
    outgoing.set(link.sourceId, sourceTargets);

    const targetSources = incoming.get(link.targetId) ?? new Set<string>();
    targetSources.add(link.sourceId);
    incoming.set(link.targetId, targetSources);

    const sourceLinkIds = outgoingLinks.get(link.sourceId) ?? new Set<string>();
    sourceLinkIds.add(link.id);
    outgoingLinks.set(link.sourceId, sourceLinkIds);

    const targetLinkIds = incomingLinks.get(link.targetId) ?? new Set<string>();
    targetLinkIds.add(link.id);
    incomingLinks.set(link.targetId, targetLinkIds);
  }

  return { outgoing, incoming, outgoingLinks, incomingLinks, linksById };
}

function traverseFrom(
  startNode: string,
  adjacencyMap: Map<string, Set<string>>,
): Set<string> {
  const visited = new Set<string>([startNode]);
  const queue: string[] = [startNode];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }

    const neighbors = adjacencyMap.get(current);
    if (!neighbors) {
      continue;
    }

    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) {
        continue;
      }
      visited.add(neighbor);
      queue.push(neighbor);
    }
  }

  return visited;
}

function buildLinkKey(source: string, target: string): string {
  return `${source}\u0000${target}`;
}

export function resolveFullSubgraphHighlight(
  hoveredNodeId: string,
  links: SankeyGraphLink[],
): SankeySubgraphHighlight {
  const { outgoing, incoming } = buildAdjacencyMaps(links);
  const downstreamNodes = traverseFrom(hoveredNodeId, outgoing);
  const upstreamNodes = traverseFrom(hoveredNodeId, incoming);

  const nodeIds = new Set<string>([
    ...Array.from(upstreamNodes),
    ...Array.from(downstreamNodes),
  ]);

  const linkKeys = new Set<string>();
  for (const link of links) {
    if (nodeIds.has(link.sourceId) && nodeIds.has(link.targetId)) {
      linkKeys.add(buildLinkKey(link.sourceId, link.targetId));
    }
  }

  return { nodeIds, linkKeys };
}

function traverseUpstreamToSources(
  startNodeId: string,
  incomingLinks: Map<string, Set<string>>,
  linksById: Map<string, SankeyGraphLink>,
) {
  const nodeIds = new Set<string>([startNodeId]);
  const linkKeys = new Set<string>();
  const stack: string[] = [startNodeId];

  while (stack.length > 0) {
    const currentNodeId = stack.pop();
    if (!currentNodeId) {
      continue;
    }

    const currentIncomingLinkIds = incomingLinks.get(currentNodeId);
    if (!currentIncomingLinkIds) {
      continue;
    }

    for (const incomingLinkId of currentIncomingLinkIds) {
      const link = linksById.get(incomingLinkId);
      if (!link) {
        continue;
      }

      linkKeys.add(buildLinkKey(link.sourceId, link.targetId));
      if (!nodeIds.has(link.sourceId)) {
        nodeIds.add(link.sourceId);
        stack.push(link.sourceId);
      }
    }
  }

  return { nodeIds, linkKeys };
}

function traverseDownstreamToTerminals(
  startNodeId: string,
  outgoingLinks: Map<string, Set<string>>,
  linksById: Map<string, SankeyGraphLink>,
) {
  const nodeIds = new Set<string>([startNodeId]);
  const linkKeys = new Set<string>();
  const stack: string[] = [startNodeId];

  while (stack.length > 0) {
    const currentNodeId = stack.pop();
    if (!currentNodeId) {
      continue;
    }

    const currentOutgoingLinkIds = outgoingLinks.get(currentNodeId);
    if (!currentOutgoingLinkIds) {
      continue;
    }

    for (const outgoingLinkId of currentOutgoingLinkIds) {
      const link = linksById.get(outgoingLinkId);
      if (!link) {
        continue;
      }

      linkKeys.add(buildLinkKey(link.sourceId, link.targetId));
      if (!nodeIds.has(link.targetId)) {
        nodeIds.add(link.targetId);
        stack.push(link.targetId);
      }
    }
  }

  return { nodeIds, linkKeys };
}

export function computeHoveredNodeRouteIsolation(
  hoveredNodeId: string,
  links: SankeyGraphLink[],
): SankeySubgraphHighlight {
  const { outgoingLinks, incomingLinks, linksById } = buildAdjacencyMaps(links);

  // Route isolation = every segment on at least one valid source->...->H->...->terminal route.
  const upstream = traverseUpstreamToSources(hoveredNodeId, incomingLinks, linksById);
  const downstream = traverseDownstreamToTerminals(hoveredNodeId, outgoingLinks, linksById);

  return {
    nodeIds: new Set<string>([
      ...Array.from(upstream.nodeIds),
      ...Array.from(downstream.nodeIds),
    ]),
    linkKeys: new Set<string>([
      ...Array.from(upstream.linkKeys),
      ...Array.from(downstream.linkKeys),
    ]),
  };
}

export function toSankeyLinkKey(source: string, target: string): string {
  return buildLinkKey(source, target);
}
