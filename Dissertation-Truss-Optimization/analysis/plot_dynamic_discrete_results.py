#!/usr/bin/env python3
"""Generate publication-safe plots from the validated final 40-run BMPOA CSV.

The plotting rules intentionally keep feasibility separate from objective weight:
- infeasible runs are not plotted as comparable weight outcomes;
- constraint violation is shown separately;
- smoke data are not accepted because the validator requires the final 40-row schema.
"""

from __future__ import annotations

import argparse
import math
from pathlib import Path

import matplotlib.pyplot as plt

from analyze_dynamic_discrete_results import (
    EXPECTED_ALGORITHMS,
    EXPECTED_BENCHMARKS,
    EXPECTED_SEEDS,
    load_and_validate,
)


SHORT = {
    "BMPOA-core": "Core",
    "BMPOA-DiscreteLS": "DiscreteLS",
    "BMPOA-QIO": "QIO",
    "BMPOA-DiscreteLS-QIO": "LS+QIO",
}


def slug(benchmark: str) -> str:
    return benchmark.replace("-steel-dynamic-discrete", "")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("csv_path", type=Path)
    parser.add_argument("--outdir", type=Path, default=Path("publication-analysis/figures"))
    args = parser.parse_args()

    rows = load_and_validate(args.csv_path)
    args.outdir.mkdir(parents=True, exist_ok=True)

    idx = {
        (r["benchmark"], r["algorithm"], r["seed"]): r
        for r in rows
    }

    # Figure 1: feasibility rate by benchmark and algorithm.
    fig, ax = plt.subplots(figsize=(9, 5.2))
    x = list(range(len(EXPECTED_ALGORITHMS)))
    width = 0.36
    for bi, benchmark in enumerate(EXPECTED_BENCHMARKS):
        vals = []
        for alg in EXPECTED_ALGORITHMS:
            feasible = sum(
                idx[(benchmark, alg, seed)]["feasible"] == 1
                for seed in EXPECTED_SEEDS
            )
            vals.append(100.0 * feasible / len(EXPECTED_SEEDS))
        offsets = [v + (bi - 0.5) * width for v in x]
        ax.bar(offsets, vals, width=width, label=slug(benchmark))
    ax.set_xticks(x)
    ax.set_xticklabels([SHORT[a] for a in EXPECTED_ALGORITHMS])
    ax.set_ylabel("Feasible runs (%)")
    ax.set_ylim(0, 105)
    ax.set_title("Feasibility across five paired seeds")
    ax.legend()
    fig.tight_layout()
    fig.savefig(args.outdir / "feasibility_rate.png", dpi=220)
    plt.close(fig)

    # Per-benchmark figures: feasible objective weight and violation.
    for benchmark in EXPECTED_BENCHMARKS:
        # Feasible weight only.
        fig, ax = plt.subplots(figsize=(9, 5.2))
        plotted = False
        for alg in EXPECTED_ALGORITHMS:
            ys = []
            for seed in EXPECTED_SEEDS:
                r = idx[(benchmark, alg, seed)]
                ys.append(r["weight"] if r["feasible"] == 1 else math.nan)
            if any(math.isfinite(y) for y in ys):
                ax.plot(EXPECTED_SEEDS, ys, marker="o", label=SHORT[alg])
                plotted = True
        ax.set_xlabel("Seed")
        ax.set_ylabel("Objective weight (feasible runs only)")
        ax.set_title(f"{slug(benchmark)}: paired feasible objective weight")
        ax.set_xticks(EXPECTED_SEEDS)
        if plotted:
            ax.legend()
        fig.tight_layout()
        fig.savefig(args.outdir / f"{slug(benchmark)}_feasible_weight.png", dpi=220)
        plt.close(fig)

        # Constraint violation for all runs.
        fig, ax = plt.subplots(figsize=(9, 5.2))
        for alg in EXPECTED_ALGORITHMS:
            ys = [idx[(benchmark, alg, seed)]["violation"] for seed in EXPECTED_SEEDS]
            ax.plot(EXPECTED_SEEDS, ys, marker="o", label=SHORT[alg])
        ax.set_xlabel("Seed")
        ax.set_ylabel("Constraint violation")
        ax.set_title(f"{slug(benchmark)}: paired constraint violation")
        ax.set_xticks(EXPECTED_SEEDS)
        ax.legend()
        fig.tight_layout()
        fig.savefig(args.outdir / f"{slug(benchmark)}_violation.png", dpi=220)
        plt.close(fig)

    print(f"Figures written to: {args.outdir}")


if __name__ == "__main__":
    main()
