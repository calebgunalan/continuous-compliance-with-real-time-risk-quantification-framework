/**
 * Stackelberg Game-Theoretic Control Allocation (SGTCA)
 * 
 * Models attacker-defender interaction as a Stackelberg game:
 * 
 * Defender (leader): chooses control allocation d = (d₁,...,dₙ) ∈ [0,1]ⁿ
 *   subject to: Σ(cost_i × d_i) ≤ Budget
 * 
 * Attacker (follower): best-responds with a* = argmax_a U_a(a, d)
 *   U_a(a,d) = Σ a_j × value_j × (1 - effectiveness_j(d_j))
 * 
 * Defender's objective: min_d max_a [Risk(d, a*)]
 * 
 * Solved via backward induction with projected gradient descent.
 */

export interface AttackTarget {
  id: string;
  name: string;
  value: number;           // asset value ($)
  controlCost: number;     // cost to fully protect ($)
  baseEffectiveness: number; // effectiveness at d=1 (0-1)
  attackDifficulty: number;  // inherent difficulty for attacker (0-1)
}

export interface GameEquilibrium {
  defenderAllocation: number[];
  attackerStrategy: number[];
  defenderPayoff: number;   // negative of risk (defender wants to minimize)
  attackerPayoff: number;    // expected gain for attacker
  totalRiskAtEquilibrium: number;
  nashComparison: {
    nashDefenderPayoff: number;
    nashAttackerPayoff: number;
    stackelbergAdvantage: number;
  };
}

export interface GameAnalysis {
  equilibrium: GameEquilibrium;
  targets: AttackTarget[];
  budget: number;
  sensitivityData: SensitivityPoint[];
  attackSurface: AttackSurfacePoint[];
  payoffMatrix: number[][];
}

export interface SensitivityPoint {
  budgetFraction: number;
  defenderRisk: number;
  attackerGain: number;
}

export interface AttackSurfacePoint {
  targetId: string;
  targetName: string;
  undefendedRisk: number;
  defendedRisk: number;
  reductionPercent: number;
}

/**
 * Control effectiveness as a function of investment level d ∈ [0,1]:
 *   ε(d) = baseEffectiveness × (1 - e^{-3d}) / (1 - e^{-3})
 * 
 * This gives diminishing returns: first dollars of investment are most effective.
 */
function effectiveness(d: number, baseEff: number): number {
  const k = 3; // steepness
  return baseEff * (1 - Math.exp(-k * d)) / (1 - Math.exp(-k));
}

/**
 * Attacker's best response given defender allocation d.
 * 
 * Attacker distributes effort across targets proportionally to expected payoff:
 *   a*_j ∝ value_j × (1 - ε_j(d_j)) × (1 - difficulty_j)
 * 
 * Normalized so Σa_j = 1 (attacker has limited resources).
 */
export function attackerBestResponse(
  targets: AttackTarget[],
  defenderAllocation: number[]
): number[] {
  const n = targets.length;
  const attractiveness = targets.map((t, i) => {
    const eff = effectiveness(defenderAllocation[i], t.baseEffectiveness);
    return t.value * (1 - eff) * (1 - t.attackDifficulty);
  });

  const total = attractiveness.reduce((a, b) => a + Math.max(0, b), 0);
  if (total <= 0) return Array(n).fill(1 / n);

  return attractiveness.map(a => Math.max(0, a) / total);
}

/**
 * Defender's risk given allocations d and attacker strategy a:
 *   Risk(d, a) = Σ a_j × value_j × (1 - ε_j(d_j))
 */
function defenderRisk(
  targets: AttackTarget[],
  defenderAllocation: number[],
  attackerStrategy: number[]
): number {
  return targets.reduce((risk, t, i) => {
    const eff = effectiveness(defenderAllocation[i], t.baseEffectiveness);
    return risk + attackerStrategy[i] * t.value * (1 - eff);
  }, 0);
}

/**
 * Attacker's expected payoff:
 *   U_a(a, d) = Σ a_j × value_j × (1 - ε_j(d_j))
 */
function attackerPayoff(
  targets: AttackTarget[],
  defenderAllocation: number[],
  attackerStrategy: number[]
): number {
  return defenderRisk(targets, defenderAllocation, attackerStrategy);
}

/**
 * Projected gradient descent to solve defender's optimization:
 *   min_d  Risk(d, a*(d))
 *   s.t.   Σ cost_i × d_i ≤ Budget,  d_i ∈ [0,1]
 * 
 * The gradient is computed numerically since the attacker's best response
 * introduces a complex dependency on d.
 */
