# POA vs POA+LS equal-FE pilot — Python mirror

## Status

This note records an independent Python mirror of the MATLAB benchmark equations and
the proposed equal-FE-budget experiment. It is **pilot evidence only**. The MATLAB/Octave
runner in `RunPOALocalSearchPilot.m` remains the authoritative implementation for the
dissertation record.

Common settings:

- population: 70
- true structural evaluations per run: 35,070
- seeds: 2026, 2027, 2028, 2029, 2030
- penalty coefficient: 1e7
- Levy scale: 0.015
- POA local-search trials: 0
- POA+LS local-search trials: 3
- both variants use the same budget-controlled optimizer implementation
- exploration/exploitation progress is tied to consumed FE budget

## 25-bar discrete grouped sizing

| Seed | POA weight (lb) | POA+LS weight (lb) |
| ---: | ---: | ---: |
| 2026 | 551.037195 | 551.037195 |
| 2027 | 557.803487 | 553.989188 |
| 2028 | 551.037195 | 553.989188 |
| 2029 | 552.346356 | 552.933497 |
| 2030 | 557.803487 | 551.037195 |

All ten runs were feasible and used exactly 35,070 structural evaluations.

| Statistic | POA | POA+LS |
| --- | ---: | ---: |
| Mean weight (lb) | 554.005544 | 552.597253 |
| Median weight (lb) | 552.346356 | 552.933497 |
| Std. dev. (lb) | 3.507985 | 1.487917 |
| Best weight (lb) | 551.037195 | 551.037195 |
| Feasibility rate | 100% | 100% |

Pilot mean improvement from LS: **0.254%**.
Pilot standard-deviation reduction: **57.6%**.
Paired Wilcoxon test with only five seeds: **p = 0.625**.

## 10-bar mixed sizing/topology benchmark

| Seed | POA weight (lb) | POA+LS weight (lb) |
| ---: | ---: | ---: |
| 2026 | 5781.356278 | 5831.441846 |
| 2027 | 6056.877566 | 6070.807791 |
| 2028 | 5644.589841 | 5643.498414 |
| 2029 | 6058.501818 | 5748.934022 |
| 2030 | 5641.775930 | 5642.337381 |

All ten runs were feasible and used exactly 35,070 structural evaluations.

| Statistic | POA | POA+LS |
| --- | ---: | ---: |
| Mean weight (lb) | 5836.620286 | 5787.403891 |
| Median weight (lb) | 5781.356278 | 5748.934022 |
| Std. dev. (lb) | 209.546420 | 177.122925 |
| Feasibility rate | 100% | 100% |

Pilot mean improvement from LS: **0.843%**.
Pilot standard-deviation reduction: **15.5%**.
Paired Wilcoxon test with only five seeds: **p = 1.0**.

## Interpretation

The current local search does not yet support a claim of statistically significant
objective improvement. Its clearest pilot effect is reduced run-to-run variability,
especially on the discrete 25-bar benchmark. The next dissertation-grade test should
use 30 paired seeds and should compare at least:

1. POA
2. POA+LS
3. POA+stagnation restart
4. POA+LS+restart

Only after that ablation should RL be introduced.
