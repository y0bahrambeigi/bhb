#!/usr/bin/env python3
"""Aggregate and analyze BMPOA 30-seed ablation CSV artifacts.

Scientific conventions:
- exact evaluator-call budget is validated for every run;
- feasibility/stability are reported separately from objective weight;
- weight comparisons use only seed pairs where both variants are feasible;
- paired Wilcoxon tests compare each variant with BMPOA-core-v1;
- Holm correction is applied across the three core comparisons per benchmark.
"""

from __future__ import annotations

import argparse
import csv
import math
import statistics
from collections import defaultdict
from pathlib import Path

from scipy.stats import binomtest, rankdata, wilcoxon

BENCHMARKS = ["10-bar", "25-bar", "72-bar", "120-bar"]
ALGORITHMS = [
    "BMPOA-core-v1",
    "BMPOA-problem-aware-ls-v1",
    "BMPOA-restart-v1",
    "BMPOA-problem-aware-ls-restart-v1",
]
EXPECTED_SEEDS = set(range(2026, 2056))
EXPECTED_BUDGET = 35070


def as_bool(value: str) -> bool:
    return str(value).strip().lower() in {"1", "true", "yes"}


def mean(values):
    return statistics.fmean(values) if values else math.nan


def median(values):
    return statistics.median(values) if values else math.nan


def stdev(values):
    return statistics.stdev(values) if len(values) >= 2 else 0.0 if len(values) == 1 else math.nan


def fmt(value, digits=6):
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return "NA"
    return f"{value:.{digits}g}"


def holm_adjust(pairs):
    """pairs: list[(key, p)] -> dict[key, adjusted_p]."""
    valid = [(k, p) for k, p in pairs if p is not None and not math.isnan(p)]
    valid.sort(key=lambda item: item[1])
    m = len(valid)
    adjusted = {}
    running = 0.0
    for i, (key, p) in enumerate(valid):
        candidate = min(1.0, (m - i) * p)
        running = max(running, candidate)
        adjusted[key] = min(1.0, running)
    return adjusted


def paired_rank_biserial(differences):
    nonzero = [d for d in differences if abs(d) > 0.0]
    if not nonzero:
        return 0.0
    ranks = rankdata([abs(d) for d in nonzero], method="average")
    pos = sum(r for r, d in zip(ranks, nonzero) if d > 0)
    neg = sum(r for r, d in zip(ranks, nonzero) if d < 0)
    denom = pos + neg
    return (pos - neg) / denom if denom else 0.0


def read_rows(root: Path):
    files = sorted(root.rglob("poa_restart_ablation_30seed_*.csv"))
    if not files:
        raise SystemExit(f"No ablation CSV files found under {root}")

    rows = []
    seen = set()
    for path in files:
        with path.open(newline="", encoding="utf-8-sig") as handle:
            reader = csv.DictReader(handle)
            for raw in reader:
                key = (raw["benchmark_id"], raw["algorithm"], int(raw["seed"]))
                if key in seen:
                    raise SystemExit(f"Duplicate benchmark/algorithm/seed row: {key}")
                seen.add(key)
                row = dict(raw)
                for field in [
                    "seed", "n_members", "n_variables", "population", "iterations",
                    "n_evaluator_calls", "n_load_case_solves", "best_iteration",
                    "restart_count", "n_active",
                ]:
                    row[field] = int(float(row[field]))
                for field in [
                    "elapsed_s", "objective_weight", "penalized_fitness",
                    "total_violation", "max_stress_ratio", "max_displacement_ratio",
                ]:
                    row[field] = float(row[field])
                row["stable"] = as_bool(row["stable"])
                row["feasible"] = as_bool(row["feasible"])
                rows.append(row)
    return files, rows


def validate(rows):
    expected_keys = {
        (b, a, s)
        for b in BENCHMARKS
        for a in ALGORITHMS
        for s in EXPECTED_SEEDS
    }
    observed_keys = {(r["benchmark_id"], r["algorithm"], r["seed"]) for r in rows}
    missing = sorted(expected_keys - observed_keys)
    extra = sorted(observed_keys - expected_keys)
    if missing or extra:
        raise SystemExit(
            f"Experiment grid mismatch: missing={len(missing)}, extra={len(extra)}; "
            f"first_missing={missing[:3]}, first_extra={extra[:3]}"
        )
    wrong_budget = [
        (r["benchmark_id"], r["algorithm"], r["seed"], r["n_evaluator_calls"])
        for r in rows if r["n_evaluator_calls"] != EXPECTED_BUDGET
    ]
    if wrong_budget:
        raise SystemExit(f"Evaluator budget violation: {wrong_budget[:5]}")
    if len(rows) != len(expected_keys):
        raise SystemExit(f"Expected {len(expected_keys)} rows, found {len(rows)}")


