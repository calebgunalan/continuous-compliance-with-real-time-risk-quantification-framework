/**
 * Adaptive Bayesian Risk Scoring (ABRS)
 * 
 * Replaces static FAIR point estimates with a Bayesian model that updates
 * breach probability in real-time as new control test evidence arrives.
 * 
 * Prior:    P(breach) ~ Beta(alpha, beta)
 * Evidence: Each control test = Bernoulli trial
 * Update:   alpha' = alpha + failures, beta' = beta + passes
 * Posterior: E[P(breach)] = alpha' / (alpha' + beta')
 * 
 * Combined with FAIR:
 *   ALE = posterior_breach_prob * threat_frequency * loss_magnitude
 */

export interface BayesianPrior {
  alpha: number;    // Shape parameter (failures + prior)
  beta: number;     // Shape parameter (passes + prior)
  source: string;   // Where the prior came from
}

export interface PosteriorResult {
  mean: number;                // E[P(breach)] = alpha / (alpha + beta)
  variance: number;            // Var = alpha*beta / ((alpha+beta)^2 * (alpha+beta+1))
  mode: number;                // Mode = (alpha-1)/(alpha+beta-2) if alpha,beta > 1
  credibleInterval: [number, number]; // 95% credible interval
  alpha: number;
  beta: number;
  totalEvidence: number;       // alpha + beta - prior
  confidenceLevel: number;     // 0-1 how confident we are (based on evidence volume)
}

export interface BayesianFAIRResult {
  posteriorBreachProbability: number;
  annualLossExposure: number;
  confidenceInterval: [number, number]; // ALE confidence interval
  evidenceStrength: 'weak' | 'moderate' | 'strong' | 'very_strong';
  priorInfluence: number;      // 0-1 how much the prior still dominates
}

export interface EvidencePoint {
  timestamp: string;
  passes: number;
  failures: number;
}

export interface PosteriorTimeSeries {
  timestamp: string;
  mean: number;
  lower: number;   // 95% CI lower
  upper: number;   // 95% CI upper
  alpha: number;
  beta: number;
}

// Industry benchmark priors (based on typical breach rates)
export const INDUSTRY_PRIORS: Record<string, BayesianPrior> = {
  financial_services: { alpha: 3, beta: 47, source: 'Financial Services benchmark (6% base rate)' },
  healthcare: { alpha: 4, beta: 46, source: 'Healthcare benchmark (8% base rate)' },
  technology: { alpha: 2, beta: 48, source: 'Technology sector benchmark (4% base rate)' },
  manufacturing: { alpha: 3, beta: 47, source: 'Manufacturing benchmark (6% base rate)' },
  retail: { alpha: 5, beta: 45, source: 'Retail sector benchmark (10% base rate)' },
  default: { alpha: 3, beta: 47, source: 'Cross-industry average (6% base rate)' },
};

/**
 * Calculate the Beta distribution posterior from prior + evidence
 */
export function calculatePosterior(
  prior: BayesianPrior,
  totalPasses: number,
  totalFailures: number
): PosteriorResult {
  const alpha = prior.alpha + totalFailures;
  const beta = prior.beta + totalPasses;
  
  const mean = alpha / (alpha + beta);
  const variance = (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1));
  const mode = (alpha > 1 && beta > 1) ? (alpha - 1) / (alpha + beta - 2) : mean;
  
  // Approximate 95% credible interval using normal approximation for Beta
  const stdDev = Math.sqrt(variance);
  const lower = Math.max(0, mean - 1.96 * stdDev);
  const upper = Math.min(1, mean + 1.96 * stdDev);
  
  const totalEvidence = totalPasses + totalFailures;
  const priorWeight = (prior.alpha + prior.beta);
  const confidenceLevel = Math.min(1, totalEvidence / (totalEvidence + priorWeight));

  return {
    mean,
    variance,
    mode,
    credibleInterval: [lower, upper],
    alpha,
    beta,
    totalEvidence,
    confidenceLevel,
  };
}

/**
 * Combine Bayesian posterior with FAIR methodology
 */
