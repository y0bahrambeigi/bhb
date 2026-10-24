# Draft Release Notes — BMPOA-FF-SG-DLS v0.1.0

> DRAFT — do not publish as a final release until the controlled 30-run validation gate has passed.

## Overview

This research release adds a feasibility-first constraint-handling framework and a sensitivity-guided discrete local search (SG-DLS) operator to the dissertation steel-truss optimization project.

## Main additions

- penalty-parameter-free feasibility-first comparison;
- family-balanced p-norm constraint aggregation;
- analytical static displacement/stress sensitivities;
- analytical natural-frequency sensitivities;
- near-repeated-mode cluster handling;
- one-step catalog SG-DLS for repair and weight reduction;
- exact structural re-evaluation before every accepted SG-DLS move;
- explicit equal design-evaluation budget accounting;
- sharded paired-seed ablation workflow;
- provenance and checksum generation.

## Controlled comparison

The release validation compares:

- BMPOA-FF-core
- BMPOA-FF-RandomDiscreteLS
- BMPOA-FF-SGDLS

across:

- 72-bar dynamic-discrete benchmark;
- 120-bar dynamic-discrete benchmark;
- paired seeds 2026–2030;
- 35,070 evaluator calls per method/run.

Archived aggregate size: 30 unique runs (complete 2 × 3 × 5 design), as audited in Issue #84.

## Scientific interpretation policy

The release will report:
- feasibility rate;
- final feasible weight statistics;
- FE to first feasible design;
- local-search acceptance diagnostics;
- sensitivity overhead;
- wall-clock runtime;
- modal-cluster diagnostics.

The available five-seed paired results do not establish statistical superiority of SG-DLS.

## Validation status

Current status: **reference execution complete; final release blocked pending scientific gates**.

Authoritative run `39207965973` completed successfully on experiment source `a8d9fc46966842ec56980853a4ee4ab56395a7e0`. Issue #84 records the independent artifact audit. The final output/runtime audit, seed-2030 acceptance diagnosis and independent static/modal derivative validation remain open. No final merge SHA has been frozen.

Publish only after all required gates in Issue #84 are closed, PR #83 is merged, the actual merge SHA is frozen, and reproducibility assets are attached and verified.

## Reproducibility

Final release assets should contain:
- aggregate CSV;
- summary JSON;
- MAT outputs/provenance;
- SHA256SUMS;
- exact source commit SHA;
- execution environment information.

## Known scope limits

- QIO is intentionally excluded from this release's main ablation.
- The current controlled study focuses on the repository's 72-bar and 120-bar dynamic-discrete steel-truss models.
- Equal evaluator calls are enforced; wall-clock cost is reported separately because analytical sensitivities add computational overhead.

## Descriptive results and limitations

The archived-output audit reports all 30 final designs feasible; this is not an independent structural re-evaluation. SG-DLS versus core has two wins, two ties and one loss in each benchmark. Median paired runtime overhead versus core was 16.46% (72-bar) and 3.40% (120-bar), specific to this execution. Equal evaluator-call budgets do not imply equal computational cost.

First-feasible FE=1 is consistent with deterministic feasible midpoint initialization; it does not demonstrate faster infeasibility repair. Current artifacts do not preserve convergence/evaluation histories. The 72-bar seed-2030 acceptance anomaly (25/239) must be resolved, and independent derivative-validation evidence must be attached before final publication.

Release merge SHA: PENDING (record only after merge).
Reproducibility archive and final asset checksums: PENDING.
