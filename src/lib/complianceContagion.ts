/**
 * Compliance Contagion Dynamics (CCD) — Epidemiological Model
 *
 * Models non-compliance spread using a modified SIR compartmental model.
 *
 *   dS/dt = -β·S·I/N + δ·R
 *   dI/dt =  β·S·I/N - γ·I
 *   dR/dt =  γ·I - δ·R
 *
 * Basic Reproduction Number: R₀ = β/γ
 *   R₀ > 1 → epidemic spreads
 *   R₀ < 1 → epidemic dies out
 */

// ── SIR State ──────────────────────────────────────────────────────────
export interface SIRState {
  S: number;  // Susceptible (compliant)
  I: number;  // Infected (non-compliant)
  R: number;  // Recovered (remediated)
  t: number;  // time
}

export interface ContagionParams {
  beta: number;   // contagion rate
  gamma: number;  // remediation rate
  delta: number;  // immunity waning rate
  N: number;      // total population
}

// ── 4th-order Runge-Kutta ODE solver ───────────────────────────────────
function sirDerivatives(state: SIRState, params: ContagionParams): { dS: number; dI: number; dR: number } {
  const { S, I, R } = state;
  const { beta, gamma, delta, N } = params;
  const dS = -beta * S * I / N + delta * R;
  const dI = beta * S * I / N - gamma * I;
  const dR = gamma * I - delta * R;
  return { dS, dI, dR };
}

function rk4Step(state: SIRState, params: ContagionParams, dt: number): SIRState {
  const { S, I, R, t } = state;

  const k1 = sirDerivatives(state, params);
  const s2: SIRState = { S: S + k1.dS * dt / 2, I: I + k1.dI * dt / 2, R: R + k1.dR * dt / 2, t: t + dt / 2 };
  const k2 = sirDerivatives(s2, params);
  const s3: SIRState = { S: S + k2.dS * dt / 2, I: I + k2.dI * dt / 2, R: R + k2.dR * dt / 2, t: t + dt / 2 };
  const k3 = sirDerivatives(s3, params);
  const s4: SIRState = { S: S + k3.dS * dt, I: I + k3.dI * dt, R: R + k3.dR * dt, t: t + dt };
  const k4 = sirDerivatives(s4, params);

  return {
    S: Math.max(0, S + (k1.dS + 2 * k2.dS + 2 * k3.dS + k4.dS) * dt / 6),
    I: Math.max(0, I + (k1.dI + 2 * k2.dI + 2 * k3.dI + k4.dI) * dt / 6),
    R: Math.max(0, R + (k1.dR + 2 * k2.dR + 2 * k3.dR + k4.dR) * dt / 6),
    t: t + dt,
  };
}

// ── Simulate SIR dynamics ──────────────────────────────────────────────
export function simulateSIR(
  initial: { S: number; I: number; R: number },
  params: ContagionParams,
  totalTime: number,
  dt = 0.1
): SIRState[] {
  const trajectory: SIRState[] = [];
  let state: SIRState = { ...initial, t: 0 };
  trajectory.push({ ...state });

  const steps = Math.ceil(totalTime / dt);
  for (let i = 0; i < steps; i++) {
    state = rk4Step(state, params, dt);
    // Record at roughly integer time points
    if (Math.abs(state.t - Math.round(state.t)) < dt / 2 || i === steps - 1) {
      trajectory.push({ ...state });
    }
  }
  return trajectory;
}

// ── R₀ calculation ─────────────────────────────────────────────────────
export function basicReproductionNumber(params: ContagionParams): number {
  if (params.gamma === 0) return Infinity;
  return params.beta / params.gamma;
}

// ── Endemic equilibrium ────────────────────────────────────────────────
export interface EndemicEquilibrium {
  S_star: number;
  I_star: number;
  R_star: number;
  isEndemic: boolean;
}

