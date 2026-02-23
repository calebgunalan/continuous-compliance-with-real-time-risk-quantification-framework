/**
 * Spectral Risk Coherence Analysis (SRCA)
 * 
 * Constructs a correlation matrix from control pass/fail time series,
 * analyzes its eigenvalue spectrum to measure control portfolio diversity.
 * 
 * Key metrics:
 *   SRCI = 1 - λ₁ / Σλ_i   (Spectral Risk Coherence Index)
 *   D_eff = (Σλ_i)² / Σ(λ_i²)   (Effective Dimensionality / Participation Ratio)
 */

export interface SpectralAnalysis {
  eigenvalues: number[];
  srci: number;
  effectiveDimensionality: number;
  controlClusters: ControlCluster[];
  redundancyScores: RedundancyScore[];
  correlationMatrix: number[][];
  principalControls: string[];
}

export interface ControlCluster {
  id: number;
  controls: string[];
  dominantEigenvalue: number;
  varianceExplained: number;
}

export interface RedundancyScore {
  controlId: string;
  score: number; // 0 = fully unique, 1 = fully redundant
  mostCorrelatedWith: string;
  correlationStrength: number;
}

/**
 * Construct a Pearson correlation matrix from binary pass/fail time series.
 * Each control has T observations: 1 = pass, 0 = fail/warning.
 */
export function buildCorrelationMatrix(
  controlSeries: { id: string; values: number[] }[]
): { matrix: number[][]; ids: string[] } {
  const n = controlSeries.length;
  const ids = controlSeries.map(c => c.id);
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1;
        continue;
      }
      const r = pearsonCorrelation(controlSeries[i].values, controlSeries[j].values);
      matrix[i][j] = r;
      matrix[j][i] = r;
    }
  }

  return { matrix, ids };
}

/**
 * Eigendecomposition using the Jacobi iterative method.
 * 
 * Rotates off-diagonal elements to zero iteratively.
 * Returns eigenvalues sorted in descending order.
 */
export function eigendecomposition(A: number[][]): { eigenvalues: number[]; eigenvectors: number[][] } {
  const n = A.length;
  const S = A.map(row => [...row]); // copy
  const V: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1.0 : 0.0))
  );

  const maxIter = 100 * n * n;
  const tolerance = 1e-10;

  for (let iter = 0; iter < maxIter; iter++) {
    // Find largest off-diagonal element
    let maxVal = 0, p = 0, q = 1;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(S[i][j]) > maxVal) {
          maxVal = Math.abs(S[i][j]);
          p = i;
          q = j;
        }
      }
    }

    if (maxVal < tolerance) break;

    // Compute Jacobi rotation
    const theta = (S[q][q] - S[p][p]) / (2 * S[p][q]);
    const t = Math.sign(theta) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
    const c = 1 / Math.sqrt(t * t + 1);
    const s = t * c;

    // Apply rotation to S
    const newSpp = c * c * S[p][p] - 2 * s * c * S[p][q] + s * s * S[q][q];
    const newSqq = s * s * S[p][p] + 2 * s * c * S[p][q] + c * c * S[q][q];
    S[p][q] = 0;
    S[q][p] = 0;
    S[p][p] = newSpp;
    S[q][q] = newSqq;

    for (let i = 0; i < n; i++) {
      if (i === p || i === q) continue;
      const sip = c * S[i][p] - s * S[i][q];
      const siq = s * S[i][p] + c * S[i][q];
      S[i][p] = sip; S[p][i] = sip;
      S[i][q] = siq; S[q][i] = siq;
    }

    // Update eigenvectors
    for (let i = 0; i < n; i++) {
      const vip = c * V[i][p] - s * V[i][q];
      const viq = s * V[i][p] + c * V[i][q];
      V[i][p] = vip;
      V[i][q] = viq;
    }
  }

  // Extract and sort eigenvalues
  const eigenvalues = Array.from({ length: n }, (_, i) => S[i][i]);
  const indices = eigenvalues.map((_, i) => i).sort((a, b) => eigenvalues[b] - eigenvalues[a]);

  return {
    eigenvalues: indices.map(i => Math.max(0, eigenvalues[i])),
    eigenvectors: indices.map(i => V.map(row => row[i])),
  };
}

/**
 * Spectral Risk Coherence Index:
 *   SRCI = 1 - λ₁ / Σλ_i
 * 
 * SRCI ∈ [0, 1]:
 *   0 → one eigenvalue dominates (controls highly correlated/redundant)
 *   1 → eigenvalues evenly distributed (controls independent, good coverage)
 */
export function computeSRCI(eigenvalues: number[]): number {
  const total = eigenvalues.reduce((a, b) => a + b, 0);
  if (total <= 0) return 0;
  return 1 - eigenvalues[0] / total;
}

