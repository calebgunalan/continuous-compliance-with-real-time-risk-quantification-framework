/**
 * Compliance Entropy Index (CEI)
 * 
 * A novel metric applying Shannon Entropy from information theory to quantify
 * the "disorder" in an organization's compliance posture.
 * 
 * CEI = -SUM(p_i * log2(p_i)) / log2(N)
 * 
 * where p_i = proportion of controls in state i (pass, fail, warning, not_tested)
 * and N = number of possible states (4)
 * 
 * CEI = 0: Perfect order (all controls in one state)
 * CEI = 1: Maximum entropy (equal distribution across all states)
 */

export type ControlState = 'pass' | 'fail' | 'warning' | 'not_tested';

export interface EntropyResult {
  cei: number;                    // 0-1 normalized entropy
  rawEntropy: number;             // Unnormalized Shannon entropy
  stateDistribution: Record<ControlState, number>;
  zone: 'ordered' | 'transitional' | 'chaotic';
  zoneLabel: string;
  dominantState: ControlState;
  uniformityScore: number;        // How uniform is the distribution (1 = perfectly uniform)
}

export interface EntropyTrend {
  timestamp: string;
  cei: number;
  zone: string;
}

export interface EntropyVelocity {
  currentCEI: number;
  previousCEI: number;
  velocity: number;               // dCEI/dt (positive = increasing disorder)
  acceleration: number;           // d2CEI/dt2
  trend: 'stabilizing' | 'destabilizing' | 'stable';
}

const STATES: ControlState[] = ['pass', 'fail', 'warning', 'not_tested'];
const NUM_STATES = STATES.length;
const LOG2_N = Math.log2(NUM_STATES);

/**
 * Calculate Shannon entropy for a probability distribution
 */
function shannonEntropy(probabilities: number[]): number {
  return -probabilities.reduce((sum, p) => {
    if (p <= 0) return sum;
    return sum + p * Math.log2(p);
  }, 0);
}

/**
 * Calculate the Compliance Entropy Index from control states
 */
export function calculateCEI(controlStates: ControlState[]): EntropyResult {
  const total = controlStates.length;
  
  if (total === 0) {
    return {
      cei: 0,
      rawEntropy: 0,
      stateDistribution: { pass: 0, fail: 0, warning: 0, not_tested: 0 },
      zone: 'ordered',
      zoneLabel: 'No Data',
      dominantState: 'not_tested',
      uniformityScore: 0,
    };
  }

  // Count occurrences of each state
  const counts: Record<ControlState, number> = { pass: 0, fail: 0, warning: 0, not_tested: 0 };
  controlStates.forEach(state => { counts[state]++; });

  // Calculate proportions
  const proportions = STATES.map(s => counts[s] / total);
  
  // Calculate Shannon entropy
  const rawEntropy = shannonEntropy(proportions);
  
  // Normalize to [0, 1]
  const cei = LOG2_N > 0 ? rawEntropy / LOG2_N : 0;

  // Determine zone
  let zone: EntropyResult['zone'];
  let zoneLabel: string;
  if (cei < 0.3) {
    zone = 'ordered';
    zoneLabel = 'Highly Ordered';
  } else if (cei < 0.7) {
    zone = 'transitional';
    zoneLabel = 'Transitional';
  } else {
    zone = 'chaotic';
    zoneLabel = 'High Disorder';
  }

  // Find dominant state
  const dominantState = STATES.reduce((a, b) => counts[a] >= counts[b] ? a : b);

  // Uniformity score: 1 - normalized deviation from uniform distribution
  const uniformProportion = 1 / NUM_STATES;
  const maxDeviation = Math.sqrt(NUM_STATES * Math.pow(1 - uniformProportion, 2));
  const actualDeviation = Math.sqrt(proportions.reduce((sum, p) => sum + Math.pow(p - uniformProportion, 2), 0));
  const uniformityScore = maxDeviation > 0 ? 1 - (actualDeviation / maxDeviation) : 1;

  return {
    cei,
    rawEntropy,
    stateDistribution: {
      pass: counts.pass / total,
      fail: counts.fail / total,
      warning: counts.warning / total,
      not_tested: counts.not_tested / total,
    },
    zone,
    zoneLabel,
    dominantState,
    uniformityScore,
  };
}

/**
 * Calculate entropy velocity (rate of change over time)
 */
export function calculateEntropyVelocity(
  entropyHistory: EntropyTrend[],
  windowSize: number = 3
): EntropyVelocity {
  if (entropyHistory.length < 2) {
    return {
      currentCEI: entropyHistory[0]?.cei || 0,
      previousCEI: 0,
      velocity: 0,
      acceleration: 0,
      trend: 'stable',
    };
  }

  const recent = entropyHistory.slice(-windowSize);
  const currentCEI = recent[recent.length - 1].cei;
  const previousCEI = recent[recent.length - 2].cei;
  
  // First derivative (velocity)
  const velocity = currentCEI - previousCEI;
  
  // Second derivative (acceleration) 
  let acceleration = 0;
  if (recent.length >= 3) {
    const prevVelocity = recent[recent.length - 2].cei - recent[recent.length - 3].cei;
    acceleration = velocity - prevVelocity;
  }

  let trend: EntropyVelocity['trend'];
  if (Math.abs(velocity) < 0.02) {
    trend = 'stable';
  } else if (velocity > 0) {
    trend = 'destabilizing';
  } else {
    trend = 'stabilizing';
  }

  return { currentCEI, previousCEI, velocity, acceleration, trend };
}

/**
 * Calculate conditional entropy: entropy of a subset of controls
 * Useful for per-framework or per-category entropy analysis
 */
export function calculateConditionalCEI(
  controlStates: ControlState[],
  groupLabels: string[],
): Record<string, EntropyResult> {
  const groups: Record<string, ControlState[]> = {};
  controlStates.forEach((state, i) => {
    const label = groupLabels[i] || 'unknown';
    if (!groups[label]) groups[label] = [];
    groups[label].push(state);
  });

  const results: Record<string, EntropyResult> = {};
  for (const [label, states] of Object.entries(groups)) {
    results[label] = calculateCEI(states);
  }
  return results;
}
