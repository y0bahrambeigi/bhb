# IFD Seismic Optimization Framework — v1.0.0-rc1

A source-constrained, reproducible computational framework for coupling an inerter-friction-damper (IFD) model to SDOF/MDOF seismic response analysis and equal-evaluator-budget BMPOA optimization.

## What this release is

This release **is ready for public software/preprint release** as a computational methodology package. It includes:

- nonlinear provisional IFD model plumbing;
- exact effective-mass assembly for the inertance term;
- n-story shear-building response analysis;
- interstory drift, absolute acceleration, device-force, and dissipated-energy metrics;
- real-record CSV ingestion and transparent scalar scaling;
- robust multi-record objective aggregation;
- adapter to the dissertation `BudgetedMemeticPelicanOptimization` API;
- equal-evaluator-budget run protocol;
- source provenance and publication gates;
- independent Python reference implementation and executed QA results.

## What this release does **not** claim

It does **not** claim exact reproduction or experimental validation of Hu et al. (2026), DOI `10.1016/j.soildyn.2026.110650`. The exact source constitutive equations, specimen parameters, experimental curves, and the exact definition of `Rp` are still pending legal access/author-provided data. The MATLAB provisional force law is a software-development benchmark only.

## Quick verification

Python QA (executed for this release):

```bash
python -m pip install -r requirements-qa.txt
cd python_reference
python run_qa.py
```

The generated verification outputs are in `results/qa/` and `figures/qa/`.

MATLAB local tests:

```matlab
cd matlab
addpath(genpath(pwd))
results = runtests('tests');
assertSuccess(results)
```

For the full BMPOA pilot, add `BudgetedMemeticPelicanOptimization.m` from the pinned `y0bahrambeigi/bhb` dissertation code to the MATLAB path, provide lawful waveform CSV files referenced by the record manifest, then run `RunIFDSeismicBMPOAPilot`.

## Decision vector

The current mixed-variable IFD optimization vector is

`x = [story, b, Fc, c]`

where `story` is discrete and the other variables are continuous. QIO is intentionally disabled in this release because the pinned dissertation QIO implementation is restricted to pure-discrete sizing.

## Reproducibility boundary

Synthetic records and the provisional IFD law are used **only** for software verification. Publication-grade seismic-performance claims require the locked real-record suite and experimental/source validation gates described in `PUBLICATION_READINESS_RC1.md`.

## Citation

See `CITATION.cff`. No DOI is invented in this release; add the archive DOI after depositing the tagged release.
