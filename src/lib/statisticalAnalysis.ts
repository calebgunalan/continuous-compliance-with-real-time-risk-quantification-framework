/**
 * Statistical Analysis Engine for Research Publication
 * Implements correlation analysis, regression, and hypothesis testing
 */

export interface DataPoint {
  x: number;
  y: number;
}

export interface RegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  standardError: number;
  predictions: number[];
}

export interface CorrelationResult {
  pearsonR: number;
  pValue: number;
  sampleSize: number;
  confidenceInterval: [number, number];
  interpretation: string;
}

export interface LogisticRegressionResult {
  coefficients: number[];
  intercept: number;
  predictions: number[];
  accuracy: number;
  auc: number;
}

export interface BootstrapResult {
  estimate: number;
  standardError: number;
  confidenceInterval: [number, number];
  iterations: number;
}

// Basic statistical functions
export function mean(data: number[]): number {
  if (data.length === 0) return 0;
  return data.reduce((sum, val) => sum + val, 0) / data.length;
}

export function standardDeviation(data: number[]): number {
  if (data.length < 2) return 0;
  const avg = mean(data);
  const squaredDiffs = data.map(val => Math.pow(val - avg, 2));
  return Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / (data.length - 1));
}

export function variance(data: number[]): number {
  const std = standardDeviation(data);
  return std * std;
}

export function covariance(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 2) return 0;
  const xMean = mean(x);
  const yMean = mean(y);
  let sum = 0;
  for (let i = 0; i < x.length; i++) {
    sum += (x[i] - xMean) * (y[i] - yMean);
  }
  return sum / (x.length - 1);
}

// Pearson correlation coefficient
export function calculateCorrelation(x: number[], y: number[]): CorrelationResult {
  if (x.length !== y.length || x.length < 3) {
    return {
      pearsonR: 0,
      pValue: 1,
      sampleSize: x.length,
      confidenceInterval: [0, 0],
      interpretation: 'Insufficient data',
    };
  }

  const n = x.length;
  const cov = covariance(x, y);
  const stdX = standardDeviation(x);
  const stdY = standardDeviation(y);

  if (stdX === 0 || stdY === 0) {
    return {
      pearsonR: 0,
      pValue: 1,
      sampleSize: n,
      confidenceInterval: [0, 0],
      interpretation: 'No variance in data',
    };
  }

  const r = cov / (stdX * stdY);

  // Calculate t-statistic for p-value
  const t = r * Math.sqrt((n - 2) / (1 - r * r));
  
  // Approximate p-value using t-distribution (simplified)
  const df = n - 2;
  const pValue = 2 * (1 - tCDF(Math.abs(t), df));

  // Fisher z-transformation for confidence interval
  const z = 0.5 * Math.log((1 + r) / (1 - r));
  const se = 1 / Math.sqrt(n - 3);
  const zCrit = 1.96; // 95% CI
  const zLower = z - zCrit * se;
  const zUpper = z + zCrit * se;
  const ciLower = (Math.exp(2 * zLower) - 1) / (Math.exp(2 * zLower) + 1);
  const ciUpper = (Math.exp(2 * zUpper) - 1) / (Math.exp(2 * zUpper) + 1);

  // Interpretation
  let interpretation: string;
  const absR = Math.abs(r);
  if (absR >= 0.8) interpretation = 'Very strong correlation';
  else if (absR >= 0.6) interpretation = 'Strong correlation';
  else if (absR >= 0.4) interpretation = 'Moderate correlation';
  else if (absR >= 0.2) interpretation = 'Weak correlation';
  else interpretation = 'Very weak or no correlation';

  if (r < 0) interpretation = 'Negative ' + interpretation.toLowerCase();

  return {
    pearsonR: r,
    pValue: Math.max(0, Math.min(1, pValue)),
    sampleSize: n,
    confidenceInterval: [ciLower, ciUpper],
    interpretation,
  };
}

// Simplified t-distribution CDF (using normal approximation for large df)
function tCDF(t: number, df: number): number {
  // Use normal approximation for df > 30
  if (df > 30) {
    return normalCDF(t);
  }
  
  // Simplified calculation for smaller df
  const x = df / (df + t * t);
  return 1 - 0.5 * incompleteBeta(df / 2, 0.5, x);
}

function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

