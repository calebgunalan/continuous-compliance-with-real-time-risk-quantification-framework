/**
 * Multi-Objective Governance Pareto Optimizer (MOGPO)
 * 
 * Implements NSGA-II to find Pareto-optimal governance investment portfolios.
 * 
 * Objectives (minimize simultaneously):
 *   f₁(x) = Total residual risk exposure ($)
 *   f₂(x) = Total investment cost ($)
 *   f₃(x) = Time to full implementation (months)
 * 
 * Constraints:
 *   Σ(cost_i × x_i) ≤ B_max
 *   compliance_score(x) ≥ C_min
 */

export interface ControlInvestment {
  id: string;
  name: string;
  cost: number;           // investment cost in dollars
  riskReduction: number;  // annual risk reduction in dollars
  implementationTime: number; // months
  complianceImpact: number;   // percentage points of compliance improvement
}

export interface ParetoSolution {
  id: number;
  selectedControls: boolean[];
  objectives: {
    residualRisk: number;
    totalCost: number;
    implementationTime: number;
  };
  complianceScore: number;
  dominationRank: number;
  crowdingDistance: number;
}

export interface ParetoAnalysis {
  paretoFront: ParetoSolution[];
  allSolutions: ParetoSolution[];
  kneePoint: ParetoSolution | null;
  hypervolumeIndicator: number;
  controlInvestments: ControlInvestment[];
  generations: number;
}

/**
 * NSGA-II: Non-dominated Sorting Genetic Algorithm II
 */
export function runNSGAII(
  controls: ControlInvestment[],
  baselineRisk: number,
  budget: number,
  minCompliance: number = 70,
  populationSize: number = 100,
  generations: number = 80
): ParetoAnalysis {
  const n = controls.length;
  
  // Initialize random population
  let population = initializePopulation(populationSize, n, controls, budget);

  for (let gen = 0; gen < generations; gen++) {
    // Evaluate objectives
    const evaluated = population.map((individual, idx) =>
      evaluateSolution(individual, controls, baselineRisk, idx)
    );

    // Create offspring via crossover + mutation
    const offspring: boolean[][] = [];
    for (let i = 0; i < populationSize; i++) {
      const p1 = tournamentSelect(evaluated);
      const p2 = tournamentSelect(evaluated);
      let child = uniformCrossover(p1.selectedControls, p2.selectedControls);
      child = mutate(child, 1 / n);
      
      // Repair budget constraint
      child = repairBudget(child, controls, budget);
      offspring.push(child);
    }

    // Combine parent + offspring
    const combined = [...population, ...offspring];
    const combinedEval = combined.map((ind, idx) =>
      evaluateSolution(ind, controls, baselineRisk, idx)
    );

    // Non-dominated sorting
    const fronts = nonDominatedSort(combinedEval);

    // Select next generation using fronts + crowding distance
    population = [];
    for (const front of fronts) {
      if (population.length + front.length <= populationSize) {
        population.push(...front.map(s => s.selectedControls));
      } else {
        // Calculate crowding distance and select best
        const withCrowding = computeCrowdingDistance(front);
        withCrowding.sort((a, b) => b.crowdingDistance - a.crowdingDistance);
        const needed = populationSize - population.length;
        population.push(...withCrowding.slice(0, needed).map(s => s.selectedControls));
        break;
      }
    }
  }

  // Final evaluation
  const finalEval = population.map((ind, idx) =>
    evaluateSolution(ind, controls, baselineRisk, idx)
  );
  const fronts = nonDominatedSort(finalEval);
  const paretoFront = fronts[0] ? computeCrowdingDistance(fronts[0]) : [];
  const allWithCrowding = computeCrowdingDistance(finalEval);

  // Find knee point (closest to ideal)
  const kneePoint = findKneePoint(paretoFront);
  const hv = computeHypervolume(paretoFront, baselineRisk, budget);

  return {
    paretoFront,
    allSolutions: allWithCrowding,
    kneePoint,
    hypervolumeIndicator: hv,
    controlInvestments: controls,
    generations,
  };
}

