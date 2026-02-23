/**
 * Compliance Drift Diffusion Model (CDDM)
 * 
 * Models control pass rates as Ornstein-Uhlenbeck (mean-reverting)
 * stochastic processes:
 * 
 *   dX(t) = θ(μ - X(t))dt + σ dW(t)
 * 
 * where:
 *   X(t)  = control pass rate at time t
 *   θ     = mean-reversion speed (governance pull strength)
 *   μ     = long-run equilibrium pass rate
 *   σ     = volatility (environmental noise)
 *   W(t)  = Wiener process
 */

export interface OUParameters {
  theta: number;  // mean-reversion speed
  mu: number;     // long-run mean
  sigma: number;  // volatility
}

export interface DiffusionAnalysis {
  parameters: OUParameters;
  currentValue: number;
  trajectories: number[][];
  confidenceBands: { upper: number[]; lower: number[]; mean: number[] };
  firstPassageTime: number;
  thresholdProbability: number;
  optimalMonitoringInterval: number;
  timeHorizonDays: number;
}

/**
 * Maximum Likelihood Estimation of OU parameters from equally-spaced observations.
 * 
 * Given observations X_0, X_1, ..., X_n at intervals Δt:
 *   X_{i+1} = μ + (X_i - μ)e^{-θΔt} + ε_i
 * 
 * This is an AR(1) process with:
 *   a = e^{-θΔt},  b = μ(1 - a)
 *   σ²_ε = σ²(1 - a²) / (2θ)
 */
export function estimateOUParameters(observations: number[], dt: number = 1): OUParameters {
  const n = observations.length;
  if (n < 3) {
    return { theta: 0.1, mu: 85, sigma: 5 };
  }

  // Compute regression: X_{i+1} = b + a * X_i + ε
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n - 1; i++) {
    const x = observations[i];
    const y = observations[i + 1];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  const m = n - 1;
  const a = (m * sumXY - sumX * sumY) / (m * sumX2 - sumX * sumX);
  const b = (sumY - a * sumX) / m;

  // Recover OU parameters
  const aClamp = Math.max(0.01, Math.min(0.99, Math.abs(a)));
  const theta = -Math.log(aClamp) / dt;
  const mu = b / (1 - aClamp);

  // Estimate sigma from residual variance
  let residualSS = 0;
  for (let i = 0; i < m; i++) {
    const predicted = b + aClamp * observations[i];
    residualSS += (observations[i + 1] - predicted) ** 2;
  }
  const residualVar = residualSS / m;
  const sigma = Math.sqrt(residualVar * 2 * theta / (1 - aClamp * aClamp));

  return {
    theta: Math.max(0.001, theta),
    mu: Math.max(0, Math.min(100, mu)),
    sigma: Math.max(0.1, sigma),
  };
}

/**
 * OU conditional distribution at time t given X(0) = x0:
 * 
 *   E[X(t)] = μ + (x0 - μ)e^{-θt}
 *   Var[X(t)] = σ²(1 - e^{-2θt}) / (2θ)
 */
export function ouConditionalMean(params: OUParameters, x0: number, t: number): number {
  return params.mu + (x0 - params.mu) * Math.exp(-params.theta * t);
}

export function ouConditionalVariance(params: OUParameters, t: number): number {
  return (params.sigma ** 2) * (1 - Math.exp(-2 * params.theta * t)) / (2 * params.theta);
}

/**
 * Simulate OU trajectories using Euler-Maruyama method.
 */
export function simulateTrajectories(
  params: OUParameters,
  x0: number,
  T: number,
  dt: number = 0.5,
  numPaths: number = 50
): number[][] {
  const steps = Math.ceil(T / dt);
  const trajectories: number[][] = [];

  for (let p = 0; p < numPaths; p++) {
    const path = [x0];
    let x = x0;
    for (let i = 0; i < steps; i++) {
      const drift = params.theta * (params.mu - x) * dt;
      const diffusion = params.sigma * Math.sqrt(dt) * gaussianRandom();
      x = Math.max(0, Math.min(100, x + drift + diffusion));
      path.push(x);
    }
    trajectories.push(path);
  }

  return trajectories;
}

/**
 * Compute confidence bands (mean ± 2σ) over time horizon.
 */
export function computeConfidenceBands(
  params: OUParameters,
  x0: number,
  T: number,
  dt: number = 0.5
): { upper: number[]; lower: number[]; mean: number[] } {
  const steps = Math.ceil(T / dt);
  const mean: number[] = [];
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i * dt;
    const m = ouConditionalMean(params, x0, t);
    const v = ouConditionalVariance(params, t);
    const sd = Math.sqrt(v);
    mean.push(m);
    upper.push(Math.min(100, m + 2 * sd));
    lower.push(Math.max(0, m - 2 * sd));
  }

  return { upper, lower, mean };
}