// Simplified incomplete beta function
function incompleteBeta(a: number, b: number, x: number): number {
  // Using a simple approximation
  if (x === 0) return 0;
  if (x === 1) return 1;
  
  // Continued fraction approximation (simplified)
  let sum = 0;
  let term = 1;
  for (let n = 0; n < 100; n++) {
    term *= (a + n) * x / (a + b + n);
    sum += term / (a + n + 1);
    if (Math.abs(term) < 1e-10) break;
  }
  
  return Math.pow(x, a) * Math.pow(1 - x, b) * sum / beta(a, b);
}

function beta(a: number, b: number): number {
  return gamma(a) * gamma(b) / gamma(a + b);
}

function gamma(z: number): number {
  // Lanczos approximation
  const g = 7;
  const c = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];

  if (z < 0.5) {
    return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  }

  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) {
    x += c[i] / (z + i);
  }

  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

// Linear regression
export function linearRegression(data: DataPoint[]): RegressionResult {
  if (data.length < 2) {
    return {
      slope: 0,
      intercept: 0,
      rSquared: 0,
      standardError: 0,
      predictions: [],
    };
  }

  const x = data.map(d => d.x);
  const y = data.map(d => d.y);
  const n = data.length;

  const xMean = mean(x);
  const yMean = mean(y);

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (x[i] - xMean) * (y[i] - yMean);
    denominator += Math.pow(x[i] - xMean, 2);
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;

  // Calculate R-squared
  const predictions = x.map(xi => slope * xi + intercept);
  const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - predictions[i], 2), 0);
  const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
  const rSquared = ssTot !== 0 ? 1 - ssRes / ssTot : 0;

  // Standard error of regression
  const standardError = Math.sqrt(ssRes / (n - 2));

  return {
    slope,
    intercept,
    rSquared,
    standardError,
    predictions,
  };
}

// Logistic regression (simplified gradient descent)
export function logisticRegression(
  features: number[][],
  outcomes: boolean[],
  learningRate = 0.1,
  iterations = 1000
): LogisticRegressionResult {
  if (features.length === 0 || features.length !== outcomes.length) {
    return {
      coefficients: [],
      intercept: 0,
      predictions: [],
      accuracy: 0,
      auc: 0,
    };
  }

  const n = features.length;
  const numFeatures = features[0].length;
  const y = outcomes.map(o => o ? 1 : 0);

  // Initialize coefficients
  let coefficients = new Array(numFeatures).fill(0);
  let intercept = 0;

  // Sigmoid function
  const sigmoid = (z: number) => 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, z))));

  // Gradient descent
  for (let iter = 0; iter < iterations; iter++) {
    const gradients = new Array(numFeatures).fill(0);
    let interceptGradient = 0;

    for (let i = 0; i < n; i++) {
      const z = intercept + features[i].reduce((sum, f, j) => sum + f * coefficients[j], 0);
      const prediction = sigmoid(z);
      const error = prediction - y[i];

      interceptGradient += error;
      for (let j = 0; j < numFeatures; j++) {
        gradients[j] += error * features[i][j];
      }
    }

    intercept -= (learningRate / n) * interceptGradient;
    for (let j = 0; j < numFeatures; j++) {
      coefficients[j] -= (learningRate / n) * gradients[j];
    }
  }

  // Calculate predictions and accuracy
  const predictions = features.map(f => {
    const z = intercept + f.reduce((sum, fi, j) => sum + fi * coefficients[j], 0);
    return sigmoid(z);
  });

  const predictedClasses = predictions.map(p => p >= 0.5);
  const correct = predictedClasses.filter((p, i) => p === outcomes[i]).length;
  const accuracy = correct / n;

  // Calculate AUC (simplified)
  const auc = calculateAUC(predictions, y);

  return {
    coefficients,
    intercept,
    predictions,
    accuracy,
    auc,
  };
}

function calculateAUC(predictions: number[], actuals: number[]): number {
  const pairs: Array<{ pred: number; actual: number }> = predictions.map((p, i) => ({
    pred: p,
    actual: actuals[i],
  }));

  pairs.sort((a, b) => b.pred - a.pred);

  let truePositives = 0;
  let falsePositives = 0;
  let prevTP = 0;
  let prevFP = 0;
  let auc = 0;

  const totalPositives = actuals.filter(a => a === 1).length;
  const totalNegatives = actuals.length - totalPositives;

  if (totalPositives === 0 || totalNegatives === 0) return 0.5;

  for (const pair of pairs) {
    if (pair.actual === 1) {
      truePositives++;
    } else {
      falsePositives++;
      auc += (truePositives + prevTP) / 2;
    }
    prevTP = truePositives;
    prevFP = falsePositives;
  }

  return auc / (totalPositives * totalNegatives);
}

