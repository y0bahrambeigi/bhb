#!/usr/bin/env python3
"""Validate and summarize the final 40-run dynamic-discrete BMPOA publication CSV.

This script is intentionally conservative:
- it refuses partial datasets;
- it verifies exact evaluator/modal budgets;
- it separates feasibility from weight comparisons;
- it reports paired differences only on seed-matched observations;
- it uses an exact two-sided sign test (small-n, nonparametric) without
  claiming broad superiority from five seeds.

Usage:
    python analysis/analyze_dynamic_discrete_results.py \
        publication-package/dynamic_discrete_equal_budget_35070_all40.csv \
        --manifest publication-package/manifest.json \
        --expected-source-commit 723bdc81d198a7895ce5401c083620c709897307 \
        --outdir publication-package/analysis
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import statistics
from collections import defaultdict
from pathlib import Path

EXPECTED_BENCHMARKS = [
    "72-bar-steel-dynamic-discrete",
    "120-bar-steel-dynamic-discrete",
]
EXPECTED_ALGORITHMS = [
    "BMPOA-core",
    "BMPOA-DiscreteLS",
    "BMPOA-QIO",
    "BMPOA-DiscreteLS-QIO",
]
EXPECTED_SEEDS = [2026, 2027, 2028, 2029, 2030]
EXPECTED_BUDGET = 35070
PRE_CORRECTION_COMMIT = "44c9b9a3ef7c7229e8a6d4dbee7b1785058ea465"


def _mean(xs):
    return statistics.mean(xs) if xs else None


def _median(xs):
    return statistics.median(xs) if xs else None


def _stdev(xs):
    return statistics.stdev(xs) if len(xs) >= 2 else None


def _sign_test_two_sided(differences):
    """Exact two-sided sign test, ignoring zero differences."""
    nonzero = [d for d in differences if d != 0]
    n = len(nonzero)
    if n == 0:
        return {"n_nonzero": 0, "positive": 0, "negative": 0, "p_exact": 1.0}
    positive = sum(d > 0 for d in nonzero)
    negative = n - positive
    k = min(positive, negative)
    tail = sum(math.comb(n, i) for i in range(k + 1)) / (2 ** n)
    p = min(1.0, 2.0 * tail)
    return {
        "n_nonzero": n,
        "positive": positive,
        "negative": negative,
        "p_exact": p,
    }


def validate_manifest(manifest_path: Path, expected_source_commit: str):
    """Require the final publication package to come from the intended corrected commit."""
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    source_commit = str(manifest.get("source_commit", "")).strip()
    validated_rows = int(manifest.get("validated_rows", 0))
    expected_rows = int(manifest.get("expected_rows", 0))
    budget = int(manifest.get("evaluator_budget_per_run", 0))

    if not source_commit:
        raise SystemExit("Manifest is missing source_commit.")
    if source_commit == PRE_CORRECTION_COMMIT:
        raise SystemExit(
            "Refusing pre-correction 120-bar publication package from "
            f"{PRE_CORRECTION_COMMIT}."
        )
    if source_commit != expected_source_commit:
        raise SystemExit(
            f"Source commit mismatch: manifest={source_commit}, "
            f"expected={expected_source_commit}"
        )
    if validated_rows != 40 or expected_rows != 40:
        raise SystemExit(
            f"Manifest row-count gate failed: validated={validated_rows}, "
            f"expected={expected_rows}"
        )
    if budget != EXPECTED_BUDGET:
        raise SystemExit(
            f"Manifest budget mismatch: {budget} != {EXPECTED_BUDGET}"
        )
    return manifest


def load_and_validate(path: Path):
    with path.open(newline="", encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh))

    expected = {
        (b, a, s)
        for b in EXPECTED_BENCHMARKS
        for a in EXPECTED_ALGORITHMS
        for s in EXPECTED_SEEDS
    }
    actual = {
        (r["benchmark"], r["algorithm"], int(r["seed"]))
        for r in rows
    }

    if len(rows) != 40:
        raise SystemExit(f"Refusing partial dataset: expected 40 rows, found {len(rows)}")
    if actual != expected:
        missing = sorted(expected - actual)
        extra = sorted(actual - expected)
        raise SystemExit(f"Pairing mismatch. Missing={missing}; extra={extra}")

    for r in rows:
        if int(r["evaluator_calls"]) != EXPECTED_BUDGET:
            raise SystemExit(f"Evaluator budget mismatch: {r}")
        if int(r["modal_solves"]) != EXPECTED_BUDGET:
            raise SystemExit(f"Modal budget mismatch: {r}")

        alg = r["algorithm"]
        ls = int(r["local_search_attempts"])
        qio = int(r["qio_attempts"])
        if ("DiscreteLS" in alg) != (ls > 0):
            raise SystemExit(f"DiscreteLS coverage mismatch: {r}")
        if ("QIO" in alg) != (qio > 0):
            raise SystemExit(f"QIO coverage mismatch: {r}")

        r["seed"] = int(r["seed"])
        r["weight"] = float(r["weight"])
        r["violation"] = float(r["violation"])
        r["feasible"] = int(r["feasible"])
        r["penalized_fitness"] = float(r["penalized_fitness"])

    return rows


def summarize(rows):
    grouped = defaultdict(list)
    for r in rows:
        grouped[(r["benchmark"], r["algorithm"])].append(r)

    summaries = []
    for benchmark in EXPECTED_BENCHMARKS:
        for algorithm in EXPECTED_ALGORITHMS:
            rs = sorted(grouped[(benchmark, algorithm)], key=lambda r: r["seed"])
            feasible = [r for r in rs if r["feasible"] == 1]
            weights = [r["weight"] for r in feasible]
            violations = [r["violation"] for r in rs]
            summaries.append({
                "benchmark": benchmark,
                "algorithm": algorithm,
                "n": len(rs),
                "feasible_count": len(feasible),
                "feasible_rate": len(feasible) / len(rs),
                "mean_weight_feasible": _mean(weights),
                "median_weight_feasible": _median(weights),
                "sd_weight_feasible": _stdev(weights),
                "best_weight_feasible": min(weights) if weights else None,
                "mean_violation": _mean(violations),
                "median_violation": _median(violations),
                "max_violation": max(violations),
            })
    return summaries


def paired_against_core(rows):
    index = {
        (r["benchmark"], r["algorithm"], r["seed"]): r
        for r in rows
    }
    out = []

    for benchmark in EXPECTED_BENCHMARKS:
        for algorithm in EXPECTED_ALGORITHMS[1:]:
            weight_deltas = []
            violation_deltas = []
            weight_pairs = []

            for seed in EXPECTED_SEEDS:
                core = index[(benchmark, "BMPOA-core", seed)]
                var = index[(benchmark, algorithm, seed)]
                violation_deltas.append(var["violation"] - core["violation"])

                if core["feasible"] == 1 and var["feasible"] == 1:
                    d = var["weight"] - core["weight"]
                    weight_deltas.append(d)
                    weight_pairs.append(seed)

            weight_test = _sign_test_two_sided(weight_deltas)
            violation_test = _sign_test_two_sided(violation_deltas)

            out.append({
                "benchmark": benchmark,
                "comparison": f"{algorithm} - BMPOA-core",
                "weight_pair_seeds": weight_pairs,
                "n_feasible_weight_pairs": len(weight_deltas),
                "mean_delta_weight": _mean(weight_deltas),
                "median_delta_weight": _median(weight_deltas),
                "weight_sign_test": weight_test,
                "mean_delta_violation": _mean(violation_deltas),
                "median_delta_violation": _median(violation_deltas),
                "violation_sign_test": violation_test,
            })
    return out


def write_csv(path: Path, rows):
    if not rows:
        return
    with path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def fmt(x):
    if x is None:
        return "NA"
    if isinstance(x, float):
        return f"{x:.6g}"
    return str(x)


def make_markdown(summaries, paired):
    lines = []
    lines.append("# Dynamic-discrete BMPOA publication summary")
    lines.append("")
    lines.append("Validated input: 40/40 paired runs; exact evaluator and modal budget = 35,070 per run.")
    lines.append("")
    lines.append("## Descriptive summary")
    lines.append("")
    lines.append("| Benchmark | Algorithm | Feasible | Mean feasible weight | Median feasible weight | Mean violation |")
    lines.append("|---|---|---:|---:|---:|---:|")
    for r in summaries:
        lines.append(
            f"| {r['benchmark']} | {r['algorithm']} | "
            f"{r['feasible_count']}/{r['n']} | "
            f"{fmt(r['mean_weight_feasible'])} | "
            f"{fmt(r['median_weight_feasible'])} | "
            f"{fmt(r['mean_violation'])} |"
        )

    lines.append("")
    lines.append("## Paired comparisons versus BMPOA-core")
    lines.append("")
    lines.append("Weight differences are variant minus core and are reported only when both paired runs are feasible. Violation differences use all paired seeds.")
    lines.append("")
    lines.append("| Benchmark | Comparison | Feasible weight pairs | Mean Δ weight | Median Δ weight | Exact sign-test p (weight) | Mean Δ violation | Exact sign-test p (violation) |")
    lines.append("|---|---|---:|---:|---:|---:|---:|---:|")
    for r in paired:
        lines.append(
            f"| {r['benchmark']} | {r['comparison']} | "
            f"{r['n_feasible_weight_pairs']} | "
            f"{fmt(r['mean_delta_weight'])} | "
            f"{fmt(r['median_delta_weight'])} | "
            f"{fmt(r['weight_sign_test']['p_exact'])} | "
            f"{fmt(r['mean_delta_violation'])} | "
            f"{fmt(r['violation_sign_test']['p_exact'])} |"
        )

    lines.append("")
    lines.append("## Interpretation guardrails")
    lines.append("")
    lines.append("- Five seeds are a pilot-scale paired sample; treat inferential results as limited evidence.")
    lines.append("- Do not compare raw weights across infeasible and feasible designs as if they were equivalent outcomes.")
    lines.append("- Smoke-run results are excluded from all performance claims.")
    lines.append("- Exact equal-budget accounting is a prerequisite for every reported comparison.")
    lines.append("")
    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("csv_path", type=Path)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--expected-source-commit", required=True)
    parser.add_argument("--outdir", type=Path, default=Path("publication-analysis"))
    args = parser.parse_args()

    manifest = validate_manifest(args.manifest, args.expected_source_commit)
    rows = load_and_validate(args.csv_path)
    summaries = summarize(rows)
    paired = paired_against_core(rows)

    args.outdir.mkdir(parents=True, exist_ok=True)
    write_csv(args.outdir / "summary_by_benchmark_algorithm.csv", summaries)

    paired_flat = []
    for r in paired:
        paired_flat.append({
            "benchmark": r["benchmark"],
            "comparison": r["comparison"],
            "weight_pair_seeds": ";".join(map(str, r["weight_pair_seeds"])),
            "n_feasible_weight_pairs": r["n_feasible_weight_pairs"],
            "mean_delta_weight": r["mean_delta_weight"],
            "median_delta_weight": r["median_delta_weight"],
            "weight_sign_p_exact": r["weight_sign_test"]["p_exact"],
            "mean_delta_violation": r["mean_delta_violation"],
            "median_delta_violation": r["median_delta_violation"],
            "violation_sign_p_exact": r["violation_sign_test"]["p_exact"],
        })
    write_csv(args.outdir / "paired_vs_core.csv", paired_flat)

    payload = {
        "validated_rows": 40,
        "budget_per_run": EXPECTED_BUDGET,
        "source_commit": manifest["source_commit"],
        "summaries": summaries,
        "paired_vs_core": paired,
        "note": "Pilot-scale five-seed paired analysis; smoke data excluded.",
    }
    (args.outdir / "analysis.json").write_text(
        json.dumps(payload, indent=2) + "\n",
        encoding="utf-8",
    )
    (args.outdir / "analysis.md").write_text(
        make_markdown(summaries, paired),
        encoding="utf-8",
    )

    print(f"Analysis complete: {args.outdir}")


if __name__ == "__main__":
    main()