export function bayesianFAIR(
  prior: BayesianPrior,
  totalPasses: number,
  totalFailures: number,
  threatEventFrequency: number,
  totalLossMagnitude: number
): BayesianFAIRResult {
  const posterior = calculatePosterior(prior, totalPasses, totalFailures);
  
  // ALE = posterior breach probability * TEF * LM
  const annualLossExposure = posterior.mean * threatEventFrequency * totalLossMagnitude;
  
  // Confidence interval for ALE
  const aleLower = posterior.credibleInterval[0] * threatEventFrequency * totalLossMagnitude;
  const aleUpper = posterior.credibleInterval[1] * threatEventFrequency * totalLossMagnitude;
  
  // Evidence strength classification
  let evidenceStrength: BayesianFAIRResult['evidenceStrength'];
  if (posterior.totalEvidence < 10) evidenceStrength = 'weak';
  else if (posterior.totalEvidence < 50) evidenceStrength = 'moderate';
  else if (posterior.totalEvidence < 200) evidenceStrength = 'strong';
  else evidenceStrength = 'very_strong';
  
  const priorWeight = prior.alpha + prior.beta;
  const priorInfluence = priorWeight / (priorWeight + posterior.totalEvidence);

  return {
    posteriorBreachProbability: posterior.mean,
    annualLossExposure,
    confidenceInterval: [aleLower, aleUpper],
    evidenceStrength,
    priorInfluence,
  };
}

/**
 * Generate a time series of posterior updates as evidence accumulates
 */
export function generatePosteriorTimeSeries(
  prior: BayesianPrior,
  evidencePoints: EvidencePoint[]
): PosteriorTimeSeries[] {
  let cumulativePasses = 0;
  let cumulativeFailures = 0;
  
  return evidencePoints.map(point => {
    cumulativePasses += point.passes;
    cumulativeFailures += point.failures;
    
    const posterior = calculatePosterior(prior, cumulativePasses, cumulativeFailures);
    
    return {
      timestamp: point.timestamp,
      mean: posterior.mean,
      lower: posterior.credibleInterval[0],
      upper: posterior.credibleInterval[1],
      alpha: posterior.alpha,
      beta: posterior.beta,
    };
  });
}

/**
 * Sample from the Beta distribution for Monte Carlo integration
 */
export function sampleBetaDistribution(alpha: number, beta: number, n: number = 1000): number[] {
  // Using the inverse CDF method with a simple approximation
  const samples: number[] = [];
  for (let i = 0; i < n; i++) {
    // Jöhnk's algorithm for Beta distribution sampling
    let x: number;
    if (alpha >= 1 && beta >= 1) {
      // Use rejection sampling
      let accepted = false;
      while (!accepted) {
        const u1 = Math.random();
        const u2 = Math.random();
        x = Math.pow(u1, 1 / alpha);
        const y = Math.pow(u2, 1 / beta);
        if (x + y <= 1) {
          samples.push(x / (x + y));
          accepted = true;
        }
      }
    } else {
      // Fallback: use normal approximation
      const mean = alpha / (alpha + beta);
      const variance = (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1));
      const stdDev = Math.sqrt(variance);
      x = mean + stdDev * (Math.random() + Math.random() + Math.random() - 1.5) * 1.7;
      samples.push(Math.max(0, Math.min(1, x)));
    }
  }
  return samples;
}

/**
 * Calculate the probability density function of the Beta distribution
 * for visualization purposes
 */
export function betaPDF(x: number, alpha: number, beta: number): number {
  if (x <= 0 || x >= 1) return 0;
  
  // Log-space calculation to avoid overflow
  const logBeta = logGamma(alpha) + logGamma(beta) - logGamma(alpha + beta);
  const logPdf = (alpha - 1) * Math.log(x) + (beta - 1) * Math.log(1 - x) - logBeta;
  return Math.exp(logPdf);
}

/**
 * Stirling's approximation for log-gamma function
 */
function logGamma(x: number): number {
  if (x <= 0) return 0;
  if (x < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  }
  x -= 1;
  const coeffs = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5
  ];
  let sum = 1.000000000190015;
  for (let i = 0; i < coeffs.length; i++) {
    sum += coeffs[i] / (x + i + 1);
  }
  const t = x + coeffs.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(sum);
}
