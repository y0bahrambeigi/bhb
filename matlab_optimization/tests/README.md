# Runtime validation for PR #5

This directory contains the regression checks for the Enhanced Pelican size/topology workflow and the `TenBarTrussTopology` structural evaluator.

## Run in MATLAB

From `matlab_optimization/`:

```matlab
addpath('tests');
TestTenBarTrussTopology
```

A successful run ends with:

```text
All TenBarTrussTopology regression tests PASSED.
```

## What is validated

The test suite checks:

- a stable, feasible all-member 10-bar baseline;
- deterministic rejection of a fully deleted/singular topology without a failed solve;
- inactive members having exactly zero area, zero recovered stress, and zero stress ratio;
- topology threshold behavior (`z < 0.5` inactive, `z >= 0.5` active);
- the minimum-six-active-members penalty;
- consistency of stress/displacement violations and the feasibility flag;
- optimizer decision bounds and finite results;
- non-increasing best-so-far convergence history;
- consistency of penalized fitness with `objective + penaltyCoef * violation`; and
- reproducible optimizer output after resetting `rng(2026, 'twister')`.

## Release gate

PR #5 should remain **runtime validation pending** until this test passes in a recorded MATLAB environment. If GNU Octave is also claimed as supported, run the same test there and record the Octave version; reporting functions in `RunPelicanTrussTopology.m` should also be checked separately for Octave compatibility.

For reproducibility, record the interpreter version, operating system, PR head commit, and the final best solution/fitness when performing release validation.
