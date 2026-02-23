/**
 * Compliance Markov Steady-State Predictor (CMSSP)
 * 
 * Models each control's lifecycle as a continuous-time Markov chain
 * with states: Pass, Warning, Fail, Not_Tested.
 * 
 * Estimates transition rate matrix Q from observed data, computes
 * steady-state distribution π, and predicts mean time to failure.
 */

export type MarkovState = 'pass' | 'warning' | 'fail' | 'not_tested';

export const STATES: MarkovState[] = ['pass', 'warning', 'fail', 'not_tested'];
const N = STATES.length;

export interface TransitionObservation {
  fromState: MarkovState;
  toState: MarkovState;
  timeInState: number; // hours spent in fromState before transitioning
}

export interface MarkovAnalysis {
  transitionRateMatrix: number[][];
  steadyStateDistribution: number[];
  meanTimeInState: number[];
  meanTimeToFailure: number;
  transientProbabilities: number[][];
  stateLabels: MarkovState[];
}

/**
 * Estimate the transition rate matrix Q from observed transitions.
 * 
 * q_ij = (number of i→j transitions) / (total time spent in state i)
 * q_ii = -Σ_{j≠i} q_ij
 */
export function estimateTransitionRateMatrix(observations: TransitionObservation[]): number[][] {
  const transitionCounts: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
  const totalTimeInState: number[] = Array(N).fill(0);

  for (const obs of observations) {
    const i = STATES.indexOf(obs.fromState);
    const j = STATES.indexOf(obs.toState);
    if (i >= 0 && j >= 0 && i !== j) {
      transitionCounts[i][j] += 1;
      totalTimeInState[i] += obs.timeInState;
    }
  }

  const Q: number[][] = Array.from({ length: N }, () => Array(N).fill(0));

  for (let i = 0; i < N; i++) {
    if (totalTimeInState[i] === 0) {
      // No observations for this state; assume small default rates
      for (let j = 0; j < N; j++) {
        Q[i][j] = i === j ? -0.01 * (N - 1) : 0.01;
      }
      continue;
    }
    let rowSum = 0;
    for (let j = 0; j < N; j++) {
      if (i !== j) {
        Q[i][j] = transitionCounts[i][j] / totalTimeInState[i];
        rowSum += Q[i][j];
      }
    }
    Q[i][i] = -rowSum;
  }

  return Q;
}

/**
 * Solve for the steady-state distribution π such that πQ = 0 and Σπ_i = 1.
 * 
 * Uses the standard technique: replace one equation with the normalization
 * constraint and solve via Gaussian elimination.
 */
export function computeSteadyState(Q: number[][]): number[] {
  // Build augmented system: πQ = 0, Σπ = 1
  // Transpose Q so we solve Q^T π^T = 0
  const A: number[][] = Array.from({ length: N }, () => Array(N + 1).fill(0));

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      A[i][j] = Q[j][i]; // transpose
    }
    A[i][N] = 0; // RHS
  }

  // Replace last row with normalization: Σπ_i = 1
  for (let j = 0; j < N; j++) {
    A[N - 1][j] = 1;
  }
  A[N - 1][N] = 1;

  // Gaussian elimination with partial pivoting
  for (let col = 0; col < N; col++) {
    // Find pivot
    let maxRow = col;
    let maxVal = Math.abs(A[col][col]);
    for (let row = col + 1; row < N; row++) {
      if (Math.abs(A[row][col]) > maxVal) {
        maxVal = Math.abs(A[row][col]);
        maxRow = row;
      }
    }
    [A[col], A[maxRow]] = [A[maxRow], A[col]];

    const pivot = A[col][col];
    if (Math.abs(pivot) < 1e-12) continue;

    for (let j = col; j <= N; j++) A[col][j] /= pivot;

    for (let row = 0; row < N; row++) {
      if (row === col) continue;
      const factor = A[row][col];
      for (let j = col; j <= N; j++) {
        A[row][j] -= factor * A[col][j];
      }
    }
  }

  const pi = A.map(row => Math.max(0, row[N]));
  const sum = pi.reduce((a, b) => a + b, 0);
  return sum > 0 ? pi.map(p => p / sum) : Array(N).fill(1 / N);
}

/**
 * Mean sojourn time in each state = 1 / |q_ii|
 */
export function computeMeanTimeInState(Q: number[][]): number[] {
  return Q.map((row, i) => {
    const rate = Math.abs(row[i]);
    return rate > 1e-10 ? 1 / rate : Infinity;
  });
}

/**
 * Mean time to absorption (reaching 'fail' state) from each transient state.
 * 
 * Treats 'fail' as absorbing. Solves Q_T * t = -1 for transient states.
 */
