/**
 * Unified Governance Risk Tensor (UGRT)
 *
 * Encodes the compliance-risk landscape as a 3rd-order tensor
 * R ∈ ℝ^{C×T×S} (Controls × Time × Scenarios) and applies
 * Tucker decomposition to discover latent risk factors.
 *
 * Tucker Decomposition: R ≈ G ×₁ U⁽ᶜ⁾ ×₂ U⁽ᵀ⁾ ×₃ U⁽ˢ⁾
 *
 * Governance Coherence Score: GCS = ||G||_F / ||R||_F
 */

// ── Tensor type (stored as flat array with shape) ──────────────────────
export interface Tensor3D {
  data: number[];
  shape: [number, number, number]; // [C, T, S]
}

function getIdx(shape: [number, number, number], i: number, j: number, k: number): number {
  return i * shape[1] * shape[2] + j * shape[2] + k;
}

export function createTensor(shape: [number, number, number], fill = 0): Tensor3D {
  return { data: Array(shape[0] * shape[1] * shape[2]).fill(fill), shape };
}

export function tensorGet(t: Tensor3D, i: number, j: number, k: number): number {
  return t.data[getIdx(t.shape, i, j, k)];
}

export function tensorSet(t: Tensor3D, i: number, j: number, k: number, val: number): void {
  t.data[getIdx(t.shape, i, j, k)] = val;
}

// ── Frobenius norm ─────────────────────────────────────────────────────
export function frobeniusNorm(data: number[]): number {
  return Math.sqrt(data.reduce((s, v) => s + v * v, 0));
}

// ── Mode-n unfolding ───────────────────────────────────────────────────
function modeUnfold(t: Tensor3D, mode: number): { matrix: number[][]; rows: number; cols: number } {
  const [C, T, S] = t.shape;
  const dims = [C, T, S];
  const rows = dims[mode];
  const cols = dims.reduce((a, b) => a * b, 1) / rows;
  const matrix: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < C; i++) {
    for (let j = 0; j < T; j++) {
      for (let k = 0; k < S; k++) {
        const indices = [i, j, k];
        const row = indices[mode];
        // Column index: lexicographic order of remaining modes
        const remaining = indices.filter((_, idx) => idx !== mode);
        const remDims = dims.filter((_, idx) => idx !== mode);
        const col = remaining[0] * remDims[1] + remaining[1];
        matrix[row][col] = tensorGet(t, i, j, k);
      }
    }
  }
  return { matrix, rows, cols };
}

// ── Simple SVD via power iteration (for small matrices) ────────────────
function truncatedSVD(matrix: number[][], rank: number): { U: number[][]; S: number[]; Vt: number[][] } {
  const m = matrix.length;
  const n = matrix[0]?.length || 0;
  const r = Math.min(rank, m, n);
  const U: number[][] = [];
  const singularValues: number[] = [];
  const Vt: number[][] = [];

  // Work on a copy
  const A = matrix.map(row => [...row]);

  for (let k = 0; k < r; k++) {
    // Power iteration
    let v = Array(n).fill(0).map(() => Math.random() - 0.5);
    let norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
    v = v.map(x => x / norm);

    for (let iter = 0; iter < 50; iter++) {
      // u = A * v
      const u = A.map(row => row.reduce((s, a, j) => s + a * v[j], 0));
      const sigma = Math.sqrt(u.reduce((s, x) => s + x * x, 0));
      if (sigma < 1e-10) break;
      const uNorm = u.map(x => x / sigma);

      // v = A^T * u
      const vNew = Array(n).fill(0);
      for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
          vNew[j] += A[i][j] * uNorm[i];
        }
      }
      norm = Math.sqrt(vNew.reduce((s, x) => s + x * x, 0));
      v = vNew.map(x => x / (norm || 1));

      if (iter === 49) {
        U.push(uNorm);
        singularValues.push(sigma);
        Vt.push(v);

        // Deflate
        for (let i = 0; i < m; i++) {
          for (let j = 0; j < n; j++) {
            A[i][j] -= sigma * uNorm[i] * v[j];
          }
        }
      }
    }
  }
  return { U, S: singularValues, Vt };
}

// ── Tucker decomposition via Higher-Order SVD (HOSVD) ──────────────────
export interface TuckerDecomposition {
  coreData: number[];
  coreShape: [number, number, number];
  factorControl: number[][];   // U^(C): [C × r1]
  factorTime: number[][];      // U^(T): [T × r2]
  factorScenario: number[][];  // U^(S): [S × r3]
  gcs: number;
  controlLoadings: { index: number; loading: number }[];
  timeLoadings: { index: number; loading: number }[];
  scenarioLoadings: { index: number; loading: number }[];
}

