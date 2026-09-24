# BMPOA dynamic-discrete post-correction results

**Status:** validated five-seed paired pilot  
**Source geometry/optimizer commit:** `723bdc81d198a7895ce5401c083620c709897307`  
**Publication analysis commit:** `a0ecc4d94e9919f65f7343cc26f066e1f188f041`  
**Issue #57:** closed as completed

## Validation

- 40/40 dissertation-grade post-correction rows validated.
- 72-bar: 20/20 feasible; aggregate violation = 0.
- corrected 120-bar: 20/20 feasible; aggregate violation = 0.
- evaluator calls = 35,070 per run.
- modal solves = 35,070 per run.
- LS/QIO operator coverage verified.
- smoke data excluded.
- pre-correction 120-bar data excluded.
- 120-bar published-reference frequency reproduction: PASS.

## Descriptive results

| Benchmark | Variant | Feasible | Mean weight | Median weight | Sample SD |
|---|---|---:|---:|---:|---:|
| 72-bar | BMPOA-core | 5/5 | 790.599444 | 790.599444 | 0.000000 |
| 72-bar | BMPOA-DiscreteLS | 5/5 | 793.322004 | 790.599444 | 3.728019 |
| 72-bar | BMPOA-QIO | 5/5 | 791.960724 | 790.599444 | 3.043915 |
| 72-bar | BMPOA-DiscreteLS-QIO | 5/5 | 791.960724 | 790.599444 | 3.043915 |
| 120-bar | BMPOA-core | 5/5 | 38496.417609 | 38485.930044 | 14.360690 |
| 120-bar | BMPOA-DiscreteLS | 5/5 | 38500.734371 | 38485.930044 | 33.103483 |
| 120-bar | BMPOA-QIO | 5/5 | 38492.732444 | 38485.930044 | 15.210629 |
| 120-bar | BMPOA-DiscreteLS-QIO | 5/5 | 38528.956961 | 38519.942044 | 45.699619 |

## Paired comparisons versus BMPOA-core

| Benchmark | Variant − core | Mean Δweight | Mean Δ% | Exact sign-test p |
|---|---|---:|---:|---:|
| 72-bar | DiscreteLS | +2.722560 | +0.344367% | 0.500 |
| 72-bar | QIO | +1.361280 | +0.172183% | 1.000 |
| 72-bar | DiscreteLS+QIO | +1.361280 | +0.172183% | 1.000 |
| 120-bar | DiscreteLS | +4.316762 | +0.011209% | 1.000 |
| 120-bar | QIO | -3.685165 | -0.009557% | 1.000 |
| 120-bar | DiscreteLS+QIO | +32.539352 | +0.084537% | 0.625 |

With only five paired seeds, these exact sign tests do **not** establish statistically supported superiority of any variant. The defensible result is reproducible equal-budget feasibility and a conservative paired comparison.
