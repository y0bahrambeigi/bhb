# BMPOA Dynamic-Discrete Truss Optimization — Research Preview

**Release status:** Public research preview  
**Reference source commit:** `723bdc81d198a7895ce5401c083620c709897307`  
**Repository:** https://github.com/y0bahrambeigi/bhb  
**Project path:** `Dissertation-Truss-Optimization/`

## Scope

This research software implements equal-budget discrete steel-truss optimization using the BMPOA family:

- `BMPOA-core`
- `BMPOA-DiscreteLS`
- `BMPOA-QIO`
- `BMPOA-DiscreteLS-QIO`

The dynamic-discrete workflow evaluates structural weight subject to simultaneous static and dynamic constraints and records exact evaluator and modal-solve budgets.

## Benchmarks

The current dynamic-discrete research workflow includes:

- 72-bar steel space truss
- 120-bar spatial dome

The 120-bar dynamic benchmark geometry was corrected to reproduce the published reference geometry and frequencies.

## Reference-reproduction gate

The corrected 120-bar implementation reproduces the published CSS-BBBC reference within the documented tolerance:

- published structural mass: 8892.33 kg
- reproduced structural mass: 8892.328 kg
- reproduced first natural frequency: 9.072411 Hz
- reproduced second natural frequency: 11.037739 Hz

The closest available discrete-catalog reference check produces:

- f1 = 9.007084 Hz
- f2 = 11.083467 Hz

These checks are part of the regression suite.

## Reproducibility contract

- identical evaluator budgets for compared variants;
- evaluator calls and modal solves are counted explicitly;
- deterministic seeded experiments;
- discrete catalog projection is enforced;
- LS/QIO attempt and acceptance counts are exported;
- MAT outputs are written in MATLAB v7-compatible format;
- smoke data are excluded from performance claims;
- pre-correction 120-bar artifacts are diagnostic-only.

## Quick start

From MATLAB or GNU Octave:

```matlab
cd Dissertation-Truss-Optimization
startup
RunProjectTests
RunDynamicDiscretePilot
```

For the dissertation-grade equal-budget workflow, see:

- `benchmarks/DYNAMIC_DISCRETE_PROTOCOL.md`
- `.github/workflows/dynamic-discrete-pilot.yml`

## Publication status

The **post-correction five-seed paired pilot is complete and validated**.

Validation status:
- 40/40 dissertation-grade rows complete;
- 72-bar: 20/20 feasible, aggregate violation = 0;
- corrected 120-bar: 20/20 feasible, aggregate violation = 0;
- exact evaluator budget = 35,070 per run;
- exact modal-solve budget = 35,070 per run;
- DiscreteLS/QIO operator coverage verified;
- reference-frequency reproduction gate = PASS;
- Issue #57 = CLOSED as completed;
- smoke data excluded from performance claims;
- pre-correction 120-bar artifacts excluded from performance claims.

Five paired seeds constitute a pilot-scale sample, so the statistical interpretation remains deliberately conservative. Exact two-sided sign tests do not support a claim of statistically established superiority for any BMPOA variant in this five-seed dataset.

The publication-safe analysis utilities are now merged on `main` in commit `a0ecc4d94e9919f65f7343cc26f066e1f188f041`.

## Citation

Until a DOI-backed software archive is minted for this research preview, cite the GitHub repository and the exact source commit used in your work.

Suggested citation:

> Bahrambeigi, Y. (2026). *BMPOA Dynamic-Discrete Truss Optimization: Research Preview* [Computer software]. GitHub. Commit 723bdc81d198a7895ce5401c083620c709897307.

## License

Repository code is distributed under the repository MIT License unless a component states otherwise.
