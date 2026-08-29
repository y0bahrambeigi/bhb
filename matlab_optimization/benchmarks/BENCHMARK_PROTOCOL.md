# Dissertation benchmark protocol

This protocol prevents the 10-, 25-, 72-, and 100-bar studies from using
different hidden assumptions. A benchmark may enter the comparative chapter
only after its definition, units, constraints, seeds, and runtime test are
locked in `BenchmarkRegistry.m`.

## Required run record

Every optimization run must export one summary row with these fields:

| Field | Meaning |
| --- | --- |
| `benchmark_id` | `10-bar`, `25-bar`, `72-bar`, or `100-bar` |
| `algorithm` | Exact algorithm and variant name |
| `run_id` | Stable identifier within the experiment |
| `seed` | Random seed used before initialization |
| `n_members` / `n_variables` | Structural and search dimensions |
| `population` / `iterations` | Algorithm budget parameters |
| `n_evaluations` | Actual finite-element evaluations |
| `elapsed_s` | Wall-clock time |
| `objective_weight` | Unpenalized structural weight |
| `penalized_fitness` | Optimizer ranking value |
| `total_violation` | Sum of normalized constraint excesses |
| `stable` / `feasible` | Structural and constraint flags |
| `max_stress_ratio` | Maximum demand-to-allowable stress ratio |
| `max_displacement_ratio` | Maximum displacement-to-limit ratio |
| `best_iteration` | First iteration attaining the final best value |
| `interpreter` | MATLAB/Octave name and version |
| `git_sha` | Exact source revision |

Member-level files must preserve member number, end nodes, group, selected
section, length, stress for every load case, and the governing ratio.

## Comparison rules

1. Use the same finite-element evaluator for every algorithm on a benchmark.
2. Compare algorithms under equal numbers of structural evaluations, not only
   equal iteration counts.
3. Run at least the five registry seeds for pilot comparisons; use 30 or more
   independent seeds for dissertation-level statistical claims.
4. Report objective statistics only for feasible runs. Report feasibility rate
   separately so low-weight infeasible solutions cannot look competitive.
5. Preserve raw runs. Produce summaries in a separate directory or table.
6. Lock the 72- and 100-bar source definitions before implementation. Their
   registry status intentionally blocks premature cross-benchmark claims.

## Current gates

- **10-bar:** evaluator and seeded regression test passed in GNU Octave CI.
- **25-bar:** discrete grouped evaluator and two load cases are implemented;
  CI must pass before benchmark comparisons start.
- **72-bar / 100-bar:** geometry, grouping, load cases, section catalog, and
  published reference result still require an explicit source-lock decision.

## 25-bar definition sources

- Rajeev, S., and Krishnamoorthy, C. S. (1992), *Discrete Optimization of
  Structures Using Genetic Algorithms*.
- Member grouping and the two load cases are cross-checked against the 25-bar
  benchmark tables in: https://www.techno-press.org/download.php?journal=sem&num=6&ordernum=5&volume=92

