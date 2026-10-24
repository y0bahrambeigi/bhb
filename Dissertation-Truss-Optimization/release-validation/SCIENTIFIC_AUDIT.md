# Scientific audit — 2026-10-24

## Decision and evidence scope

The historical 30-run dataset is retained unchanged. The exact-evaluator finite-difference validation, re-evaluation of all 30 archived designs, independent reference audit, diagnostic replays, and standalone regression tests passed locally on GNU Octave 8.4.0. CI must repeat the final-head checks before merge/publication.

## Seed 2030 acceptance resolved

The instrumented 72-bar seed-2030 replay reproduced the archived final weight 797.4058437177098 lb, 35,070 evaluator calls, 239 exact local candidates and 25 accepted moves. Seed 2026 reproduced 790.5994437177098 lb and 23/24 acceptance.

All 214 rejections in seed 2030 were frequency-infeasible downward moves in group 13 at a feasible incumbent weight of 804.2122437177098 lb. The candidate weight was 797.4058437177098 lb; predicted maxG was -0.0003861944394841534, but exact frequency maxG was approximately +0.0000613885057632, exceeding feasibility tolerance 1e-6. Stress and displacement remained feasible. The first-order finite-catalog-step prediction therefore passed the 1e-4 ranking safety margin, while exact re-evaluation correctly rejected it. The maximum maxG prediction error was approximately 0.0004475829452478.

The same predicted-safe group reduction was proposed repeatedly while the incumbent remained unchanged. Tiny differences in exact maxG (around machine precision) do not indicate different structural outcomes. The algorithm does not cache/blacklist rejected proposals. This explains the low accepted/attempted ratio: it counts repeated exact trials, not distinct candidate states. No infeasible local-search move was admitted. Exact trial calls remained inside the 35,070 budget.

This is a documented efficiency limitation, not evidence of derivative inaccuracy or statistical superiority. No ranking/acceptance rule is changed for this release. Rejection caching or adaptive safety margins would change the method and require a separately identified ablation.

Evidence: `original-replays/trace-72-bar-2030.csv`, replay JSON/MAT for seeds 2026 and 2030, `evidence/replay-diagnostics.json`, and `verify_replays.py`. Instrumented replay time is supplementary and is never pooled with historical runtime.

## Independent derivative validation

`ValidateSGDLSDerivatives.m` uses the exact structural evaluator with continuous group-area perturbations. It does not reuse the analytical stiffness/mass derivatives or projected perturbation matrices. Fixtures include midpoint, asymmetric and all unique archived final designs for both benchmarks. Every group is perturbed in both signs with three relative step sizes: 1e-3, 1e-4, 1e-5. Both smaller steps pass the fixed absolute 2e-5 plus relative 2e-3 tolerance. There are 3,468 family/group/direction/step checks across those two steps, including constrained modal clusters of size 2. The worst scaled residual is below 0.196 of the allowed tolerance.

The test validates local derivatives, not first-order accuracy across an entire catalog interval. Absolute-value stress/displacement constraints exactly at zero response are nondifferentiable; such rows are explicitly excluded and counted. The test makes no claim of a classical derivative at those kinks. Finite-step frequency rejection is therefore compatible with the local derivative tests passing.

## Structural and descriptive audit

All 30 archived final decision vectors were re-evaluated with the structural evaluator in GNU Octave 8.4.0. Weight agreed within relative 1e-8; maxG agreed within 1e-7; every final design remained feasible with Vp=Vinf=0 and maxG<0. This supplements the earlier archived-output-only audit.

`audit_reference.py` independently checks archive/CSV SHA-256, the ten shards, provenance, exact 2×3×5 coverage, budgets, feasibility outputs, descriptive weight/runtime summaries and exploratory paired sign-flip calculations. No superiority is established by the five-seed comparisons. Median paired runtime overhead versus core is 16.46% for 72-bar and 3.40% for 120-bar in the historical execution. Equal evaluator calls do not imply equal computation cost. FE=1 is consistent with feasible midpoint initialization, not demonstrated infeasibility repair.

## Histories, environment and reproducibility

Historical anytime curves cannot be reconstructed from the archived result tables. This release includes explicitly labelled supplementary SG-DLS convergence histories for the two diagnostic replays, together with the reference weight/runtime figures; no historical 30-run convergence curve is fabricated.

The original artifact, its source snapshot, original preflight log, provenance, checksums, diagnostic logs, MAT histories, scripts and validation outputs are archived. The original log identifies Ubuntu 24.04.5, runner image ubuntu24/20261012.334, GNU Octave 8.4.0-1build5, and OpenBLAS 0.3.26. It does not contain a complete historical hardware/installed-package manifest. That irrecoverable limitation is retained explicitly. The separate validation runtime is identified by its package archives and hashes. Scientific outputs were reproduced; bitwise or wall-clock reproducibility across hardware is not claimed.