/**
 * Approximate expected first passage time to a lower threshold.
 * 
 * For OU process, the mean first passage time from x0 to threshold b < x0:
 * Uses the Darling-Siegert approximation for mean FPT.
 * 
 * Simplified formula when x0 > μ > b:
 *   E[τ] ≈ (1/θ) * ln((x0 - b)/(μ - b)) + corrections
 */
export function expectedFirstPassageTime(
  params: OUParameters,
  x0: number,
  threshold: number
): number {
  if (x0 <= threshold) return 0;
  if (params.mu <= threshold) {
    // Process will eventually cross; estimate from drift
    const effectiveDrift = params.theta * (x0 - params.mu);
    return (x0 - threshold) / effectiveDrift;
  }
  
  // When μ > threshold, crossing is a rare event driven by fluctuations.
  // Use the scale function integral approximation.
  const z0 = (x0 - params.mu) * Math.sqrt(2 * params.theta) / params.sigma;
  const zb = (threshold - params.mu) * Math.sqrt(2 * params.theta) / params.sigma;
  
  if (zb >= z0) return 0;
  
  // Numerical approximation using the standard result
  const ratio = (x0 - threshold) / (params.sigma / Math.sqrt(2 * params.theta));
  const fpt = (1 / params.theta) * (ratio + 0.5 * ratio * ratio / Math.abs(z0 - zb + 1));
  
  return Math.max(0, fpt);
}

/**
 * Probability that process hits threshold within time horizon T.
 * 
 * P(min_{0≤t≤T} X(t) ≤ b | X(0) = x0)
 * 
 * Approximated via reflection principle adapted for OU process.
 */
export function thresholdBreachProbability(
  params: OUParameters,
  x0: number,
  threshold: number,
  T: number
): number {
  if (x0 <= threshold) return 1;

  const meanT = ouConditionalMean(params, x0, T);
  const varT = ouConditionalVariance(params, T);
  const sdT = Math.sqrt(varT);

  if (sdT < 1e-10) return meanT <= threshold ? 1 : 0;

  // P(X(T) < threshold) using normal CDF
  const z = (threshold - meanT) / sdT;
  const pEnd = normalCDF(z);

  // Reflection principle correction (upper bound on minimum)
  // P(min X(t) ≤ b) ≈ P(X(T) ≤ b) + P(X(T) ≥ 2μ - b) for Brownian motion
  // Adapted with mean-reversion correction factor
  const correctionFactor = Math.exp(-2 * params.theta * T);
  const pMin = Math.min(1, pEnd * (1 + correctionFactor) + 0.01);

  return Math.max(0, Math.min(1, pMin));
}

/**
 * Compute optimal monitoring interval such that P(breach between checks) < target.
 * 
 * Finds Δt such that P(X drops below threshold in Δt) < p_target
 */
export function optimalMonitoringInterval(
  params: OUParameters,
  x0: number,
  threshold: number,
  pTarget: number = 0.05
): number {
  let lo = 0.1, hi = 720; // hours
  for (let iter = 0; iter < 50; iter++) {
    const mid = (lo + hi) / 2;
    const p = thresholdBreachProbability(params, x0, threshold, mid);
    if (p < pTarget) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

/**
 * Run complete diffusion analysis for a control.
 */
export function runDiffusionAnalysis(
  observations: number[],
  threshold: number = 80,
  timeHorizonDays: number = 30
): DiffusionAnalysis {
  const params = estimateOUParameters(observations, 1);
  const x0 = observations[observations.length - 1] || params.mu;
  const T = timeHorizonDays * 24; // convert to hours

  const trajectories = simulateTrajectories(params, x0, T, T / 60, 30);
  const bands = computeConfidenceBands(params, x0, T, T / 60);
  const fpt = expectedFirstPassageTime(params, x0, threshold);
  const prob = thresholdBreachProbability(params, x0, threshold, T);
  const monitorInterval = optimalMonitoringInterval(params, x0, threshold);

  return {
    parameters: params,
    currentValue: x0,
    trajectories,
    confidenceBands: bands,
    firstPassageTime: fpt,
    thresholdProbability: prob,
    optimalMonitoringInterval: monitorInterval,
    timeHorizonDays,
  };
}

// --- Utility functions ---

function gaussianRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function normalCDF(z: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1.0 + sign * y);
}

/**
 * Generate synthetic pass rate time series for demonstration.
 */
export function generateSyntheticPassRates(
  days: number = 90,
  mu: number = 87,
  theta: number = 0.05,
  sigma: number = 3
): number[] {
  const rates: number[] = [];
  let x = mu + (Math.random() - 0.5) * 10;
  for (let d = 0; d < days; d++) {
    x += theta * (mu - x) + sigma * gaussianRandom();
    x = Math.max(50, Math.min(100, x));
    rates.push(Math.round(x * 10) / 10);
  }
  return rates;
}
