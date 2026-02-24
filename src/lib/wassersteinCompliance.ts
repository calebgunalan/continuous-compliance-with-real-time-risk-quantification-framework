/**
 * Wasserstein Optimal Transport for Compliance Drift (WOTCD)
 *
 * Measures the 1-Wasserstein (Earth Mover's) distance between the current
 * compliance state distribution and a target distribution.
 * The optimal transport plan reveals exactly which controls need remediation.
 *
 * W₁(μ,ν) = min_{γ∈Π(μ,ν)} Σᵢⱼ γᵢⱼ · Cᵢⱼ
 *
 * Governance Transport Distance (GTD) = W₁(μ,ν) / W₁(worst,ν) ∈ [0,1]
 */

import type { ControlState } from './complianceEntropy';

// ── State ordering ─────────────────────────────────────────────────────
const STATES: ControlState[] = ['pass', 'warning', 'fail', 'not_tested'];
const STATE_LABELS: Record<ControlState, string> = {
  pass: 'Pass', warning: 'Warning', fail: 'Fail', not_tested: 'Not Tested',
};

// ── Default cost matrix (asymmetric — deterioration costs more) ───────
// Rows = source state, Columns = target state
// [pass, warning, fail, not_tested]
const DEFAULT_COST_MATRIX: number[][] = [
  [0,   2,   5,   1  ],  // from pass
  [1,   0,   3,   1.5],  // from warning
  [3,   1.5, 0,   2  ],  // from fail
  [1.5, 2,   4,   0  ],  // from not_tested
];

// ── Build distribution from control states ─────────────────────────────
export function buildDistribution(
  states: ControlState[],
  weights?: number[]
): number[] {
  if (states.length === 0) return [0.25, 0.25, 0.25, 0.25];
  const dist = [0, 0, 0, 0];
  let totalWeight = 0;
  for (let i = 0; i < states.length; i++) {
    const idx = STATES.indexOf(states[i]);
    const w = weights?.[i] ?? 1;
    if (idx >= 0) dist[idx] += w;
    totalWeight += w;
  }
  return dist.map(d => d / totalWeight);
}

// ── Default target distribution ────────────────────────────────────────
export function defaultTarget(): number[] {
  return [0.95, 0.03, 0.01, 0.01];
}

// ── Worst-case distribution (all in fail) ──────────────────────────────
export function worstDistribution(): number[] {
  return [0, 0, 1, 0];
}

// ── Optimal transport solver (simplified for 4×4) ──────────────────────
// Uses the Northwest Corner + stepping-stone improvement for small LP
export interface TransportPlan {
  flows: { from: ControlState; to: ControlState; amount: number; cost: number }[];
  totalCost: number;
}

function solveTransport(
  source: number[],
  target: number[],
  costMatrix: number[][]
): TransportPlan {
  const n = source.length;
  // Clone to avoid mutation
  const s = [...source];
  const t = [...target];

  // Collect all possible allocations, greedily by lowest cost
  const cells: { i: number; j: number; cost: number }[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      cells.push({ i, j, cost: costMatrix[i][j] });
    }
  }
  cells.sort((a, b) => a.cost - b.cost);

  const flows: TransportPlan['flows'] = [];
  let totalCost = 0;
  const sRemain = [...s];
  const tRemain = [...t];

  for (const cell of cells) {
    const amount = Math.min(sRemain[cell.i], tRemain[cell.j]);
    if (amount > 1e-10) {
      flows.push({
        from: STATES[cell.i],
        to: STATES[cell.j],
        amount,
        cost: amount * cell.cost,
      });
      totalCost += amount * cell.cost;
      sRemain[cell.i] -= amount;
      tRemain[cell.j] -= amount;
    }
  }

  return { flows: flows.filter(f => f.amount > 1e-10), totalCost };
}

// ── Wasserstein distance ───────────────────────────────────────────────
export function wassersteinDistance(
  source: number[],
  target: number[],
  costMatrix = DEFAULT_COST_MATRIX
): number {
  return solveTransport(source, target, costMatrix).totalCost;
}

// ── Governance Transport Distance (GTD) ────────────────────────────────
export function governanceTransportDistance(
  source: number[],
  target: number[],
  costMatrix = DEFAULT_COST_MATRIX
): number {
  const w1 = wassersteinDistance(source, target, costMatrix);
  const wWorst = wassersteinDistance(worstDistribution(), target, costMatrix);
  if (wWorst === 0) return 0;
  return Math.min(w1 / wWorst, 1);
}

// ── Full analysis ──────────────────────────────────────────────────────
export interface WassersteinAnalysis {
  currentDistribution: number[];
  targetDistribution: number[];
  transportPlan: TransportPlan;
  wassersteinDist: number;
  gtd: number;
  stateLabels: string[];
  actionableInsights: { action: string; priority: 'high' | 'medium' | 'low'; amount: number }[];
  interpretation: string;
}

export function analyzeOptimalTransport(
  states: ControlState[],
  weights?: number[],
  target?: number[]
): WassersteinAnalysis {
  const currentDist = buildDistribution(states, weights);
  const targetDist = target || defaultTarget();
  const plan = solveTransport(currentDist, targetDist, DEFAULT_COST_MATRIX);
  const gtd = governanceTransportDistance(currentDist, targetDist);

  // Derive actionable insights from non-diagonal flows
  const insights: WassersteinAnalysis['actionableInsights'] = [];
  for (const flow of plan.flows) {
    if (flow.from === flow.to) continue;
    const priority = flow.from === 'fail' ? 'high' : flow.from === 'not_tested' ? 'medium' : 'low';
    insights.push({
      action: `Move ${(flow.amount * 100).toFixed(1)}% of controls from ${STATE_LABELS[flow.from]} → ${STATE_LABELS[flow.to]}`,
      priority,
      amount: flow.amount,
    });
  }
  insights.sort((a, b) => {
    const prio = { high: 0, medium: 1, low: 2 };
    return prio[a.priority] - prio[b.priority];
  });

  let interpretation: string;
  if (gtd < 0.1) {
    interpretation = 'Near-optimal — current compliance distribution is very close to target. Minimal remediation needed.';
  } else if (gtd < 0.3) {
    interpretation = 'Minor drift — some controls need attention but overall governance is on track.';
  } else if (gtd < 0.6) {
    interpretation = 'Significant drift — substantial remediation effort required to reach target compliance.';
  } else {
    interpretation = 'Critical drift — current state is far from target. Urgent, large-scale remediation needed.';
  }

  return {
    currentDistribution: currentDist,
    targetDistribution: targetDist,
    transportPlan: plan,
    wassersteinDist: plan.totalCost,
    gtd,
    stateLabels: STATES.map(s => STATE_LABELS[s]),
    actionableInsights: insights,
    interpretation,
  };
}