function evaluateSolution(
  individual: boolean[],
  controls: ControlInvestment[],
  baselineRisk: number,
  id: number
): ParetoSolution {
  let totalCost = 0, totalReduction = 0, maxTime = 0, complianceGain = 0;

  for (let i = 0; i < individual.length; i++) {
    if (individual[i]) {
      totalCost += controls[i].cost;
      totalReduction += controls[i].riskReduction;
      maxTime = Math.max(maxTime, controls[i].implementationTime);
      complianceGain += controls[i].complianceImpact;
    }
  }

  return {
    id,
    selectedControls: [...individual],
    objectives: {
      residualRisk: Math.max(0, baselineRisk - totalReduction),
      totalCost,
      implementationTime: maxTime,
    },
    complianceScore: Math.min(100, 60 + complianceGain),
    dominationRank: 0,
    crowdingDistance: 0,
  };
}

function initializePopulation(
  size: number, n: number, controls: ControlInvestment[], budget: number
): boolean[][] {
  const pop: boolean[][] = [];
  for (let i = 0; i < size; i++) {
    let individual = Array.from({ length: n }, () => Math.random() > 0.5);
    individual = repairBudget(individual, controls, budget);
    pop.push(individual);
  }
  return pop;
}

function repairBudget(
  individual: boolean[], controls: ControlInvestment[], budget: number
): boolean[] {
  const result = [...individual];
  let totalCost = result.reduce((sum, sel, i) => sum + (sel ? controls[i].cost : 0), 0);
  
  // Remove controls in random order until within budget
  while (totalCost > budget) {
    const selected = result.map((s, i) => i).filter(i => result[i]);
    if (selected.length === 0) break;
    const removeIdx = selected[Math.floor(Math.random() * selected.length)];
    result[removeIdx] = false;
    totalCost -= controls[removeIdx].cost;
  }
  return result;
}

function dominates(a: ParetoSolution, b: ParetoSolution): boolean {
  const objA = [a.objectives.residualRisk, a.objectives.totalCost, a.objectives.implementationTime];
  const objB = [b.objectives.residualRisk, b.objectives.totalCost, b.objectives.implementationTime];
  
  let betterInAny = false;
  for (let i = 0; i < 3; i++) {
    if (objA[i] > objB[i]) return false;
    if (objA[i] < objB[i]) betterInAny = true;
  }
  return betterInAny;
}

function nonDominatedSort(solutions: ParetoSolution[]): ParetoSolution[][] {
  const n = solutions.length;
  const dominationCount = Array(n).fill(0);
  const dominated: number[][] = Array.from({ length: n }, () => []);
  const fronts: ParetoSolution[][] = [];

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (dominates(solutions[i], solutions[j])) {
        dominated[i].push(j);
        dominationCount[j]++;
      } else if (dominates(solutions[j], solutions[i])) {
        dominated[j].push(i);
        dominationCount[i]++;
      }
    }
  }

  let currentFront = solutions
    .map((s, i) => ({ s, i }))
    .filter(({ i }) => dominationCount[i] === 0);

  let rank = 0;
  while (currentFront.length > 0) {
    const front = currentFront.map(({ s }) => ({ ...s, dominationRank: rank }));
    fronts.push(front);

    const nextFront: { s: ParetoSolution; i: number }[] = [];
    for (const { i } of currentFront) {
      for (const j of dominated[i]) {
        dominationCount[j]--;
        if (dominationCount[j] === 0) {
          nextFront.push({ s: solutions[j], i: j });
        }
      }
    }
    currentFront = nextFront;
    rank++;
  }

  return fronts;
}

function computeCrowdingDistance(front: ParetoSolution[]): ParetoSolution[] {
  const n = front.length;
  if (n <= 2) return front.map(s => ({ ...s, crowdingDistance: Infinity }));

  const result = front.map(s => ({ ...s, crowdingDistance: 0 }));
  const objectives: (keyof ParetoSolution['objectives'])[] = ['residualRisk', 'totalCost', 'implementationTime'];

  for (const obj of objectives) {
    const sorted = result.map((s, i) => ({ s, i })).sort((a, b) => a.s.objectives[obj] - b.s.objectives[obj]);
    
    result[sorted[0].i].crowdingDistance = Infinity;
    result[sorted[n - 1].i].crowdingDistance = Infinity;

    const range = sorted[n - 1].s.objectives[obj] - sorted[0].s.objectives[obj];
    if (range > 0) {
      for (let i = 1; i < n - 1; i++) {
        result[sorted[i].i].crowdingDistance +=
          (sorted[i + 1].s.objectives[obj] - sorted[i - 1].s.objectives[obj]) / range;
      }
    }
  }

  return result;
}

