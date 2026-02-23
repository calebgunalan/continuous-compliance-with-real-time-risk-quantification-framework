/**
 * Mutual Information Control Coverage Network (MICCN)
 * 
 * Uses information theory to measure pairwise control relationships
 * and identify the minimum set of controls providing maximum coverage.
 * 
 * Key formulas:
 *   I(C_i; C_j) = Σ_x Σ_y p(x,y) log₂(p(x,y) / (p(x)p(y)))
 *   NMI(C_i; C_j) = 2I(C_i; C_j) / (H(C_i) + H(C_j))
 *   G_i = 1 - max_j(NMI(C_i; C_j))   (Coverage Gap Score)
 *   mRMR(S) = (1/|S|)ΣRelevance(c) - (1/|S|²)ΣNMI(c_i, c_j)
 */

export interface MutualInformationAnalysis {
  nmiMatrix: number[][];
  coverageGapScores: CoverageGapScore[];
  mrmrOptimalSet: string[];
  redundancyClusters: RedundancyCluster[];
  networkEdges: NetworkEdge[];
  totalCoverage: number;
  controlIds: string[];
}

export interface CoverageGapScore {
  controlId: string;
  gapScore: number; // 0 = fully redundant, 1 = fully unique
  uniqueInformation: number; // bits of unique info
}

export interface RedundancyCluster {
  id: number;
  controls: string[];
  avgNMI: number;
}

export interface NetworkEdge {
  source: string;
  target: string;
  nmi: number;
}

/**
 * Compute Shannon entropy of a binary vector.
 *   H(X) = -Σ p(x) log₂ p(x)
 */
function shannonEntropy(values: number[]): number {
  const n = values.length;
  if (n === 0) return 0;

  const counts: Record<number, number> = {};
  for (const v of values) {
    const key = v > 0.5 ? 1 : 0;
    counts[key] = (counts[key] || 0) + 1;
  }

  let H = 0;
  for (const count of Object.values(counts)) {
    const p = count / n;
    if (p > 0) H -= p * Math.log2(p);
  }
  return H;
}

/**
 * Compute mutual information between two binary vectors.
 *   I(X;Y) = H(X) + H(Y) - H(X,Y)
 */
function mutualInformation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n === 0) return 0;

  const hx = shannonEntropy(x.slice(0, n));
  const hy = shannonEntropy(y.slice(0, n));

  // Joint entropy H(X,Y)
  const jointCounts: Record<string, number> = {};
  for (let i = 0; i < n; i++) {
    const key = `${x[i] > 0.5 ? 1 : 0},${y[i] > 0.5 ? 1 : 0}`;
    jointCounts[key] = (jointCounts[key] || 0) + 1;
  }

  let hxy = 0;
  for (const count of Object.values(jointCounts)) {
    const p = count / n;
    if (p > 0) hxy -= p * Math.log2(p);
  }

  return Math.max(0, hx + hy - hxy);
}

/**
 * Normalized Mutual Information:
 *   NMI(X;Y) = 2 I(X;Y) / (H(X) + H(Y))
 *   ∈ [0, 1]
 */
function normalizedMI(x: number[], y: number[]): number {
  const mi = mutualInformation(x, y);
  const hx = shannonEntropy(x);
  const hy = shannonEntropy(y);
  const denom = hx + hy;
  return denom > 1e-10 ? (2 * mi) / denom : 0;
}

/**
 * Build NMI matrix for all control pairs.
 */
export function buildNMIMatrix(
  controlSeries: { id: string; values: number[] }[]
): { matrix: number[][]; ids: string[] } {
  const n = controlSeries.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const ids = controlSeries.map(c => c.id);

  for (let i = 0; i < n; i++) {
    matrix[i][i] = 1;
    for (let j = i + 1; j < n; j++) {
      const nmi = normalizedMI(controlSeries[i].values, controlSeries[j].values);
      matrix[i][j] = nmi;
      matrix[j][i] = nmi;
    }
  }

  return { matrix, ids };
}

/**
 * Coverage Gap Score for each control:
 *   G_i = 1 - max_{j≠i} NMI(C_i, C_j)
 * 
 * High G → this control provides unique coverage no other control offers.
 */
export function computeCoverageGapScores(
  nmiMatrix: number[][],
  controlIds: string[]
): CoverageGapScore[] {
  return controlIds.map((id, i) => {
    let maxNMI = 0;
    for (let j = 0; j < controlIds.length; j++) {
      if (i !== j) {
        maxNMI = Math.max(maxNMI, nmiMatrix[i]?.[j] || 0);
      }
    }
    return {
      controlId: id,
      gapScore: 1 - maxNMI,
      uniqueInformation: (1 - maxNMI) * 100, // percentage scale
    };
  });
}

/**
 * Minimum Redundancy Maximum Relevance (mRMR) greedy selection.
 * 
 *   mRMR(S) = (1/|S|) Σ Relevance(c) - (1/|S|²) Σ NMI(c_i, c_j)
 * 
 * Selects k controls that maximize coverage while minimizing redundancy.
 * Relevance here is approximated by coverage gap score (unique information).
 */
