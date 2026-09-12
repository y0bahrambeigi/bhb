# Dissertation benchmark protocol

This protocol prevents the 10-, 25-, 72-, and 120-bar studies from using
different hidden assumptions. A benchmark may enter the comparative chapter
only after its definition, units, constraints, seeds, and runtime test are
locked in `BenchmarkRegistry.m`.

## Required run record

Every optimization run must export one summary row with these fields:

| Field | Meaning |
| --- | --- |
| `benchmark_id` | `10-bar`, `25-bar`, `72-bar`, or `120-bar` |
| `algorithm` | Exact algorithm and variant name |
| `run_id` | Stable identifier within the experiment |
| `seed` | Random seed used before initialization |
| `n_members` / `n_variables` | Structural and search dimensions |
| `population` / `iterations` | Algorithm budget parameters |
| `n_evaluator_calls` | Calls to the benchmark objective/constraint evaluator |
| `n_load_case_solves` | Linear-system solutions across all load cases |
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
2. Compare algorithms under equal `n_evaluator_calls`, not only equal iteration
   counts. Also report `n_load_case_solves`; for example, one 25-bar evaluator
   call covers two load cases and therefore counts as two load-case solves.
3. Run at least the five registry seeds for pilot comparisons; use 30 or more
   independent seeds for dissertation-level statistical claims.
4. Report objective statistics only for feasible runs. Report feasibility rate
   separately so low-weight infeasible solutions cannot look competitive.
5. Preserve raw runs. Produce summaries in a separate directory or table.
6. Treat the registry source citation, geometry, grouping, bounds, loads, and
   constraints as immutable within an experiment series.

## Algorithm identity rule

Algorithm names are scientific identifiers, not presentation labels. The
canonical equal-budget branch uses `BMPOA-core-v1`,
`BMPOA-problem-aware-ls-v1`, `BMPOA-restart-v1`, and
`BMPOA-problem-aware-ls-restart-v1`. Results produced by the separate EPOA runner
in PR #33 must retain an `EPOA-*` identifier and must not be pooled with this
BMPOA experiment. A direct comparison requires the same evaluator, initial
population, random stream, evaluator-call budget, and local-search schedule.

The optimizer returns cached objective, constraint, and response data for the
best design. Experiment runners must not call the structural evaluator again
only to write a result row, because that would create hidden out-of-budget
evaluations.

## Artifact rule

MAT artifacts must be written through `utils/SaveMatV7.m`. The helper forces a
MATLAB-readable v7 binary container and performs an immediate `load` round-trip
check. CSV remains the human-readable companion artifact.

## Current gates

- **10-bar:** evaluator and seeded regression test passed in GNU Octave CI.
- **25-bar:** discrete grouped evaluator and two load cases are implemented;
  CI must pass before benchmark comparisons start.
- **72-bar:** Camp--Farshchin geometry, 16 continuous groups, two load cases,
  0.1--3.0 in^2 bounds, and top-storey displacement controls are implemented.
- **120-bar:** standard 49-node spatial dome, seven continuous groups, AISC ASD
  stress constraints, layer loads, and 0.775--20.0 in^2 bounds are implemented.

## 72- and 120-bar definition sources

- Camp, C. V., and Farshchin, M. (2014), *Design of space trusses using
  modified teaching-learning based optimization*, Engineering Structures
  62--63, 87--97. Reference data:
  https://www.mathworks.com/matlabcentral/fileexchange/76228-optimization-benchmark-truss-problems
- Kao, Y.-T., Hung, Y.-C., and Setiawan, R. (2020), *Two Strategies to Improve
  the Differential Evolution Algorithm for Optimizing Design of Truss
  Structures*, Advances in Civil Engineering, 8741862:
  https://onlinelibrary.wiley.com/doi/10.1155/2020/8741862

## 25-bar definition sources

- Rajeev, S., and Krishnamoorthy, C. S. (1992), *Discrete Optimization of
  Structures Using Genetic Algorithms*.
- Member grouping and the two load cases are cross-checked against the 25-bar
  benchmark tables in: https://www.techno-press.org/download.php?journal=sem&num=6&ordernum=5&volume=92
