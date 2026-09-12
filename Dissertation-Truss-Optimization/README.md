# Dissertation Truss Optimization

پروژهٔ مستقل MATLAB/Octave برای پژوهش رساله در زمینهٔ بهینه‌سازی اندازهٔ
مقاطع خرپا با بودجهٔ ارزیابی یکسان و نتایج قابل‌بازتولید.

Standalone MATLAB/Octave research project for reproducible truss sizing and
topology-optimization experiments under equal evaluator-call budgets.

## Benchmarks

| Benchmark | Model | Variables | Load cases | Bounds / sections |
| --- | --- | ---: | ---: | --- |
| 10-bar | 2D sizing + binary topology | 20 | 1 | continuous area + topology |
| 25-bar | 3D discrete grouped sizing | 8 | 2 | 30-section catalog |
| 72-bar | Camp–Farshchin 3D sizing | 16 | 2 | continuous, 0.1–3.0 in² |
| 120-bar | standard spatial dome | 7 | 1 | continuous, 0.775–20.0 in² |

The former undefined 100-bar placeholder has been replaced by the standard
49-node, 120-member spatial dome. Its stress evaluator includes the AISC ASD
tension and compression allowables used by the benchmark literature.

## Quick start

From MATLAB or GNU Octave:

```matlab
cd Dissertation-Truss-Optimization
startup
RunBenchmarkSmoke
RunProjectTests
```

Run a dissertation-grade 30-seed experiment for one benchmark:

```matlab
RunPOARestartAblation30('72-bar')
RunPOARestartAblation30('120-bar')
```

Use `RunPOARestartAblation30('all')` only when the full four-benchmark run is
intended; it performs a large number of structural evaluations.

## Reproducibility contract

- Every algorithm uses the same structural evaluator for a given benchmark.
- Search budgets count objective/constraint evaluator calls.
- Load-case linear solves are reported separately.
- Best-response data are cached; result export does not add a hidden FE call.
- MAT artifacts are forced to MATLAB v7 format and round-trip checked.
- `BMPOA-*` and the separate `EPOA-*` implementation are distinct scientific
  identities and their results must not be pooled.

See `benchmarks/BENCHMARK_PROTOCOL.md` for the complete reporting contract.

## Layout

```text
algorithms/   optimization algorithms
benchmarks/   registry, protocol, and pilot notes
problems/     four finite-element benchmark evaluators
surrogate/    reproducible surrogate-dataset generator
tests/        regression and reproducibility tests
utils/        plotting and portable MAT-output helpers
```

## Definition sources

- Camp, C. V., and Farshchin, M. (2014), *Design of space trusses using
  modified teaching-learning based optimization*, Engineering Structures
  62–63, 87–97.
- Kao, Y.-T., Hung, Y.-C., and Setiawan, R. (2020), *Two Strategies to Improve
  the Differential Evolution Algorithm for Optimizing Design of Truss
  Structures*, Advances in Civil Engineering, Article 8741862.

## Author

Yousef Bahrambeigi — PhD research in Civil Engineering (Structures).
