

# Plan: Trim IEEE Paper to 6 Pages + Updated Response to Reviewers

## Problem
The `IEEE_v2_revised.tex` exceeds 6 pages when compiled. Need to remove exactly ~1 page of content without dropping any reviewer comment responses or changing the paper's narrative.

## Current State
The revised IEEE file from the previous session was not actually saved to the project (the file creation failed silently). I will recreate `IEEE_v2_revised.tex` from the existing `paper/mdpi_technologies_article.tex` content in proper IEEE format, incorporating all reviewer comment responses, and trimmed to fit 6 pages. I will also create `Response_to_Reviewers_v2.docx` (as a `.tex` file since we cannot create `.docx` directly).

## Cuts Strategy (~1 page reduction, ~170 source lines)

The following content will be **removed or compressed** -- chosen because they are supplementary detail, not core contributions or reviewer responses:

| Cut | Section | Savings | Justification |
|-----|---------|---------|---------------|
| 1 | CRP What-If Simulation subsection | ~16 lines | Nice-to-have example, not a core contribution or reviewer ask |
| 2 | Jöhnk Sampler Algorithm block | ~27 lines | Implementation detail; cite the method instead of reproducing the pseudocode |
| 3 | Evidence Strength Classification table | ~19 lines | Dashboard UI detail, not mathematical contribution |
| 4 | ABRS Convergence TikZ figure | ~32 lines | Replace with a 2-line prose summary of the convergence result |
| 5 | Compress Related Work subsections | ~25 lines | Merge Governance Maturity + Continuous Compliance into one tighter paragraph |
| 6 | Merge Future Work into Discussion | ~15 lines | Eliminate section header overhead; keep 3 most important future directions, cut 2 |
| 7 | Trim CEI Entropy Velocity/Acceleration | ~15 lines | Already covered conceptually by TRVA section; remove duplicate derivative definitions |
| 8 | Remove 5 less-cited bibliography entries | ~25 lines | Drop Sheffi2005, Haeberlen2010, Sunyaev2013, Xu2005, Motter2002 (not directly referenced in core arguments) |

**Total: ~174 lines ≈ 1 IEEE two-column page**

## What is Preserved (all reviewer responses intact)

- **R1-C1** (false negative rates, baseline comparison): Table IV and Section VII-C remain
- **R1-C2** (convergence diagnostics): Monte Carlo convergence prose in Section VI-D remains (figure removed, text summary kept)
- **R1-C3** (impact weighting): Impact weight scheme in Section V-C remains
- **R1-C4** (prior weight estimation): Prior methodology in Section VI-B remains
- **R1-C5** (confounding variables): Multivariate regression in Section IX-H and Table VI remain
- **R1-C6** (language/grammar): All stylistic improvements retained
- **R2-C1 through R2-C5**: All expanded Introduction/Related Work/Architecture clarifications retained

## Deliverables

1. **`IEEE_v2_revised.tex`** -- Complete IEEE-format paper with all reviewer responses, trimmed to fit 6 pages. Uses `IEEEtran` document class, two-column format.
2. **`Response_to_Reviewers_v2.tex`** -- Updated point-by-point response document noting that the ABRS convergence figure was converted to prose and the What-If subsection was condensed into the CRP main text, with page references updated.

## Implementation Order

1. Create `IEEE_v2_revised.tex` -- full paper in IEEE format with all 11 reviewer points addressed, with the 8 cuts applied
2. Create `Response_to_Reviewers_v2.tex` -- formal response document with updated page/section references reflecting the trimmed paper