export function tuckerDecomposition(
  tensor: Tensor3D,
  ranks: [number, number, number] = [2, 2, 2]
): TuckerDecomposition {
  const [C, T, S] = tensor.shape;
  const [r1, r2, r3] = [Math.min(ranks[0], C), Math.min(ranks[1], T), Math.min(ranks[2], S)];

  // Mode-n unfoldings + truncated SVD
  const unfold0 = modeUnfold(tensor, 0);
  const svd0 = truncatedSVD(unfold0.matrix, r1);

  const unfold1 = modeUnfold(tensor, 1);
  const svd1 = truncatedSVD(unfold1.matrix, r2);

  const unfold2 = modeUnfold(tensor, 2);
  const svd2 = truncatedSVD(unfold2.matrix, r3);

  // Factor matrices (transpose of U from SVD for each mode)
  const factorControl = svd0.U.length > 0 ? svd0.U[0].map((_, j) => svd0.U.map(row => row[j])) : Array.from({ length: C }, () => [1]);
  const factorTime = svd1.U.length > 0 ? svd1.U[0].map((_, j) => svd1.U.map(row => row[j])) : Array.from({ length: T }, () => [1]);
  const factorScenario = svd2.U.length > 0 ? svd2.U[0].map((_, j) => svd2.U.map(row => row[j])) : Array.from({ length: S }, () => [1]);

  // Core tensor = simplified as singular values product
  const coreData = Array(r1 * r2 * r3).fill(0);
  for (let a = 0; a < Math.min(r1, svd0.S.length); a++) {
    for (let b = 0; b < Math.min(r2, svd1.S.length); b++) {
      for (let c = 0; c < Math.min(r3, svd2.S.length); c++) {
        coreData[a * r2 * r3 + b * r3 + c] = svd0.S[a] * svd1.S[b] * svd2.S[c];
      }
    }
  }

  const coreNorm = frobeniusNorm(coreData);
  const tensorNorm = frobeniusNorm(tensor.data);
  const gcs = tensorNorm > 0 ? Math.min(coreNorm / tensorNorm, 1) : 0;

  // Loadings (how much each control/time/scenario contributes to factor 1)
  const controlLoadings = factorControl.map((row, i) => ({
    index: i,
    loading: Math.abs(row[0] || 0),
  })).sort((a, b) => b.loading - a.loading);

  const timeLoadings = factorTime.map((row, i) => ({
    index: i,
    loading: Math.abs(row[0] || 0),
  })).sort((a, b) => b.loading - a.loading);

  const scenarioLoadings = factorScenario.map((row, i) => ({
    index: i,
    loading: Math.abs(row[0] || 0),
  })).sort((a, b) => b.loading - a.loading);

  return {
    coreData,
    coreShape: [r1, r2, r3],
    factorControl,
    factorTime,
    factorScenario,
    gcs,
    controlLoadings,
    timeLoadings,
    scenarioLoadings,
  };
}

// ── Build tensor from control + threat data ────────────────────────────
export function buildGovernanceRiskTensor(
  controlPassRates: number[][],  // [controls × time]
  scenarioVulnerabilities: number[] // [scenarios]
): Tensor3D {
  const C = controlPassRates.length;
  const T = controlPassRates[0]?.length || 1;
  const S = scenarioVulnerabilities.length;

  const tensor = createTensor([C, T, S]);
  for (let i = 0; i < C; i++) {
    for (let j = 0; j < T; j++) {
      for (let k = 0; k < S; k++) {
        // Risk contribution = (1 - pass_rate) * vulnerability
        const failRate = 1 - (controlPassRates[i]?.[j] || 0);
        const vuln = scenarioVulnerabilities[k] || 0;
        tensorSet(tensor, i, j, k, failRate * vuln);
      }
    }
  }
  return tensor;
}

// ── Generate demo data ─────────────────────────────────────────────────
export function generateDemoTensor(): {
  tensor: Tensor3D;
  controlLabels: string[];
  timeLabels: string[];
  scenarioLabels: string[];
} {
  const controlLabels = ['AC-1', 'AC-2', 'AU-1', 'AU-2', 'CM-1', 'IR-1', 'RA-1', 'SC-1'];
  const timeLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];
  const scenarioLabels = ['SQL Injection', 'Ransomware', 'Insider Threat', 'Phishing', 'DDoS'];

  const passRates = controlLabels.map((_, i) =>
    timeLabels.map((_, j) => 0.6 + 0.3 * Math.sin(i * 0.5 + j * 0.3) + Math.random() * 0.1)
  );
  const vulns = scenarioLabels.map((_, k) => 0.1 + 0.15 * k + Math.random() * 0.05);

  return {
    tensor: buildGovernanceRiskTensor(passRates, vulns),
    controlLabels,
    timeLabels,
    scenarioLabels,
  };
}
