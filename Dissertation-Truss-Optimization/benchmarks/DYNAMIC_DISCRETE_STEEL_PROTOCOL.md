# Discrete steel trusses with simultaneous static and frequency constraints

This experiment is deliberately separated from the repository's source-locked continuous 72-bar and 120-bar benchmarks.

## Scientific question

Does adding a discrete quadratic-interpolation refinement operator to BMPOA improve catalog-constrained steel-truss sizing when **stress, displacement, and natural-frequency constraints are enforced simultaneously**, under an exactly equal evaluator budget?

## Dynamic model

The modal evaluator solves

```text
(K(x) - omega^2 M(x)) phi = 0
f = omega / (2*pi)
```

with a consistent translational truss mass matrix

```text
Me = rho*A*L/(6*g) * [2I I; I 2I]
```

plus non-structural nodal masses.

### 72-bar extension

- repository geometry/grouping: existing 72-bar source-locked model;
- material for this extension: structural steel, E = 29e6 psi, weight density = 0.2836 lb/in^3;
- catalog: 0.1 to 3.0 in^2 in 0.1 in^2 increments;
- static constraints: |stress| <= 25 ksi, top-storey displacement <= 0.25 in;
- lumped mass: 2270 kg at each of the four top nodes (17:20 in repository numbering);
- frequency constraints: f1 >= 4 Hz, f2 >= 4 Hz, f3 >= 6 Hz.

This is a **steel extension**, not a claim that the canonical 72-bar dynamic benchmark itself is steel.

### 120-bar dome

- repository geometry/grouping and steel properties retained;
- controlled discrete catalog: 0.775 in^2 plus 1.0:0.25:20.0 in^2;
- static constraints: existing AISC-ASD stress formulation and 0.1969 in displacement limit;
- lumped masses: 3000 kg at node 1, 500 kg at nodes 2:13, 100 kg at nodes 14:37;
- frequency constraints: f1 >= 9 Hz and f2 >= 11 Hz.

The area catalogs are controlled algorithmic catalogs. They must not be described as a specific AISC shape library.

## Equal-budget variants

1. BMPOA-core
2. BMPOA + one-step discrete local search
3. BMPOA + coordinate-wise QIO
4. BMPOA + discrete local search + QIO

Every candidate evaluation includes the complete static and modal analysis and consumes one evaluator call. QIO and local-search calls therefore compete for the same finite evaluator budget; no variant receives extra FE/modal evaluations.

## QIO operator

For one randomly selected design coordinate, the operator fits a parabola through three population points using their penalized fitness and proposes its vertex. Degenerate interpolation falls back to a one-catalog-step move. The candidate is projected immediately to a valid catalog index before evaluation.

## Default dissertation pilot

`RunDynamicDiscretePilot` uses seeds 2026:2030 and 35,070 evaluator calls per run. The script writes CSV and MATLAB-v7 artifacts under `results/dynamic-discrete/`.

Before interpreting dissertation-level conclusions, run at least the locked five-seed pilot and then a larger paired-seed study if the pilot is stable.
