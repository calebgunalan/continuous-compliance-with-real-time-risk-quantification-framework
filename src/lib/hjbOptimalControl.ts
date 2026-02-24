/**
 * Hamilton-Jacobi-Bellman Optimal Governance Trajectory (HJB-OGT)
 *
 * Finds the mathematically optimal governance investment path over time
 * using stochastic optimal control.
 *
 * State: X(t) = maturity level ∈ [1,5]
 * Control: u(t) = investment rate ($/month)
 * Dynamics: dX = [θ(μ-X) + k√u]dt + σdW
 *
 * HJB: Vₜ + min_u { [θ(μ-X) + k√u]Vₓ + ½σ²Vₓₓ + λL(X) + u } = 0
 * Optimal: u*(x,t) = (kVₓ/2)²  when Vₓ < 0
 */

// ── Model parameters ───────────────────────────────────────────────────
export interface HJBParams {
  theta: number;     // mean-reversion speed
  mu: number;        // long-run equilibrium maturity
  sigma: number;     // volatility
  k: number;         // investment effectiveness
  lambda: number;    // risk aversion parameter
  T: number;         // time horizon (months)
  xMin: number;      // min maturity (1)
  xMax: number;      // max maturity (5)
  targetMaturity: number;
  annualRiskAtLevel1: number; // annual risk at maturity 1
}

const DEFAULT_PARAMS: HJBParams = {
  theta: 0.3,
  mu: 2.5,
  sigma: 0.15,
  k: 0.02,
  lambda: 1.0,
  T: 24,
  xMin: 1,
  xMax: 5,
  targetMaturity: 4,
  annualRiskAtLevel1: 500000000,
};

// ── Risk as function of maturity (exponential decay) ───────────────────
function riskFunction(x: number, baseRisk: number): number {
  return baseRisk * Math.exp(-0.8 * (x - 1));
}

// ── Terminal cost (penalty for not reaching target) ────────────────────
function terminalCost(x: number, target: number, penalty: number): number {
  const gap = Math.max(0, target - x);
  return penalty * gap * gap;
}

// ── Finite difference HJB solver ───────────────────────────────────────
export interface HJBSolution {
  valueSurface: { x: number; t: number; value: number }[];
  optimalControl: { x: number; t: number; investment: number }[];
  xGrid: number[];
  tGrid: number[];
  Nx: number;
  Nt: number;
}

export function solveHJB(params: HJBParams = DEFAULT_PARAMS): HJBSolution {
  const { theta, mu, sigma, k, lambda, T, xMin, xMax, targetMaturity, annualRiskAtLevel1 } = params;

  const Nx = 40;
  const Nt = 48;
  const dx = (xMax - xMin) / (Nx - 1);
  const dt = T / (Nt - 1);

  const xGrid = Array.from({ length: Nx }, (_, i) => xMin + i * dx);
  const tGrid = Array.from({ length: Nt }, (_, j) => j * dt);

  // Value function V[i][j] = V(x_i, t_j)
  const V: number[][] = Array.from({ length: Nx }, () => Array(Nt).fill(0));
  const U: number[][] = Array.from({ length: Nx }, () => Array(Nt).fill(0));

  // Terminal condition: V(x, T) = Phi(x)
  const penalty = annualRiskAtLevel1 * 0.1;
  for (let i = 0; i < Nx; i++) {
    V[i][Nt - 1] = terminalCost(xGrid[i], targetMaturity, penalty);
  }

  // Backward iteration
  for (let j = Nt - 2; j >= 0; j--) {
    for (let i = 1; i < Nx - 1; i++) {
      const x = xGrid[i];

      // Finite differences for V_x and V_xx
      const Vx = (V[i + 1][j + 1] - V[i - 1][j + 1]) / (2 * dx);
      const Vxx = (V[i + 1][j + 1] - 2 * V[i][j + 1] + V[i - 1][j + 1]) / (dx * dx);

      // Optimal control: u* = (k * Vx / 2)^2 when Vx < 0
      let uStar = 0;
      if (Vx < 0) {
        uStar = Math.pow(k * (-Vx) / 2, 2);
        uStar = Math.min(uStar, annualRiskAtLevel1 * 0.01); // cap investment
      }
      uStar = Math.max(0, uStar);

      // Running cost: risk + investment
      const runningCost = lambda * riskFunction(x, annualRiskAtLevel1) / 12 + uStar;

      // Drift
      const drift = theta * (mu - x) + k * Math.sqrt(uStar);

      // Update V using implicit Euler
      V[i][j] = V[i][j + 1] + dt * (
        drift * Vx +
        0.5 * sigma * sigma * Vxx +
        runningCost
      );
      U[i][j] = uStar;
    }

    // Boundary conditions (Neumann)
    V[0][j] = V[1][j];
    V[Nx - 1][j] = V[Nx - 2][j];
    U[0][j] = U[1][j];
    U[Nx - 1][j] = U[Nx - 2][j];
  }

  // Flatten for output
  const valueSurface: HJBSolution['valueSurface'] = [];
  const optimalControl: HJBSolution['optimalControl'] = [];
  for (let i = 0; i < Nx; i++) {
    for (let j = 0; j < Nt; j++) {
      valueSurface.push({ x: xGrid[i], t: tGrid[j], value: V[i][j] });
      optimalControl.push({ x: xGrid[i], t: tGrid[j], investment: U[i][j] });
    }
  }

  return { valueSurface, optimalControl, xGrid, tGrid, Nx, Nt };
}