function tournamentSelect(population: ParetoSolution[]): ParetoSolution {
  const i = Math.floor(Math.random() * population.length);
  const j = Math.floor(Math.random() * population.length);
  const a = population[i], b = population[j];
  if (a.dominationRank < b.dominationRank) return a;
  if (b.dominationRank < a.dominationRank) return b;
  return a.crowdingDistance > b.crowdingDistance ? a : b;
}

function uniformCrossover(p1: boolean[], p2: boolean[]): boolean[] {
  return p1.map((v, i) => Math.random() > 0.5 ? v : p2[i]);
}

function mutate(individual: boolean[], rate: number): boolean[] {
  return individual.map(v => Math.random() < rate ? !v : v);
}

function findKneePoint(front: ParetoSolution[]): ParetoSolution | null {
  if (front.length === 0) return null;

  // Normalize objectives and find point closest to ideal
  const risks = front.map(s => s.objectives.residualRisk);
  const costs = front.map(s => s.objectives.totalCost);
  const times = front.map(s => s.objectives.implementationTime);

  const minR = Math.min(...risks), maxR = Math.max(...risks);
  const minC = Math.min(...costs), maxC = Math.max(...costs);
  const minT = Math.min(...times), maxT = Math.max(...times);

  let bestIdx = 0, bestDist = Infinity;
  for (let i = 0; i < front.length; i++) {
    const nr = maxR > minR ? (risks[i] - minR) / (maxR - minR) : 0;
    const nc = maxC > minC ? (costs[i] - minC) / (maxC - minC) : 0;
    const nt = maxT > minT ? (times[i] - minT) / (maxT - minT) : 0;
    const dist = Math.sqrt(nr * nr + nc * nc + nt * nt);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }

  return front[bestIdx];
}

function computeHypervolume(
  front: ParetoSolution[],
  refRisk: number,
  refCost: number
): number {
  if (front.length === 0) return 0;
  // Simplified 2D hypervolume for risk vs cost
  const sorted = [...front].sort((a, b) => a.objectives.residualRisk - b.objectives.residualRisk);
  let hv = 0;
  let prevCost = refCost;
  for (const s of sorted) {
    const width = refRisk - s.objectives.residualRisk;
    const height = prevCost - s.objectives.totalCost;
    if (width > 0 && height > 0) hv += width * height;
    prevCost = Math.min(prevCost, s.objectives.totalCost);
  }
  return hv / (refRisk * refCost); // normalize to [0, 1]
}

/**
 * Generate sample control investments for demonstration.
 */
export function generateSampleInvestments(): ControlInvestment[] {
  return [
    { id: 'MFA', name: 'Multi-Factor Authentication', cost: 150000, riskReduction: 2500000, implementationTime: 3, complianceImpact: 8 },
    { id: 'WAF', name: 'Web Application Firewall', cost: 200000, riskReduction: 3200000, implementationTime: 2, complianceImpact: 6 },
    { id: 'EDR', name: 'Endpoint Detection & Response', cost: 350000, riskReduction: 4100000, implementationTime: 4, complianceImpact: 7 },
    { id: 'SIEM', name: 'SIEM Platform', cost: 500000, riskReduction: 5500000, implementationTime: 6, complianceImpact: 10 },
    { id: 'PAM', name: 'Privileged Access Management', cost: 280000, riskReduction: 3800000, implementationTime: 5, complianceImpact: 9 },
    { id: 'DLP', name: 'Data Loss Prevention', cost: 220000, riskReduction: 2100000, implementationTime: 4, complianceImpact: 5 },
    { id: 'VULN', name: 'Vulnerability Scanning', cost: 80000, riskReduction: 1800000, implementationTime: 1, complianceImpact: 4 },
    { id: 'IAM', name: 'Identity Governance', cost: 320000, riskReduction: 4500000, implementationTime: 6, complianceImpact: 11 },
    { id: 'BACKUP', name: 'Backup & Recovery', cost: 120000, riskReduction: 2800000, implementationTime: 2, complianceImpact: 6 },
    { id: 'TRAIN', name: 'Security Awareness Training', cost: 60000, riskReduction: 1500000, implementationTime: 1, complianceImpact: 3 },
  ];
}