def summarize(rows):
    grouped = defaultdict(list)
    by_key = {}
    for r in rows:
        grouped[(r["benchmark_id"], r["algorithm"])].append(r)
        by_key[(r["benchmark_id"], r["algorithm"], r["seed"])] = r

    algorithm_summary = []
    pairwise = []

    for benchmark in BENCHMARKS:
        for algorithm in ALGORITHMS:
            group = sorted(grouped[(benchmark, algorithm)], key=lambda r: r["seed"])
            feasible_weights = [r["objective_weight"] for r in group if r["feasible"]]
            algorithm_summary.append({
                "benchmark": benchmark,
                "algorithm": algorithm,
                "n": len(group),
                "feasible_n": sum(r["feasible"] for r in group),
                "feasible_rate": mean([1.0 if r["feasible"] else 0.0 for r in group]),
                "stable_rate": mean([1.0 if r["stable"] else 0.0 for r in group]),
                "weight_mean_feasible": mean(feasible_weights),
                "weight_median_feasible": median(feasible_weights),
                "weight_std_feasible": stdev(feasible_weights),
                "fitness_mean": mean([r["penalized_fitness"] for r in group]),
                "fitness_median": median([r["penalized_fitness"] for r in group]),
                "elapsed_median_s": median([r["elapsed_s"] for r in group]),
                "load_case_solves_mean": mean([r["n_load_case_solves"] for r in group]),
            })

        raw_p = []
        benchmark_pairs = []
        for algorithm in ALGORITHMS[1:]:
            both_feasible = []
            weight_diffs = []
            pct_improvements = []
            wins = ties = losses = 0
            feasibility_improved = feasibility_worsened = 0
            fitness_diffs = []

            for seed in sorted(EXPECTED_SEEDS):
                core = by_key[(benchmark, ALGORITHMS[0], seed)]
                var = by_key[(benchmark, algorithm, seed)]
                fitness_diffs.append(core["penalized_fitness"] - var["penalized_fitness"])

                if (not core["feasible"]) and var["feasible"]:
                    feasibility_improved += 1
                elif core["feasible"] and (not var["feasible"]):
                    feasibility_worsened += 1

                if core["feasible"] and var["feasible"]:
                    both_feasible.append(seed)
                    diff = core["objective_weight"] - var["objective_weight"]
                    weight_diffs.append(diff)
                    if core["objective_weight"] != 0:
                        pct_improvements.append(100.0 * diff / core["objective_weight"])
                    tol = 1e-9 * max(1.0, abs(core["objective_weight"]), abs(var["objective_weight"]))
                    if diff > tol:
                        wins += 1
                    elif diff < -tol:
                        losses += 1
                    else:
                        ties += 1

            nonzero_weight = [d for d in weight_diffs if d != 0.0]
            if len(nonzero_weight) >= 1:
                p_weight = float(wilcoxon(
                    weight_diffs,
                    zero_method="wilcox",
                    alternative="two-sided",
                    method="auto",
                ).pvalue)
            else:
                p_weight = 1.0

            nonzero_fitness = [d for d in fitness_diffs if d != 0.0]
            p_fitness = (
                float(wilcoxon(
                    fitness_diffs,
                    zero_method="wilcox",
                    alternative="two-sided",
                    method="auto",
                ).pvalue)
                if nonzero_fitness else 1.0
            )

            discordant = feasibility_improved + feasibility_worsened
            p_feasibility = (
                float(binomtest(feasibility_improved, discordant, 0.5, alternative="two-sided").pvalue)
                if discordant else 1.0
            )

            item = {
                "benchmark": benchmark,
                "variant": algorithm,
                "paired_feasible_n": len(both_feasible),
                "mean_weight_improvement_pct": mean(pct_improvements),
                "median_weight_improvement_pct": median(pct_improvements),
                "mean_weight_delta_core_minus_variant": mean(weight_diffs),
                "median_weight_delta_core_minus_variant": median(weight_diffs),
                "wins": wins,
                "ties": ties,
                "losses": losses,
                "wilcoxon_weight_p": p_weight,
                "wilcoxon_weight_p_holm": math.nan,
                "rank_biserial_weight": paired_rank_biserial(weight_diffs),
                "wilcoxon_penalized_fitness_p": p_fitness,
                "feasibility_improved_pairs": feasibility_improved,
                "feasibility_worsened_pairs": feasibility_worsened,
                "mcnemar_exact_p": p_feasibility,
            }
            benchmark_pairs.append(item)
            raw_p.append((algorithm, p_weight))

        adjusted = holm_adjust(raw_p)
        for item in benchmark_pairs:
            item["wilcoxon_weight_p_holm"] = adjusted.get(item["variant"], math.nan)
            pairwise.append(item)

    return algorithm_summary, pairwise


