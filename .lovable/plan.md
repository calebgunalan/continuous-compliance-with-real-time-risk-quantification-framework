
# Plan: ICICV 2026 Presentation — CC-RRQ Framework

## Deliverables (in `/mnt/documents/`)

1. **`CC-RRQ_ICICV2026.pptx`** — 13-slide deck, Midnight Executive theme (navy `#1E2761` + ice blue `#CADCFC` + white accent), built with `pptxgenjs`. Speaker notes embedded on every slide via `slide.addNotes(...)` for PowerPoint Presenter View.
2. **`CC-RRQ_ICICV2026_SpeakerNotes.md`** — standalone printable script mirroring the embedded notes, with per-slide timing.

## Source discipline

- Every fact, number, formula, and quote is taken **only** from `Camera_Ready_Paper.pdf` (parsed). No external content, no fabricated stats.
- Authors, affiliations, abstract, the 5 algorithms, all empirical numbers (r = -0.741, p = 0.001, 87.4 days → 3.2 hours, 62.3% ALE reduction, 63 orgs, 87% anomaly confirmation, β₁ = -0.68, Table III/IV/V values) come verbatim from the paper.

## Slide outline (13 slides ≈ 10 min, ~45s each)

1. **Title** — Paper title, three authors with affiliations, ICICV 2026 venue/date footer.
2. **The Problem** — CISO budget gap; FAIR is static, control tests are binary; "compliance data ≫ quantified risk."
3. **Research Gap & Contribution** — Bridge static risk ↔ dynamic compliance; list the 5 named contributions (CEI, CRP, ABRS, TRVA, LLM-CAD) as a clean 5-card grid.
4. **CC-RRQ Architecture** — 4-layer diagram (Evidence Collection → Control Testing → Risk Quantification → Decision Support) drawn with pptxgenjs shapes.
5. **Algorithm 1 — CEI** — Shannon entropy formula, Ordered/Transitional/Chaotic zones (<0.30, 0.30–0.70, ≥0.70).
6. **Algorithm 2 — CRP** — DAG cascade intuition + What-If (ΔΦ > 0.1 = materially affected).
7. **Algorithm 3 — ABRS** — Beta-Bernoulli update on FAIR; Table I industry priors (Financial 3/47, Healthcare 4/46, Tech 2/48, Mfg 3/47, Retail 5/45).
8. **Algorithm 4 — TRVA** — Velocity / acceleration / momentum score M with classification.
9. **Algorithm 5 — LLM-CAD** — Anomaly detection for compliance gaming.
10. **Empirical Study Design** — 63 orgs, 4 industries, 12 months; maturity model Pr(breach|m) = θ₀ e^(-κm).
11. **Headline Results** — Big-stat callouts: r = -0.741 (p = 0.001) · 87.4 d → 3.2 h detection · 62.3% ALE reduction (L2→L4) · 87% LLM-CAD precision (41/47).
12. **Maturity Evidence + Robustness** — Table IV summary (pass-rate, breaches, ALE per maturity level) and multivariate regression (β₁ = -0.68, p < 0.001, only 4.5% attenuation) addressing confounders.
13. **Conclusion & Q&A** — Recap of the 5 contributions, limitations stated in the paper (observational design, exponential model edge cases, LLM opacity, benchmark loss data, 12-month window), thank-you + contact email.

## Visual system

- Dark navy backgrounds for slides 1, 4, 11, 13 (sandwich); light slides for content; one accent color (ice blue) for emphasis only.
- Header font: Cambria; body font: Calibri. Title 40pt, section headers 24pt, body 16–18pt, big-stat callouts 60pt.
- Formulas rendered as crisp text (LaTeX-style typeset), not images.
- Tables redrawn natively in pptxgenjs with DXA-equivalent widths and CLEAR shading.

## Speaker notes

- ~90–110 words per slide → ~10 minutes total at conference pace.
- Each note: (a) what to say, (b) the specific number/term to emphasize, (c) transition cue to next slide.
- Embedded in the .pptx via `slide.addNotes()` so they appear in PowerPoint's Presenter View.

## QA (mandatory, per skill rules)

1. Render with `pptxgenjs` → convert to PDF via LibreOffice → `pdftoppm` to JPGs.
2. Inspect every slide image for overflow, overlap, contrast, leftover placeholders.
3. `python -m markitdown` to verify text content matches paper and notes are present.
4. Iterate until clean; report findings.

## Out of scope

- No changes to the React app codebase.
- No new figures invented beyond what the paper supports (architecture diagram is a faithful redraw of the described 4-layer system).