export function computeMeanTimeToFailure(Q: number[][]): number {
  const failIdx = STATES.indexOf('fail');
  const transientIndices = STATES.map((_, i) => i).filter(i => i !== failIdx);
  const m = transientIndices.length;

  // Extract transient sub-matrix Q_T
  const Qt: number[][] = Array.from({ length: m }, (_, ri) =>
    Array.from({ length: m }, (_, ci) => Q[transientIndices[ri]][transientIndices[ci]])
  );

  // Solve Q_T * t = -1 (augmented matrix)
  const aug: number[][] = Qt.map((row, i) => [...row, -1]);

  for (let col = 0; col < m; col++) {
    let maxRow = col;
    for (let row = col + 1; row < m; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

    const pivot = aug[col][col];
    if (Math.abs(pivot) < 1e-12) continue;
    for (let j = col; j <= m; j++) aug[col][j] /= pivot;

    for (let row = 0; row < m; row++) {
      if (row === col) continue;
      const factor = aug[row][col];
      for (let j = col; j <= m; j++) aug[row][j] -= factor * aug[col][j];
    }
  }

  const times = aug.map(row => Math.max(0, row[m]));
  // Return mean time from "pass" state (first transient state)
  const passTransientIdx = transientIndices.indexOf(STATES.indexOf('pass'));
  return passTransientIdx >= 0 ? times[passTransientIdx] : times[0] || 0;
}

/**
 * Compute transient state probabilities at time t: P(t) = e^{Qt}
 * Using matrix exponential approximation via Padé (truncated Taylor series).
 */
export function computeTransientProbabilities(Q: number[][], t: number, steps: number = 20): number[][] {
  // P(t) ≈ (I + Qt/steps)^steps  (Euler method for matrix exponential)
  const dt = t / steps;
  let P: number[][] = Array.from({ length: N }, (_, i) =>
    Array.from({ length: N }, (_, j) => (i === j ? 1.0 : 0.0))
  );

  const step: number[][] = Array.from({ length: N }, (_, i) =>
    Array.from({ length: N }, (_, j) => (i === j ? 1.0 : 0.0) + Q[i][j] * dt)
  );

  for (let s = 0; s < steps; s++) {
    const newP: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        for (let k = 0; k < N; k++) {
          newP[i][j] += P[i][k] * step[k][j];
        }
      }
    }
    P = newP;
  }

  // Normalize rows
  return P.map(row => {
    const sum = row.reduce((a, b) => a + Math.max(0, b), 0);
    return row.map(v => Math.max(0, sum > 0 ? v / sum : 1 / N));
  });
}

/**
 * Run full Markov analysis from observation data.
 */
export function runMarkovAnalysis(observations: TransitionObservation[]): MarkovAnalysis {
  const Q = estimateTransitionRateMatrix(observations);
  const steadyState = computeSteadyState(Q);
  const meanTime = computeMeanTimeInState(Q);
  const mttf = computeMeanTimeToFailure(Q);

  // Compute transient probabilities at t = 24h, 72h, 168h (1wk), 720h (1mo)
  const timePoints = [24, 72, 168, 720];
  const transientProbs = timePoints.map(t => {
    const P = computeTransientProbabilities(Q, t);
    // Return probabilities starting from "pass" state
    return P[STATES.indexOf('pass')] || Array(N).fill(1 / N);
  });

  return {
    transitionRateMatrix: Q,
    steadyStateDistribution: steadyState,
    meanTimeInState: meanTime,
    meanTimeToFailure: mttf,
    transientProbabilities: transientProbs,
    stateLabels: [...STATES],
  };
}

/**
 * Generate synthetic observations from control test history for demonstration.
 */
export function generateSyntheticObservations(controlCount: number = 20): TransitionObservation[] {
  const observations: TransitionObservation[] = [];
  const transitions: [MarkovState, MarkovState, number][] = [
    ['pass', 'warning', 48],
    ['pass', 'warning', 72],
    ['pass', 'warning', 120],
    ['warning', 'fail', 24],
    ['warning', 'fail', 36],
    ['warning', 'pass', 12],
    ['warning', 'pass', 8],
    ['warning', 'pass', 16],
    ['fail', 'warning', 6],
    ['fail', 'warning', 12],
    ['fail', 'pass', 24],
    ['pass', 'fail', 200],
    ['not_tested', 'pass', 4],
    ['not_tested', 'warning', 8],
    ['not_tested', 'fail', 2],
    ['pass', 'pass', 168], // self-loop placeholder excluded
  ];

  for (let c = 0; c < controlCount; c++) {
    const jitter = 0.5 + Math.random();
    for (const [from, to, time] of transitions) {
      if (from === to) continue;
      observations.push({
        fromState: from,
        toState: to,
        timeInState: time * jitter,
      });
    }
  }

  return observations;
}