def write_csv(path: Path, rows):
    path.parent.mkdir(parents=True, exist_ok=True)
    if not rows:
        return
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def make_markdown(files, rows, summaries, pairwise):
    lines = [
        "# BMPOA 30-seed dissertation ablation — statistical summary",
        "",
        "## Reproducibility validation",
        "",
        f"- Input shard CSV files: **{len(files)}**",
        f"- Complete experiment rows: **{len(rows)} / 480**",
        "- Seeds: **2026–2055** for every benchmark/algorithm combination",
        f"- Evaluator-call budget: **{EXPECTED_BUDGET:,} exactly per run**",
        "- Primary objective comparison: paired by seed and restricted to pairs where both runs are feasible.",
        "- Two-sided Wilcoxon signed-rank p-values are Holm-corrected across the three comparisons vs BMPOA-core-v1 within each benchmark.",
        "- Positive weight improvement and positive rank-biserial effect favor the compared variant.",
        "",
    ]

    for benchmark in BENCHMARKS:
        lines += [
            f"## {benchmark}",
            "",
            "### Variant summary",
            "",
            "| Algorithm | Feasible | Stable | Mean weight (feasible) | Median weight | SD | Median runtime (s) |",
            "|---|---:|---:|---:|---:|---:|---:|",
        ]
        for row in summaries:
            if row["benchmark"] != benchmark:
                continue
            lines.append(
                f"| {row['algorithm']} | {row['feasible_n']}/30 "
                f"({100*row['feasible_rate']:.1f}%) | {100*row['stable_rate']:.1f}% | "
                f"{fmt(row['weight_mean_feasible'])} | {fmt(row['weight_median_feasible'])} | "
                f"{fmt(row['weight_std_feasible'])} | {fmt(row['elapsed_median_s'], 5)} |"
            )

        lines += [
            "",
            "### Paired comparisons vs BMPOA-core-v1",
            "",
            "| Variant | Both feasible | Median weight improvement | W/T/L | Wilcoxon p | Holm p | Rank-biserial | Feasibility +/− |",
            "|---|---:|---:|---:|---:|---:|---:|---:|",
        ]
        for row in pairwise:
            if row["benchmark"] != benchmark:
                continue
            lines.append(
                f"| {row['variant']} | {row['paired_feasible_n']}/30 | "
                f"{fmt(row['median_weight_improvement_pct'], 5)}% | "
                f"{row['wins']}/{row['ties']}/{row['losses']} | "
                f"{fmt(row['wilcoxon_weight_p'], 5)} | {fmt(row['wilcoxon_weight_p_holm'], 5)} | "
                f"{fmt(row['rank_biserial_weight'], 5)} | "
                f"{row['feasibility_improved_pairs']}/{row['feasibility_worsened_pairs']} |"
            )
        lines.append("")

    lines += [
        "## Interpretation guardrails",
        "",
        "- Statistical significance is not treated as engineering importance; effect magnitude, feasibility and variability must be considered together.",
        "- If a variant changes feasibility relative to core, objective-weight comparisons alone are insufficient.",
        "- These BMPOA results remain scientifically distinct from the separate EPOA experiments and must not be pooled.",
        "",
    ]
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input_dir", type=Path)
    parser.add_argument("output_dir", type=Path)
    args = parser.parse_args()

    files, rows = read_rows(args.input_dir)
    validate(rows)
    summaries, pairwise = summarize(rows)

    args.output_dir.mkdir(parents=True, exist_ok=True)
    write_csv(args.output_dir / "BMPOA_30seed_variant_summary.csv", summaries)
    write_csv(args.output_dir / "BMPOA_30seed_pairwise_vs_core.csv", pairwise)

    markdown = make_markdown(files, rows, summaries, pairwise)
    md_path = args.output_dir / "BMPOA_30seed_statistical_summary.md"
    md_path.write_text(markdown, encoding="utf-8")

    print("BEGIN_BMPOA_SUMMARY")
    print(markdown)
    print("END_BMPOA_SUMMARY")


if __name__ == "__main__":
    main()