/**
 * Effective Dimensionality (Participation Ratio):
 *   D_eff = (Σλ_i)² / Σ(λ_i²)
 * 
 * Answers: "How many independent security dimensions do your controls actually cover?"
 */
export function computeEffectiveDimensionality(eigenvalues: number[]): number {
  const sum = eigenvalues.reduce((a, b) => a + b, 0);
  const sumSq = eigenvalues.reduce((a, b) => a + b * b, 0);
  if (sumSq <= 0) return 0;
  return (sum * sum) / sumSq;
}

/**
 * Identify control clusters via eigenvector loadings.
 * Controls with high loadings on the same principal component are in the same cluster.
 */
export function identifyClusters(
  eigenvalues: number[],
  eigenvectors: number[][],
  controlIds: string[],
  numClusters: number = 3
): ControlCluster[] {
  const totalVar = eigenvalues.reduce((a, b) => a + b, 0);
  const clusters: ControlCluster[] = [];
  const k = Math.min(numClusters, eigenvalues.length);

  for (let c = 0; c < k; c++) {
    const loadings = eigenvectors[c] || [];
    const threshold = 1 / Math.sqrt(controlIds.length);
    const members = controlIds.filter((_, i) => Math.abs(loadings[i] || 0) > threshold);

    clusters.push({
      id: c + 1,
      controls: members.length > 0 ? members : [controlIds[c] || `PC${c + 1}`],
      dominantEigenvalue: eigenvalues[c] || 0,
      varianceExplained: totalVar > 0 ? (eigenvalues[c] || 0) / totalVar : 0,
    });
  }

  return clusters;
}

/**
 * Compute redundancy score for each control.
 * Based on maximum absolute correlation with any other control.
 */
export function computeRedundancyScores(
  correlationMatrix: number[][],
  controlIds: string[]
): RedundancyScore[] {
  const n = controlIds.length;
  return controlIds.map((id, i) => {
    let maxCorr = 0;
    let maxIdx = 0;
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const corr = Math.abs(correlationMatrix[i]?.[j] || 0);
      if (corr > maxCorr) {
        maxCorr = corr;
        maxIdx = j;
      }
    }
    return {
      controlId: id,
      score: maxCorr,
      mostCorrelatedWith: controlIds[maxIdx] || '',
      correlationStrength: maxCorr,
    };
  });
}

/**
 * Run complete spectral analysis.
 */
export function runSpectralAnalysis(
  controlSeries: { id: string; values: number[] }[]
): SpectralAnalysis {
  if (controlSeries.length < 2) {
    return {
      eigenvalues: [1],
      srci: 0,
      effectiveDimensionality: 1,
      controlClusters: [],
      redundancyScores: [],
      correlationMatrix: [[1]],
      principalControls: controlSeries.map(c => c.id),
    };
  }

  const { matrix, ids } = buildCorrelationMatrix(controlSeries);
  const { eigenvalues, eigenvectors } = eigendecomposition(matrix);
  const srci = computeSRCI(eigenvalues);
  const dEff = computeEffectiveDimensionality(eigenvalues);
  const clusters = identifyClusters(eigenvalues, eigenvectors, ids);
  const redundancy = computeRedundancyScores(matrix, ids);

  // Principal controls: those with highest loading on first eigenvector
  const principalControls = ids
    .map((id, i) => ({ id, loading: Math.abs(eigenvectors[0]?.[i] || 0) }))
    .sort((a, b) => b.loading - a.loading)
    .slice(0, 5)
    .map(c => c.id);

  return {
    eigenvalues,
    srci,
    effectiveDimensionality: dEff,
    controlClusters: clusters,
    redundancyScores: redundancy,
    correlationMatrix: matrix,
    principalControls,
  };
}

/**
 * Generate synthetic control time series for demonstration.
 */
export function generateSyntheticControlSeries(
  controlCount: number = 12,
  timePoints: number = 60
): { id: string; values: number[] }[] {
  const series: { id: string; values: number[] }[] = [];
  
  // Create 3 groups of correlated controls + some independent ones
  const groupFactors = Array.from({ length: 3 }, () =>
    Array.from({ length: timePoints }, () => Math.random() > 0.3 ? 1 : 0)
  );

  for (let c = 0; c < controlCount; c++) {
    const groupIdx = c % 4 === 3 ? -1 : c % 3; // every 4th is independent
    const values = Array.from({ length: timePoints }, (_, t) => {
      if (groupIdx >= 0) {
        const factor = groupFactors[groupIdx][t];
        return Math.random() > 0.15 ? factor : (1 - factor); // 85% correlated with group
      }
      return Math.random() > 0.2 ? 1 : 0; // independent
    });
    series.push({ id: `CTRL-${String(c + 1).padStart(3, '0')}`, values });
  }

  return series;
}

// --- Helpers ---

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }

  const num = n * sumXY - sumX * sumY;
  const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  return den > 1e-10 ? num / den : 0;
}