export function endemicEquilibrium(params: ContagionParams): EndemicEquilibrium {
  const R0 = basicReproductionNumber(params);
  const { N, gamma, delta } = params;

  if (R0 <= 1) {
    return { S_star: N, I_star: 0, R_star: 0, isEndemic: false };
  }

  // Endemic steady state for SIR with waning immunity (SIRS)
  const S_star = N / R0;
  const I_star = (delta * N * (R0 - 1)) / (params.beta + delta * R0);
  const R_star = N - S_star - I_star;

  return { S_star, I_star, R_star: Math.max(0, R_star), isEndemic: true };
}

// ── Herd immunity threshold ────────────────────────────────────────────
export function herdImmunityThreshold(params: ContagionParams): number {
  const R0 = basicReproductionNumber(params);
  if (R0 <= 1) return 0;
  return 1 - 1 / R0;
}

// ── Vaccination analysis (preventive hardening) ────────────────────────
export function vaccinationToSuppress(params: ContagionParams): {
  fractionToHarden: number;
  controlsToHarden: number;
} {
  const threshold = herdImmunityThreshold(params);
  return {
    fractionToHarden: threshold,
    controlsToHarden: Math.ceil(threshold * params.N),
  };
}

// ── Parameter estimation from control history ──────────────────────────
export function estimateParams(
  totalControls: number,
  currentCompliant: number,
  currentFailing: number,
  currentRemediated: number,
  newFailuresPerDay: number,
  remediationsPerDay: number,
  reFailuresPerDay: number
): ContagionParams {
  const N = totalControls;
  const beta = (currentCompliant * currentFailing / N) > 0
    ? newFailuresPerDay / (currentCompliant * currentFailing / N)
    : 0.1;
  const gamma = currentFailing > 0 ? remediationsPerDay / currentFailing : 0.1;
  const delta = currentRemediated > 0 ? reFailuresPerDay / currentRemediated : 0.05;
  return { beta: Math.max(0.01, beta), gamma: Math.max(0.01, gamma), delta: Math.max(0.001, delta), N };
}

// ── Full analysis ──────────────────────────────────────────────────────
export interface ContagionAnalysis {
  params: ContagionParams;
  R0: number;
  trajectory: SIRState[];
  equilibrium: EndemicEquilibrium;
  herdThreshold: number;
  vaccination: { fractionToHarden: number; controlsToHarden: number };
  interpretation: string;
}

export function analyzeContagion(
  totalControls: number,
  passingControls: number,
  failingControls: number,
  remediatedControls: number
): ContagionAnalysis {
  // Use reasonable defaults for daily rates
  const newFailures = Math.max(1, failingControls * 0.15);
  const remediations = Math.max(1, failingControls * 0.1);
  const reFailures = Math.max(0.5, remediatedControls * 0.05);

  const params = estimateParams(
    totalControls, passingControls, failingControls,
    remediatedControls, newFailures, remediations, reFailures
  );
  const R0 = basicReproductionNumber(params);
  const trajectory = simulateSIR(
    { S: passingControls, I: failingControls, R: remediatedControls },
    params, 90, 0.5
  );
  const eq = endemicEquilibrium(params);
  const herd = herdImmunityThreshold(params);
  const vacc = vaccinationToSuppress(params);

  let interpretation: string;
  if (R0 < 0.8) {
    interpretation = `R₀ = ${R0.toFixed(2)} — Non-compliance is dying out. Current remediation rate exceeds contagion spread.`;
  } else if (R0 < 1.0) {
    interpretation = `R₀ = ${R0.toFixed(2)} — Borderline containment. Non-compliance will slowly decrease but remains a risk.`;
  } else if (R0 < 2.0) {
    interpretation = `R₀ = ${R0.toFixed(2)} — Active epidemic. Non-compliance is spreading. Increase remediation rate or harden ${vacc.controlsToHarden} controls.`;
  } else {
    interpretation = `R₀ = ${R0.toFixed(2)} — Severe epidemic. Non-compliance spreads rapidly. Urgent intervention required.`;
  }

  return { params, R0, trajectory, equilibrium: eq, herdThreshold: herd, vaccination: vacc, interpretation };
}