export function solveStackelbergEquilibrium(
  targets: AttackTarget[],
  budget: number,
  learningRate: number = 0.01,
  iterations: number = 500
): GameEquilibrium {
  const n = targets.length;
  
  // Initialize with uniform allocation
  let d = Array(n).fill(0);
  const totalCost = targets.reduce((s, t) => s + t.controlCost, 0);
  for (let i = 0; i < n; i++) {
    d[i] = Math.min(1, budget / totalCost);
  }

  for (let iter = 0; iter < iterations; iter++) {
    const a = attackerBestResponse(targets, d);
    
    // Compute gradient numerically
    const eps = 0.001;
    const grad = d.map((di, i) => {
      const dPlus = [...d]; dPlus[i] = Math.min(1, di + eps);
      const dMinus = [...d]; dMinus[i] = Math.max(0, di - eps);
      const aPlus = attackerBestResponse(targets, dPlus);
      const aMinus = attackerBestResponse(targets, dMinus);
      const rPlus = defenderRisk(targets, dPlus, aPlus);
      const rMinus = defenderRisk(targets, dMinus, aMinus);
      return (rPlus - rMinus) / (2 * eps);
    });

    // Gradient step
    const lr = learningRate / (1 + iter * 0.001); // decay
    d = d.map((di, i) => Math.max(0, Math.min(1, di - lr * grad[i])));

    // Project onto budget constraint
    d = projectOntoBudget(d, targets, budget);
  }

  const aFinal = attackerBestResponse(targets, d);
  const riskAtEq = defenderRisk(targets, d, aFinal);
  const attPayoff = attackerPayoff(targets, d, aFinal);

  // Nash comparison: simultaneous move equilibrium
  const nash = solveNashEquilibrium(targets, budget);

  return {
    defenderAllocation: d,
    attackerStrategy: aFinal,
    defenderPayoff: -riskAtEq,
    attackerPayoff: attPayoff,
    totalRiskAtEquilibrium: riskAtEq,
    nashComparison: {
      nashDefenderPayoff: -nash.risk,
      nashAttackerPayoff: nash.risk,
      stackelbergAdvantage: ((nash.risk - riskAtEq) / nash.risk) * 100,
    },
  };
}

/**
 * Project allocation onto budget constraint using proportional scaling.
 */
function projectOntoBudget(
  d: number[],
  targets: AttackTarget[],
  budget: number
): number[] {
  const totalSpend = d.reduce((s, di, i) => s + di * targets[i].controlCost, 0);
  if (totalSpend <= budget) return d;
  
  const scale = budget / totalSpend;
  return d.map(di => Math.min(1, di * scale));
}

/**
 * Simplified Nash equilibrium via iterative best response.
 */
function solveNashEquilibrium(
  targets: AttackTarget[],
  budget: number
): { risk: number; d: number[]; a: number[] } {
  const n = targets.length;
  let d = Array(n).fill(budget / (n * targets[0]?.controlCost || 1));
  d = d.map(v => Math.min(1, v));
  let a = Array(n).fill(1 / n);

  for (let iter = 0; iter < 100; iter++) {
    a = attackerBestResponse(targets, d);
    
    // Defender best responds to fixed attacker strategy
    // Allocate proportionally to attacker focus × value
    const priorities = targets.map((t, i) => a[i] * t.value / t.controlCost);
    const totalPri = priorities.reduce((s, p) => s + p, 0);
    d = priorities.map(p => totalPri > 0 ? (p / totalPri) * (budget / (targets[0]?.controlCost || 1)) : 0);
    d = d.map(v => Math.min(1, Math.max(0, v)));
    d = projectOntoBudget(d, targets, budget);
  }

  return { risk: defenderRisk(targets, d, a), d, a };
}

/**
 * Run complete game-theoretic analysis.
 */
export function runGameTheoreticAnalysis(
  targets: AttackTarget[],
  budget: number
): GameAnalysis {
  const equilibrium = solveStackelbergEquilibrium(targets, budget);

  // Budget sensitivity analysis
  const sensitivityData: SensitivityPoint[] = [];
  for (let frac = 0.1; frac <= 2.0; frac += 0.1) {
    const b = budget * frac;
    const eq = solveStackelbergEquilibrium(targets, b, 0.01, 200);
    sensitivityData.push({
      budgetFraction: frac,
      defenderRisk: eq.totalRiskAtEquilibrium,
      attackerGain: eq.attackerPayoff,
    });
  }

  // Attack surface
  const attackSurface: AttackSurfacePoint[] = targets.map((t, i) => {
    const undefended = t.value;
    const eff = effectiveness(equilibrium.defenderAllocation[i], t.baseEffectiveness);
    const defended = t.value * (1 - eff);
    return {
      targetId: t.id,
      targetName: t.name,
      undefendedRisk: undefended,
      defendedRisk: defended,
      reductionPercent: ((undefended - defended) / undefended) * 100,
    };
  });

  // Simplified payoff matrix (discrete strategies)
  const strategies = 5;
  const payoffMatrix: number[][] = [];
  for (let di = 0; di < strategies; di++) {
    const row: number[] = [];
    for (let ai = 0; ai < strategies; ai++) {
      const dAlloc = targets.map((_, idx) => idx === di ? 0.8 : 0.2);
      const aStrat = targets.map((_, idx) => idx === ai ? 0.6 : 0.1);
      const sumA = aStrat.reduce((s, v) => s + v, 0);
      const normA = aStrat.map(v => v / sumA);
      row.push(defenderRisk(targets, dAlloc, normA));
    }
    payoffMatrix.push(row);
  }

  return {
    equilibrium,
    targets,
    budget,
    sensitivityData,
    attackSurface,
    payoffMatrix,
  };
}

/**
 * Generate sample attack targets for demonstration.
 */
export function generateSampleTargets(): AttackTarget[] {
  return [
    { id: 'DB', name: 'Customer Database', value: 15000000, controlCost: 300000, baseEffectiveness: 0.85, attackDifficulty: 0.3 },
    { id: 'API', name: 'API Gateway', value: 8000000, controlCost: 200000, baseEffectiveness: 0.80, attackDifficulty: 0.4 },
    { id: 'IAM', name: 'Identity Systems', value: 12000000, controlCost: 350000, baseEffectiveness: 0.90, attackDifficulty: 0.5 },
    { id: 'NET', name: 'Network Perimeter', value: 5000000, controlCost: 150000, baseEffectiveness: 0.75, attackDifficulty: 0.2 },
    { id: 'END', name: 'Endpoints', value: 6000000, controlCost: 250000, baseEffectiveness: 0.70, attackDifficulty: 0.15 },
  ];
}
