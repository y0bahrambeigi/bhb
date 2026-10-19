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

Expected aggregate size: 30 runs.

## Scientific interpretation policy

The release will report:
- feasibility rate;
- final feasible weight statistics;
- FE to first feasible design;
- local-search acceptance diagnostics;
- sensitivity overhead;
- wall-clock runtime;
- modal-cluster diagnostics.

The release will not claim broad algorithmic superiority unless supported by the complete paired-seed dataset.

## Validation status

Current status: **large-ablation workflow in progress**.

Final release status must be updated only after the aggregate artifact is generated and audited.

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