export function mrmrSelection(
  nmiMatrix: number[][],
  coverageScores: CoverageGapScore[],
  controlIds: string[],
  k: number
): string[] {
  const n = controlIds.length;
  const selected: number[] = [];
  const remaining = new Set(Array.from({ length: n }, (_, i) => i));

  // Start with the control that has the highest coverage gap (most unique)
  let bestFirst = 0;
  let bestScore = -Infinity;
  for (let i = 0; i < n; i++) {
    const score = coverageScores[i]?.gapScore || 0;
    if (score > bestScore) {
      bestScore = score;
      bestFirst = i;
    }
  }
  selected.push(bestFirst);
  remaining.delete(bestFirst);

  // Greedily add controls maximizing mRMR criterion
  while (selected.length < k && remaining.size > 0) {
    let bestIdx = -1;
    let bestMRMR = -Infinity;

    for (const candidate of remaining) {
      const relevance = coverageScores[candidate]?.gapScore || 0;
      let redundancy = 0;
      for (const s of selected) {
        redundancy += nmiMatrix[candidate]?.[s] || 0;
      }
      redundancy /= selected.length;

      const mrmrScore = relevance - redundancy;
      if (mrmrScore > bestMRMR) {
        bestMRMR = mrmrScore;
        bestIdx = candidate;
      }
    }

    if (bestIdx >= 0) {
      selected.push(bestIdx);
      remaining.delete(bestIdx);
    } else {
      break;
    }
  }

  return selected.map(i => controlIds[i]);
}

/**
 * Identify clusters of highly correlated controls using single-linkage clustering.
 */
export function identifyRedundancyClusters(
  nmiMatrix: number[][],
  controlIds: string[],
  threshold: number = 0.5
): RedundancyCluster[] {
  const n = controlIds.length;
  const visited = new Set<number>();
  const clusters: RedundancyCluster[] = [];
  let clusterId = 0;

  for (let i = 0; i < n; i++) {
    if (visited.has(i)) continue;

    const cluster: number[] = [i];
    visited.add(i);
    const queue = [i];

    while (queue.length > 0) {
      const current = queue.shift()!;
      for (let j = 0; j < n; j++) {
        if (visited.has(j)) continue;
        if ((nmiMatrix[current]?.[j] || 0) >= threshold) {
          cluster.push(j);
          visited.add(j);
          queue.push(j);
        }
      }
    }

    if (cluster.length > 1) {
      let totalNMI = 0, pairs = 0;
      for (let a = 0; a < cluster.length; a++) {
        for (let b = a + 1; b < cluster.length; b++) {
          totalNMI += nmiMatrix[cluster[a]]?.[cluster[b]] || 0;
          pairs++;
        }
      }

      clusters.push({
        id: ++clusterId,
        controls: cluster.map(i => controlIds[i]),
        avgNMI: pairs > 0 ? totalNMI / pairs : 0,
      });
    }
  }

  return clusters;
}

/**
 * Extract network edges for visualization (NMI > threshold).
 */
export function extractNetworkEdges(
  nmiMatrix: number[][],
  controlIds: string[],
  threshold: number = 0.1
): NetworkEdge[] {
  const edges: NetworkEdge[] = [];
  for (let i = 0; i < controlIds.length; i++) {
    for (let j = i + 1; j < controlIds.length; j++) {
      const nmi = nmiMatrix[i]?.[j] || 0;
      if (nmi >= threshold) {
        edges.push({ source: controlIds[i], target: controlIds[j], nmi });
      }
    }
  }
  return edges.sort((a, b) => b.nmi - a.nmi);
}

/**
 * Run complete mutual information analysis.
 */
export function runMutualInformationAnalysis(
  controlSeries: { id: string; values: number[] }[],
  optimalSetSize: number = 5
): MutualInformationAnalysis {
  const { matrix, ids } = buildNMIMatrix(controlSeries);
  const gapScores = computeCoverageGapScores(matrix, ids);
  const mrmrSet = mrmrSelection(matrix, gapScores, ids, optimalSetSize);
  const clusters = identifyRedundancyClusters(matrix, ids);
  const edges = extractNetworkEdges(matrix, ids);

  const totalCoverage = gapScores.reduce((sum, s) => sum + s.gapScore, 0) / gapScores.length;

  return {
    nmiMatrix: matrix,
    coverageGapScores: gapScores,
    mrmrOptimalSet: mrmrSet,
    redundancyClusters: clusters,
    networkEdges: edges,
    totalCoverage,
    controlIds: ids,
  };
}

/**
 * Generate synthetic data for demonstration.
 */
export function generateSyntheticMIData(
  controlCount: number = 10,
  timePoints: number = 100
): { id: string; values: number[] }[] {
  const series: { id: string; values: number[] }[] = [];
  
  // Create shared factors
  const factors = Array.from({ length: 3 }, () =>
    Array.from({ length: timePoints }, () => Math.random() > 0.25 ? 1 : 0)
  );

  for (let c = 0; c < controlCount; c++) {
    const groupIdx = c < 3 ? 0 : c < 6 ? 1 : c < 8 ? 2 : -1;
    const values = Array.from({ length: timePoints }, (_, t) => {
      if (groupIdx >= 0) {
        const noise = Math.random() > 0.8 ? (1 - factors[groupIdx][t]) : factors[groupIdx][t];
        return noise;
      }
      return Math.random() > 0.2 ? 1 : 0;
    });
    series.push({ id: `CTRL-${String(c + 1).padStart(3, '0')}`, values });
  }

  return series;
}
