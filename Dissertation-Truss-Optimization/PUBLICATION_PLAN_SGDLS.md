# SG-DLS Publication Plan

## Scope

This document defines the publication path for the feasibility-first BMPOA + sensitivity-guided discrete local search extension for dynamic discrete steel-truss sizing.

Current development PR: #83

Current validated branch:
`feat/sgdls-feasibility-first-2026-10-19`

Large-ablation workflow:
`SG-DLS full 30-run ablation`

## Publication gates

### Gate 1 — Code and regression validation

Required:
- standalone dissertation project regression suite passes;
- dynamic-discrete baseline regression passes;
- feasibility-first preflight passes;
- analytical static/modal sensitivity preflight passes;
- short three-variant smoke accounting passes.

Status: **PASSED** on the current branch after Octave-compatibility fixes.

### Gate 2 — Full 30-run controlled ablation

Required design:
- 2 benchmarks: 72-bar and 120-bar;
- 3 methods:
  - BMPOA-FF-core
  - BMPOA-FF-RandomDiscreteLS
  - BMPOA-FF-SGDLS
- 5 paired seeds: 2026–2030;
- 35,070 evaluator calls for every method/run;
- p-norm baseline: p = 4;
- restart disabled;
- QIO disabled;
- total expected result rows: 30.

Release cannot proceed unless:
- all 30 rows are present;
- all 30 rows report exactly 35,070 evaluator calls;
- no benchmark/method/seed combination is missing or duplicated;
- final aggregate artifact and SHA-256 checksum are produced.

Status: **COMPLETE for the authoritative run 39207965973**. All ten shards and aggregation succeeded. Issue #84 records the independent 2026-10-22 artifact audit: 30 unique rows, exactly 35,070 evaluator calls each, and verified aggregate checksums. This does not close the scientific-audit gate.

### Gate 3 — Scientific result audit

Before merge/release, inspect:
- feasibility rate per benchmark/method;
- median and mean feasible final weight;
- median FE to first feasible design;
- SG-DLS attempt and acceptance counts;
- sensitivity-call count;
- modal-cluster diagnostics;
- runtime overhead;
- any failed or anomalous runs.

No superiority claim is allowed from only the single best run.

### Gate 4 — Reproducibility freeze

Once Gate 3 passes:
- preserve experiment source SHA `a8d9fc46966842ec56980853a4ee4ab56395a7e0`; defer the actual merge SHA until after Gate 5;
- freeze benchmark definitions and algorithm parameters;
- archive CSV and MAT outputs;
- archive provenance metadata;
- record Octave/MATLAB versions;
- keep SHA-256 checksums for the aggregated dataset.

### Gate 5 — Merge

PR #83 may be marked ready for review and merged only after:
- the 30-run workflow succeeds;
- the aggregate dataset is verified;
- no unresolved regression or sensitivity anomaly remains.

Preferred merge method: squash merge unless repository policy requires otherwise.

After merge, record and verify the actual merge SHA and the relevant merged-source checks. Do not use an open PR's synthetic merge commit as the release identity.

### Gate 6 — Version tag and GitHub release

Proposed release identifier:

`sgdls-v0.1.0`

Suggested release title:

`BMPOA-FF-SG-DLS v0.1.0 — controlled dissertation research release`

Release should include:
- source commit SHA;
- scientific-method document;
- aggregate 30-run CSV;
- summary JSON;
- SHA256SUMS;
- MAT result artifacts or a reproducibility archive;
- clear validation status;
- explicit note that equal evaluator budget does not imply equal wall-clock computational cost.

### Gate 7 — Research package

After the GitHub release:
- generate publication tables;
- generate convergence/anytime plots;
- prepare paired-seed statistical analysis;
- document effect sizes and uncertainty;
- prepare a dissertation-ready methods/results subsection;
- only then consider DOI/archive deposition.

## Claim policy

Permitted wording before the full audit:

> A feasibility-first BMPOA extension with analytical sensitivity-guided discrete local search has been implemented and is undergoing controlled equal-design-evaluation validation.

Not permitted before the full audit:

> SG-DLS is superior to BMPOA.

or

> This is the first sensitivity-guided truss optimization method.

## QIO scope

QIO remains outside the current main ablation because the repository's existing QIO operator constructs proposals from scalar penalized fitness. A QIO extension requires a separately specified interpolation merit function and a separate ablation to avoid confounding.

## Final publication checklist

- [x] Branch created
- [x] Draft PR opened
- [x] Feasibility-first implementation published
- [x] Analytical sensitivity implementation published
- [x] SG-DLS implementation published
- [x] Preflight validation passed
- [x] Sharded 30-run workflow launched
- [x] All 10 shards complete
- [x] 30-row aggregate verified
- [x] SHA-256 checksum verified
- [ ] Statistical/diagnostic audit complete
- [ ] PR marked ready
- [ ] PR merged
- [ ] Version tag created
- [ ] GitHub release published
- [ ] Reproducibility package archived

## Release readiness — 2026-10-24

Status: **BLOCKED pending scientific validation**. The 30-run execution is complete; release is not complete.

Remaining evidence:
- final feasibility/weight/first-feasible-FE/runtime audit sign-off;
- documented explanation of 72-bar seed 2030 SG-DLS acceptance (25/239);
- independent static/modal derivative checks in both catalog directions, including repeated/near-repeated modes;
- no unresolved scientific anomaly;
- explicit resolution of the missing convergence/evaluation-history deliverable;
- final-head review/checks, merge, actual merge SHA freeze;
- complete reproducibility archive, environment evidence, checksums, tag and release.

The archived study does not establish SG-DLS statistical superiority. FE=1 is consistent with deterministic feasible midpoint initialization. Report equal evaluator-call budgets separately from runtime and sensitivity overhead. Do not mix diagnostic reruns or duplicate workflows into the authoritative dataset.

Historical convergence plots cannot be reconstructed from the current MAT result tables. If retained as a release requirement, use a separately identified history-logging run; otherwise explicitly document the scope change in Issue #84.