// ── Simulate trajectory under optimal policy ───────────────────────────
export interface TrajectoryPoint {
  t: number;
  maturity: number;
  investment: number;
  cumulativeCost: number;
  riskExposure: number;
}

export function simulateOptimalTrajectory(
  solution: HJBSolution,
  startMaturity: number,
  params: HJBParams = DEFAULT_PARAMS
): TrajectoryPoint[] {
  const { theta, mu, sigma, k, T, annualRiskAtLevel1 } = params;
  const { xGrid, tGrid, Nx, Nt } = solution;
  const dt = T / (Nt - 1);

  const trajectory: TrajectoryPoint[] = [];
  let x = startMaturity;
  let cumCost = 0;

  for (let j = 0; j < Nt; j++) {
    // Find nearest grid point for x
    const iNearest = Math.min(Nx - 1, Math.max(0, Math.round((x - xGrid[0]) / (xGrid[1] - xGrid[0]))));
    const investment = solution.optimalControl[iNearest * Nt + j]?.investment || 0;
    const risk = riskFunction(x, annualRiskAtLevel1);

    trajectory.push({
      t: tGrid[j],
      maturity: x,
      investment,
      cumulativeCost: cumCost,
      riskExposure: risk,
    });

    // Euler-Maruyama step
    const drift = theta * (mu - x) + k * Math.sqrt(investment);
    const noise = sigma * (Math.random() * 2 - 1) * Math.sqrt(dt);
    x = Math.max(params.xMin, Math.min(params.xMax, x + drift * dt + noise));
    cumCost += investment * dt;
  }

  return trajectory;
}

// ── Compare optimal vs constant investment ─────────────────────────────
export function simulateConstantInvestment(
  monthlyInvestment: number,
  startMaturity: number,
  params: HJBParams = DEFAULT_PARAMS
): TrajectoryPoint[] {
  const { theta, mu, sigma, k, T, annualRiskAtLevel1 } = params;
  const Nt = 48;
  const dt = T / (Nt - 1);
  const trajectory: TrajectoryPoint[] = [];
  let x = startMaturity;
  let cumCost = 0;

  for (let j = 0; j < Nt; j++) {
    trajectory.push({
      t: j * dt,
      maturity: x,
      investment: monthlyInvestment,
      cumulativeCost: cumCost,
      riskExposure: riskFunction(x, annualRiskAtLevel1),
    });

    const drift = theta * (mu - x) + k * Math.sqrt(monthlyInvestment);
    const noise = sigma * (Math.random() * 2 - 1) * Math.sqrt(dt);
    x = Math.max(params.xMin, Math.min(params.xMax, x + drift * dt + noise));
    cumCost += monthlyInvestment * dt;
  }
  return trajectory;
}

// ── Full analysis ──────────────────────────────────────────────────────
export interface HJBAnalysis {
  solution: HJBSolution;
  optimalTrajectory: TrajectoryPoint[];
  constantTrajectory: TrajectoryPoint[];
  optimalTotalCost: number;
  constantTotalCost: number;
  savingsPercent: number;
  interpretation: string;
}

export function analyzeOptimalGovernance(
  startMaturity = 2.0,
  monthlyBudget = 100000,
  params: HJBParams = DEFAULT_PARAMS
): HJBAnalysis {
  const solution = solveHJB(params);
  const optTraj = simulateOptimalTrajectory(solution, startMaturity, params);
  const constTraj = simulateConstantInvestment(monthlyBudget, startMaturity, params);

  const optCost = optTraj[optTraj.length - 1]?.cumulativeCost || 0;
  const constCost = constTraj[constTraj.length - 1]?.cumulativeCost || 0;
  const savings = constCost > 0 ? ((constCost - optCost) / constCost) * 100 : 0;

  const finalOptMaturity = optTraj[optTraj.length - 1]?.maturity || startMaturity;
  const finalConstMaturity = constTraj[constTraj.length - 1]?.maturity || startMaturity;

  const interpretation = `Optimal policy reaches maturity ${finalOptMaturity.toFixed(1)} vs constant investment reaching ${finalConstMaturity.toFixed(1)}. ` +
    `The HJB-optimal trajectory ${savings > 0 ? `saves ${Math.abs(savings).toFixed(0)}%` : `costs ${Math.abs(savings).toFixed(0)}% more but achieves higher maturity`} compared to constant monthly investment of $${(monthlyBudget / 1000).toFixed(0)}K.`;

  return {
    solution,
    optimalTrajectory: optTraj,
    constantTrajectory: constTraj,
    optimalTotalCost: optCost,
    constantTotalCost: constCost,
    savingsPercent: savings,
    interpretation,
  };
}