// Bootstrap confidence interval
export function bootstrapCI(
  data: number[],
  statistic: (d: number[]) => number,
  iterations = 1000,
  confidenceLevel = 0.95
): BootstrapResult {
  if (data.length === 0) {
    return {
      estimate: 0,
      standardError: 0,
      confidenceInterval: [0, 0],
      iterations,
    };
  }

  const bootstrapEstimates: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const resample = [];
    for (let j = 0; j < data.length; j++) {
      const idx = Math.floor(Math.random() * data.length);
      resample.push(data[idx]);
    }
    bootstrapEstimates.push(statistic(resample));
  }

  bootstrapEstimates.sort((a, b) => a - b);

  const alpha = 1 - confidenceLevel;
  const lowerIdx = Math.floor((alpha / 2) * iterations);
  const upperIdx = Math.floor((1 - alpha / 2) * iterations);

  return {
    estimate: statistic(data),
    standardError: standardDeviation(bootstrapEstimates),
    confidenceInterval: [bootstrapEstimates[lowerIdx], bootstrapEstimates[upperIdx]],
    iterations,
  };
}

// Kaplan-Meier survival analysis (simplified)
export interface SurvivalResult {
  times: number[];
  survivalProbabilities: number[];
  medianSurvival: number | null;
  confidenceIntervals: Array<[number, number]>;
}

export function kaplanMeier(
  timeToEvent: number[],
  eventOccurred: boolean[]
): SurvivalResult {
  if (timeToEvent.length !== eventOccurred.length || timeToEvent.length === 0) {
    return {
      times: [],
      survivalProbabilities: [],
      medianSurvival: null,
      confidenceIntervals: [],
    };
  }

  // Combine and sort by time
  const data = timeToEvent.map((t, i) => ({ time: t, event: eventOccurred[i] }));
  data.sort((a, b) => a.time - b.time);

  const uniqueTimes = [...new Set(data.map(d => d.time))];
  const survivalProbs: number[] = [];
  const ciLower: number[] = [];
  const ciUpper: number[] = [];

  let atRisk = data.length;
  let survivalProb = 1;

  for (const t of uniqueTimes) {
    const events = data.filter(d => d.time === t && d.event).length;
    const censored = data.filter(d => d.time === t && !d.event).length;

    if (atRisk > 0 && events > 0) {
      survivalProb *= (atRisk - events) / atRisk;
    }

    survivalProbs.push(survivalProb);

    // Greenwood's formula for variance (simplified)
    const se = survivalProb * Math.sqrt(events / (atRisk * (atRisk - events + 0.001)));
    ciLower.push(Math.max(0, survivalProb - 1.96 * se));
    ciUpper.push(Math.min(1, survivalProb + 1.96 * se));

    atRisk -= events + censored;
  }

  // Find median survival time
  let medianSurvival: number | null = null;
  for (let i = 0; i < survivalProbs.length; i++) {
    if (survivalProbs[i] <= 0.5) {
      medianSurvival = uniqueTimes[i];
      break;
    }
  }

  return {
    times: uniqueTimes,
    survivalProbabilities: survivalProbs,
    medianSurvival,
    confidenceIntervals: ciLower.map((l, i) => [l, ciUpper[i]] as [number, number]),
  };
}

// Hypothesis test result formatter
export interface HypothesisTestResult {
  testName: string;
  testStatistic: number;
  pValue: number;
  confidenceInterval: [number, number];
  effectSize: number;
  sampleSize: number;
  isSignificant: boolean;
  interpretation: string;
}

export function formatHypothesisTest(
  testName: string,
  correlation: CorrelationResult,
  significanceLevel = 0.05
): HypothesisTestResult {
  return {
    testName,
    testStatistic: correlation.pearsonR,
    pValue: correlation.pValue,
    confidenceInterval: correlation.confidenceInterval,
    effectSize: correlation.pearsonR,
    sampleSize: correlation.sampleSize,
    isSignificant: correlation.pValue < significanceLevel,
    interpretation: correlation.pValue < significanceLevel
      ? `Statistically significant ${correlation.interpretation.toLowerCase()} (p < ${significanceLevel})`
      : `Not statistically significant at α = ${significanceLevel}`,
  };
}
