/**
 * Control Dependency Graph with Cascade Risk Propagation (CRP)
 * 
 * Models compliance controls as a directed acyclic graph (DAG) where edges
 * represent dependencies. When an upstream control fails, calculates cascade
 * probability for all downstream controls.
 * 
 * CRP Algorithm:
 * For each node v in topological order:
 *   cascade_risk(v) = 1 - PRODUCT((1 - edge_weight(u,v) * failure_prob(u)))
 *                     for all parents u of v
 */

export interface GraphNode {
  id: string;
  name: string;
  passRate: number;
  failureProbability: number;
  cascadeRisk: number;
  depth: number;
  category: string;
}

export interface GraphEdge {
  parentId: string;
  childId: string;
  strength: number;       // 0-1 dependency strength
  type: string;           // functional, data, operational
}

export interface CascadeResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  criticalPaths: string[][];
  totalCascadeRisk: number;
  mostVulnerableNode: GraphNode | null;
  cascadeDepth: number;
}

export interface WhatIfResult {
  failedControlId: string;
  failedControlName: string;
  affectedControls: Array<{
    id: string;
    name: string;
    originalRisk: number;
    newCascadeRisk: number;
    riskIncrease: number;
  }>;
  totalImpact: number;
}

/**
 * Build adjacency list from edges
 */
function buildAdjacencyList(
  nodes: GraphNode[],
  edges: GraphEdge[]
): { children: Map<string, GraphEdge[]>; parents: Map<string, GraphEdge[]> } {
  const children = new Map<string, GraphEdge[]>();
  const parents = new Map<string, GraphEdge[]>();
  
  nodes.forEach(n => {
    children.set(n.id, []);
    parents.set(n.id, []);
  });
  
  edges.forEach(e => {
    children.get(e.parentId)?.push(e);
    parents.get(e.childId)?.push(e);
  });
  
  return { children, parents };
}

/**
 * Topological sort using Kahn's algorithm
 */
function topologicalSort(nodes: GraphNode[], edges: GraphEdge[]): string[] {
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();
  
  nodes.forEach(n => {
    inDegree.set(n.id, 0);
    adj.set(n.id, []);
  });
  
  edges.forEach(e => {
    adj.get(e.parentId)?.push(e.childId);
    inDegree.set(e.childId, (inDegree.get(e.childId) || 0) + 1);
  });
  
  const queue: string[] = [];
  inDegree.forEach((deg, id) => { if (deg === 0) queue.push(id); });
  
  const sorted: string[] = [];
  while (queue.length > 0) {
    const node = queue.shift()!;
    sorted.push(node);
    adj.get(node)?.forEach(child => {
      const newDeg = (inDegree.get(child) || 1) - 1;
      inDegree.set(child, newDeg);
      if (newDeg === 0) queue.push(child);
    });
  }
  
  return sorted;
}

/**
 * Calculate cascade risk propagation through the dependency graph
 */
export function calculateCascadeRisk(
  nodes: GraphNode[],
  edges: GraphEdge[]
): CascadeResult {
  if (nodes.length === 0) {
    return { nodes: [], edges: [], criticalPaths: [], totalCascadeRisk: 0, mostVulnerableNode: null, cascadeDepth: 0 };
  }

  const { parents } = buildAdjacencyList(nodes, edges);
  const sorted = topologicalSort(nodes, edges);
  const nodeMap = new Map(nodes.map(n => [n.id, { ...n }]));
  
  // Calculate depth for each node
  const depthMap = new Map<string, number>();
  sorted.forEach(id => {
    const parentEdges = parents.get(id) || [];
    if (parentEdges.length === 0) {
      depthMap.set(id, 0);
    } else {
      const maxParentDepth = Math.max(...parentEdges.map(e => depthMap.get(e.parentId) || 0));
      depthMap.set(id, maxParentDepth + 1);
    }
  });

  // CRP: propagate cascade risk in topological order
  sorted.forEach(id => {
    const node = nodeMap.get(id)!;
    const parentEdges = parents.get(id) || [];
    node.depth = depthMap.get(id) || 0;
    
    if (parentEdges.length === 0) {
      // Root node: cascade risk = own failure probability
      node.cascadeRisk = node.failureProbability;
    } else {
      // cascade_risk(v) = 1 - PRODUCT((1 - strength(u,v) * cascade_risk(u))) for all parents u
      // Combined with own failure probability
      const parentSurvival = parentEdges.reduce((product, edge) => {
        const parentNode = nodeMap.get(edge.parentId)!;
        return product * (1 - edge.strength * parentNode.cascadeRisk);
      }, 1);
      
      const cascadeFromParents = 1 - parentSurvival;
      // Union of own failure and cascade from parents
      node.cascadeRisk = 1 - (1 - node.failureProbability) * (1 - cascadeFromParents);
    }
  });

  const resultNodes = sorted.map(id => nodeMap.get(id)!);
  
  // Find critical paths (paths with highest cumulative cascade risk)
  const criticalPaths = findCriticalPaths(resultNodes, edges, parents);
  
  // Calculate aggregate metrics
  const totalCascadeRisk = resultNodes.reduce((sum, n) => sum + n.cascadeRisk, 0) / resultNodes.length;
  const mostVulnerableNode = resultNodes.reduce((max, n) => n.cascadeRisk > max.cascadeRisk ? n : max, resultNodes[0]);
  const cascadeDepth = Math.max(...resultNodes.map(n => n.depth));

  return {
    nodes: resultNodes,
    edges,
    criticalPaths,
    totalCascadeRisk,
    mostVulnerableNode,
    cascadeDepth,
  };
}

