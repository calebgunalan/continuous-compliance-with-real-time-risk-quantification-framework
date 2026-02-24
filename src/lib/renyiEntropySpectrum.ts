/**
 * Rényi Entropy Spectrum for Compliance (RESC)
 * 
 * Generalizes Shannon entropy (CEI, α=1) to the full Rényi family H_α,
 * producing an entropy spectrum and Spectral Entropy Gradient (SEG).
 *
 * H_α(X) = 1/(1-α) · log₂(Σ pᵢ^α)
 *
 * Special cases:
 *   α→0:   H₀ = log₂(|support|)         (Hartley entropy)
 *   α→1:   H₁ = -Σ pᵢ log₂(pᵢ)         (Shannon entropy)
 *   α=2:   H₂ = -log₂(Σ pᵢ²)           (collision entropy)
 *   α→∞:   H_∞ = -log₂(max(pᵢ))         (min-entropy)
 */

import type { ControlState } from './complianceEntropy';

// ── Rényi entropy for arbitrary α ──────────────────────────────────────
export function renyiEntropy(probs: number[], alpha: number): number {
  const filtered = probs.filter(p => p > 0);
  if (filtered.length === 0) return 0;

  // Hartley entropy (α → 0)
  if (alpha <= 0.001) return Math.log2(filtered.length);

  // Shannon entropy (α → 1)
  if (Math.abs(alpha - 1) < 0.001) {
    return -filtered.reduce((s, p) => s + p * Math.log2(p), 0);
  }

  // Min-entropy (α → ∞)
  if (alpha > 50) return -Math.log2(Math.max(...filtered));

  // General case
  const sumPAlpha = filtered.reduce((s, p) => s + Math.pow(p, alpha), 0);
  return (1 / (1 - alpha)) * Math.log2(sumPAlpha);
}

// ── Build probability distribution from control states ─────────────────
export function controlStateDistribution(states: ControlState[]): number[] {
  if (states.length === 0) return [0.25, 0.25, 0.25, 0.25];
  const counts = { pass: 0, fail: 0, warning: 0, not_tested: 0 };
  for (const s of states) counts[s] = (counts[s] || 0) + 1;
  const n = states.length;
  return [counts.pass / n, counts.fail / n, counts.warning / n, counts.not_tested / n];
}

// ── Normalized Rényi Compliance Entropy Index ──────────────────────────
export function normalizedRCEI(probs: number[], alpha: number): number {
  const numStates = probs.length;
  if (numStates <= 1) return 0;
  const maxEntropy = Math.log2(numStates);
  if (maxEntropy === 0) return 0;
  return renyiEntropy(probs, alpha) / maxEntropy;
}

// ── Compute full entropy spectrum ──────────────────────────────────────
export interface SpectrumPoint {
  alpha: number;
  entropy: number;
  normalizedEntropy: number;
}

export function computeEntropySpectrum(
  probs: number[],
  alphaMin = 0,
  alphaMax = 10,
  steps = 100
): SpectrumPoint[] {
  const spectrum: SpectrumPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const alpha = alphaMin + (alphaMax - alphaMin) * (i / steps);
    spectrum.push({
      alpha: Math.round(alpha * 100) / 100,
      entropy: renyiEntropy(probs, alpha),
      normalizedEntropy: normalizedRCEI(probs, alpha),
    });
  }
  return spectrum;
}

// ── Key entropy values ─────────────────────────────────────────────────
export interface KeyEntropies {
  hartley: number;   // α=0
  shannon: number;   // α=1
  collision: number; // α=2
  minEntropy: number; // α→∞
}

export function computeKeyEntropies(probs: number[]): KeyEntropies {
  return {
    hartley: renyiEntropy(probs, 0),
    shannon: renyiEntropy(probs, 1),
    collision: renyiEntropy(probs, 2),
    minEntropy: renyiEntropy(probs, 100),
  };
}

// ── Spectral Entropy Gradient (SEG) ────────────────────────────────────
// SEG = |RCEI(0) - RCEI(∞)| / RCEI(1)
export function spectralEntropyGradient(probs: number[]): number {
  const rcei0 = normalizedRCEI(probs, 0);
  const rcei1 = normalizedRCEI(probs, 1);
  const rceiInf = normalizedRCEI(probs, 100);
  if (rcei1 === 0) return 0;
  return Math.abs(rcei0 - rceiInf) / rcei1;
}

// ── Reference distributions for comparison ─────────────────────────────
export function uniformDistribution(n: number): number[] {
  return Array(n).fill(1 / n);
}

export function concentratedDistribution(n: number, dominantFraction = 0.95): number[] {
  const rest = (1 - dominantFraction) / (n - 1);
  return [dominantFraction, ...Array(n - 1).fill(rest)];
}

// ── Full analysis ──────────────────────────────────────────────────────
export interface RenyiAnalysis {
  distribution: number[];
  keyEntropies: KeyEntropies;
  seg: number;
  spectrum: SpectrumPoint[];
  uniformSpectrum: SpectrumPoint[];
  concentratedSpectrum: SpectrumPoint[];
  interpretation: string;
}

export function analyzeRenyiSpectrum(states: ControlState[]): RenyiAnalysis {
  const dist = controlStateDistribution(states);
  const keyEntropies = computeKeyEntropies(dist);
  const seg = spectralEntropyGradient(dist);
  const spectrum = computeEntropySpectrum(dist);
  const uniformSpectrum = computeEntropySpectrum(uniformDistribution(4));
  const concentratedSpectrum = computeEntropySpectrum(concentratedDistribution(4));

  let interpretation: string;
  if (seg < 0.3) {
    interpretation = 'Uniform disorder — compliance states are broadly distributed with no dominant state. High unpredictability.';
  } else if (seg < 0.8) {
    interpretation = 'Structured compliance — moderate concentration with some diversity. Governance is partially ordered.';
  } else if (seg <= 1.0) {
    interpretation = 'Transitional regime — one state dominates but outliers persist. Governance is consolidating.';
  } else {
    interpretation = 'Extreme concentration — nearly all controls in one state. Ordered but potentially fragile if the dominant state shifts.';
  }

  return { distribution: dist, keyEntropies, seg, spectrum, uniformSpectrum, concentratedSpectrum, interpretation };
}
