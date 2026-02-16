/**
 * Temporal Risk Velocity and Acceleration
 * 
 * Computes first and second derivatives of risk over time:
 * - Risk Velocity = dR/dt (rate of risk change)
 * - Risk Acceleration = d²R/dt² (rate of velocity change)
 * - Risk Momentum = weighted_avg(velocity) * sign(acceleration)
 */

export interface RiskSnapshot {
  timestamp: string;
  riskExposure: number;
}

export interface VelocityPoint {
  timestamp: string;
  riskExposure: number;
  velocity: number;           // dR/dt ($/day)
  acceleration: number;       // d²R/dt² ($/day²)
}

export interface MomentumResult {
  currentVelocity: number;
  currentAcceleration: number;
  momentumScore: number;       // -1 to +1
  trend: 'improving_fast' | 'improving' | 'stable' | 'worsening' | 'worsening_fast';
  trendLabel: string;
  trendColor: string;          // CSS color token
  velocityHistory: VelocityPoint[];
  projectedRisk30Days: number;
  projectedRisk90Days: number;
}

/**
 * Calculate numerical derivatives from risk time series
 */
export function calculateRiskDerivatives(snapshots: RiskSnapshot[]): VelocityPoint[] {
  if (snapshots.length < 2) {
    return snapshots.map(s => ({
      timestamp: s.timestamp,
      riskExposure: s.riskExposure,
      velocity: 0,
      acceleration: 0,
    }));
  }

  // Sort by timestamp
  const sorted = [...snapshots].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const points: VelocityPoint[] = [];

  for (let i = 0; i < sorted.length; i++) {
    let velocity = 0;
    let acceleration = 0;

    if (i > 0) {
      const dt = (new Date(sorted[i].timestamp).getTime() - new Date(sorted[i - 1].timestamp).getTime()) / (1000 * 60 * 60 * 24); // days
      if (dt > 0) {
        velocity = (sorted[i].riskExposure - sorted[i - 1].riskExposure) / dt;
      }
    }

    if (i > 1) {
      const dt1 = (new Date(sorted[i].timestamp).getTime() - new Date(sorted[i - 1].timestamp).getTime()) / (1000 * 60 * 60 * 24);
      const dt0 = (new Date(sorted[i - 1].timestamp).getTime() - new Date(sorted[i - 2].timestamp).getTime()) / (1000 * 60 * 60 * 24);
      const prevVelocity = dt0 > 0 ? (sorted[i - 1].riskExposure - sorted[i - 2].riskExposure) / dt0 : 0;
      const avgDt = (dt1 + dt0) / 2;
      if (avgDt > 0) {
        acceleration = (velocity - prevVelocity) / avgDt;
      }
    }

    points.push({
      timestamp: sorted[i].timestamp,
      riskExposure: sorted[i].riskExposure,
      velocity,
      acceleration,
    });
  }

  return points;
}

/**
 * Calculate risk momentum score and trend classification
 */
export function calculateRiskMomentum(
  snapshots: RiskSnapshot[],
  windowSize: number = 7
): MomentumResult {
  const derivatives = calculateRiskDerivatives(snapshots);
  
  if (derivatives.length === 0) {
    return {
      currentVelocity: 0,
      currentAcceleration: 0,
      momentumScore: 0,
      trend: 'stable',
      trendLabel: 'No Data',
      trendColor: 'muted-foreground',
      velocityHistory: [],
      projectedRisk30Days: 0,
      projectedRisk90Days: 0,
    };
  }

  const recent = derivatives.slice(-windowSize);
  const current = recent[recent.length - 1];
  
  // Weighted average velocity (more recent = higher weight)
  const totalWeight = recent.reduce((sum, _, i) => sum + (i + 1), 0);
  const weightedVelocity = recent.reduce((sum, p, i) => sum + p.velocity * (i + 1), 0) / totalWeight;
  
  // Normalize momentum to [-1, 1]
  const maxRisk = Math.max(...snapshots.map(s => s.riskExposure), 1);
  const normalizedVelocity = weightedVelocity / maxRisk;
  const momentumScore = Math.max(-1, Math.min(1, normalizedVelocity * 30)); // Scale by ~month

  // Classify trend
  let trend: MomentumResult['trend'];
  let trendLabel: string;
  let trendColor: string;
  
  if (momentumScore < -0.3) {
    trend = 'improving_fast';
    trendLabel = 'Rapidly Improving';
    trendColor = 'success';
  } else if (momentumScore < -0.05) {
    trend = 'improving';
    trendLabel = 'Improving';
    trendColor = 'success';
  } else if (momentumScore <= 0.05) {
    trend = 'stable';
    trendLabel = 'Stable';
    trendColor = 'warning';
  } else if (momentumScore <= 0.3) {
    trend = 'worsening';
    trendLabel = 'Worsening';
    trendColor = 'destructive';
  } else {
    trend = 'worsening_fast';
    trendLabel = 'Rapidly Worsening';
    trendColor = 'destructive';
  }

  // Project future risk using current velocity and acceleration
  const currentRisk = current.riskExposure;
  const projectedRisk30Days = Math.max(0, currentRisk + current.velocity * 30 + 0.5 * current.acceleration * 900);
  const projectedRisk90Days = Math.max(0, currentRisk + current.velocity * 90 + 0.5 * current.acceleration * 8100);

  return {
    currentVelocity: current.velocity,
    currentAcceleration: current.acceleration,
    momentumScore,
    trend,
    trendLabel,
    trendColor,
    velocityHistory: derivatives,
    projectedRisk30Days,
    projectedRisk90Days,
  };
}

/**
 * Format velocity for display ($/day -> human-readable)
 */
export function formatVelocity(velocityPerDay: number): string {
  const absVel = Math.abs(velocityPerDay);
  const sign = velocityPerDay >= 0 ? '+' : '-';
  
  if (absVel >= 1000000) return `${sign}$${(absVel / 1000000).toFixed(1)}M/day`;
  if (absVel >= 1000) return `${sign}$${(absVel / 1000).toFixed(0)}K/day`;
  return `${sign}$${absVel.toFixed(0)}/day`;
}

/**
 * Format momentum score for display
 */
export function formatMomentumScore(score: number): string {
  const percentage = Math.round(score * 100);
  return `${percentage > 0 ? '+' : ''}${percentage}`;
}