/**
 * Find the top 3 critical paths through the graph
 */
function findCriticalPaths(
  nodes: GraphNode[],
  edges: GraphEdge[],
  parents: Map<string, GraphEdge[]>
): string[][] {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  
  // Find leaf nodes (no children)
  const childSet = new Set(edges.map(e => e.childId));
  const parentSet = new Set(edges.map(e => e.parentId));
  const leafNodes = nodes.filter(n => !parentSet.has(n.id) || !childSet.has(n.id));
  
  // Trace back from highest cascade risk leaf nodes
  const paths: Array<{ path: string[]; risk: number }> = [];
  
  const highRiskNodes = [...nodes].sort((a, b) => b.cascadeRisk - a.cascadeRisk).slice(0, 5);
  
  for (const leaf of highRiskNodes) {
    const path: string[] = [leaf.id];
    let current = leaf.id;
    
    while (true) {
      const parentEdges = parents.get(current) || [];
      if (parentEdges.length === 0) break;
      
      // Follow the highest risk parent
      const highestRiskParent = parentEdges.reduce((max, e) => {
        const parentRisk = nodeMap.get(e.parentId)?.cascadeRisk || 0;
        const maxRisk = nodeMap.get(max.parentId)?.cascadeRisk || 0;
        return parentRisk > maxRisk ? e : max;
      });
      
      path.unshift(highestRiskParent.parentId);
      current = highestRiskParent.parentId;
    }
    
    const pathRisk = path.reduce((sum, id) => sum + (nodeMap.get(id)?.cascadeRisk || 0), 0) / path.length;
    paths.push({ path, risk: pathRisk });
  }
  
  return paths
    .sort((a, b) => b.risk - a.risk)
    .slice(0, 3)
    .map(p => p.path);
}

/**
 * Simulate "what if" a specific control fails completely
 */
export function simulateControlFailure(
  nodes: GraphNode[],
  edges: GraphEdge[],
  failedControlId: string
): WhatIfResult {
  const originalResult = calculateCascadeRisk(nodes, edges);
  const originalMap = new Map(originalResult.nodes.map(n => [n.id, n]));
  
  // Create modified nodes with the failed control at 100% failure
  const modifiedNodes = nodes.map(n => ({
    ...n,
    failureProbability: n.id === failedControlId ? 1.0 : n.failureProbability,
  }));
  
  const modifiedResult = calculateCascadeRisk(modifiedNodes, edges);
  const modifiedMap = new Map(modifiedResult.nodes.map(n => [n.id, n]));
  
  const failedNode = nodeMap(nodes, failedControlId);
  
  const affectedControls = modifiedResult.nodes
    .filter(n => n.id !== failedControlId)
    .map(n => ({
      id: n.id,
      name: n.name,
      originalRisk: originalMap.get(n.id)?.cascadeRisk || 0,
      newCascadeRisk: n.cascadeRisk,
      riskIncrease: n.cascadeRisk - (originalMap.get(n.id)?.cascadeRisk || 0),
    }))
    .filter(c => c.riskIncrease > 0.01)
    .sort((a, b) => b.riskIncrease - a.riskIncrease);

  const totalImpact = affectedControls.reduce((sum, c) => sum + c.riskIncrease, 0);

  return {
    failedControlId,
    failedControlName: failedNode?.name || 'Unknown',
    affectedControls,
    totalImpact,
  };
}

function nodeMap(nodes: GraphNode[], id: string): GraphNode | undefined {
  return nodes.find(n => n.id === id);
}
