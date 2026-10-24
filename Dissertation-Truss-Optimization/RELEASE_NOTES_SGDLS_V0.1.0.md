# BMPOA-FF-SG-DLS v0.1.0 — controlled research release

Adds feasibility-first ranking, family-balanced p-norm aggregation, analytical static/modal sensitivities with modal-cluster handling, and one-step sensitivity-guided discrete local search. Local-search acceptance always requires exact structural re-evaluation.

## Validation and results

The unchanged reference study (run 39207965973; experiment source `a8d9fc46966842ec56980853a4ee4ab56395a7e0`) compares core, RandomDiscreteLS and SGDLS on 72-bar and 120-bar benchmarks using paired seeds 2026–2030: 30 runs, each with exactly 35,070 evaluator calls. The artifact and CSV checksums, complete design, shards and provenance were independently audited. All 30 final designs were structurally re-evaluated and remained feasible.

Independent finite-difference checks validate static and modal sensitivities in both group-area directions at multiple step sizes, including modal clusters of size 2. Nondifferentiable zero-response rows of absolute-value constraints are explicitly excluded and counted. The standalone regression suite and opt-in trace equivalence smoke test pass.

Diagnostic replays reproduce the original final weights and acceptance counts for 72-bar seeds 2026 and 2030. The seed-2030 ratio 25/239 is explained by 214 repeated predicted-safe group-13 reductions that fail the exact frequency constraint. Exact verification correctly rejects these moves. Repeated rejected proposals are a documented efficiency limitation; the ranking/acceptance method is unchanged.

## Interpretation and limits

The five-seed comparisons do not establish statistical superiority of SG-DLS. Versus core, each benchmark has two wins, two ties and one loss. Historical median paired runtime overhead is 16.46% (72-bar) and 3.40% (120-bar). Equal evaluator-call budgets do not imply equal computational cost. FE=1 is consistent with deterministic feasible midpoint initialization and does not demonstrate faster infeasibility repair. QIO and restart are excluded from this reference ablation.

Historical 30-run convergence/evaluation histories were not retained. The supplied anytime plots belong only to separately identified supplementary diagnostic replays and are not pooled into the reference study. Historical runner-image and installation logs are preserved; a complete historical hardware/package manifest was not captured. Wall-clock or bitwise reproducibility across hardware is not claimed.

## Reproducibility and citation

Release commit: `{RELEASE_SHA}`.
Release validation workflow: https://github.com/y0bahrambeigi/bhb/actions/runs/{RELEASE_RUN}

Assets include the unchanged reference artifact, experiment-source snapshot, source/validation bundle, CSV, tables, figures, diagnostics, MAT replay histories, provenance, environment evidence, release manifest and SHA256SUMS. Code: MIT. SG-DLS publication documents and figures: CC BY 4.0. See `CITATION_SGDLS.cff` and `release-validation/SCIENTIFIC_AUDIT.md`.
