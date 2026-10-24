# Independent SG-DLS release validation

From `Dissertation-Truss-Optimization` with GNU Octave 8.4.0:

```sh
python3 release-validation/audit_reference.py release-validation/reference-data/reference.zip release-validation/evidence
octave --no-gui --quiet --eval "addpath('release-validation'); r=ValidateSGDLSDerivatives('release-validation/derivatives'); assert(r.pass); ReevaluateArchivedDesigns('release-validation/structural-reevaluation.csv'); RunProjectTests;"
octave --no-gui --quiet --eval "addpath('release-validation'); ReplaySGDLS(2026,'release-validation/original-replays'); ReplaySGDLS(2030,'release-validation/original-replays');"
python3 release-validation/verify_replays.py
python3 release-validation/plot_results.py
```

Finite-difference tolerances are fixed in the validator: absolute 2e-5 plus relative 2e-3. Both signs of every group-area perturbation are checked at relative steps 1e-3, 1e-4 and 1e-5. Both smaller steps must pass. Fixtures include the feasible midpoint, an asymmetric design and all unique archived final designs in both benchmarks. Cluster size two must be exercised. The oracle is the exact structural evaluator with continuous group-area perturbations, independent of the analytical derivative implementation. Absolute-value stress/displacement constraints at zero response are nondifferentiable; those rows are counted and excluded, never treated as proof of a derivative at a kink.

Trace logging is opt-in through `params.sgdlsTracePath`, consumes no additional evaluations and makes no RNG calls. Replays archive their convergence and evaluation histories separately. They must never be pooled into the historical 30-run CSV. Runtime from instrumented replays is not a replacement for historical runtime.

`reference-preflight.log` preserves historical runner-image and package-install evidence. It is not a full historical hardware/environment manifest. `environment-packages.json` identifies the separate local validation runtime; it must not be mislabelled as the original execution environment. Exact wall-clock reproducibility across hardware is not claimed.
