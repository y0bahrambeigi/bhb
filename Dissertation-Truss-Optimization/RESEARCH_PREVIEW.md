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

The **software is public and usable as a research preview**.

The five-seed post-correction 120-bar dissertation rerun is still being completed under GitHub Issue #57. Therefore:

- no final superiority claim is made here;
- no pre-correction 120-bar performance result should be cited as final evidence;
- final paired statistical results will be published only after the post-correction publication artifact passes all validation gates.

## Citation

Until a DOI-backed software archive is minted for this research preview, cite the GitHub repository and the exact source commit used in your work.

Suggested citation:

> Bahrambeigi, Y. (2026). *BMPOA Dynamic-Discrete Truss Optimization: Research Preview* [Computer software]. GitHub. Commit 723bdc81d198a7895ce5401c083620c709897307.

## License

Repository code is distributed under the repository MIT License unless a component states otherwise.
