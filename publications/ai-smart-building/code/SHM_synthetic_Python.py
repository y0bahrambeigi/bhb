#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Educational demonstration: synthetic building-modal-frequency monitoring.

No field data are used. The output must NOT be interpreted as a building-safety
assessment or a validated method of identifying actual structural damage.
Dependencies: numpy, matplotlib (both common scientific Python packages).
"""
from pathlib import Path
import csv
import numpy as np
import matplotlib.pyplot as plt


def run_demo(output_dir=".", seed=20261009):
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(seed)
    days = np.arange(1, 61)
    temperature = 20.0 + 9.0 * np.sin(2.0 * np.pi * days / 29.0)
    baseline_true = 1.25 - 0.0018 * (temperature - 20.0)
    observed = baseline_true + rng.normal(0.0, 0.009, len(days))
    injected_shift = np.zeros(len(days), dtype=bool)
    injected_shift[44:] = True  # Day 45 onwards only; an invented signal change.
    observed[injected_shift] -= 0.075

    # Fit temperature model ONLY to day 1-30 of healthy training data.
    train = days <= 30
    validate = (days > 30) & (days <= 44)
    test = days >= 45
    features = np.column_stack((np.ones(len(days)), temperature - 20.0))
    beta = np.linalg.lstsq(features[train], observed[train], rcond=None)[0]
    predicted = features @ beta
    residual = observed - predicted

    # Example fixed 3-sigma rule, using training-period variability only.
    sigma_train = residual[train].std(ddof=1)
    threshold = 3.0 * sigma_train
    flags = np.abs(residual) > threshold
    # Confirm persistence across two consecutive windows; do not apply future data.
    persistent = flags & np.concatenate(([False], flags[:-1]))

    with (out / "ai_shm_demo_60days.csv").open("w", encoding="utf-8", newline="") as fh:
        writer = csv.writer(fh)
        writer.writerow(["day", "temperature_C", "measured_frequency_Hz", "baseline_est_Hz",
                         "residual_Hz", "flag_3sigma", "flag_2_consecutive", "injected_shift_label"])
        for k in range(len(days)):
            writer.writerow([int(days[k]), f"{temperature[k]:.6f}", f"{observed[k]:.6f}",
                             f"{predicted[k]:.6f}", f"{residual[k]:.6f}",
                             int(flags[k]), int(persistent[k]), int(injected_shift[k])])

    fig, axs = plt.subplots(2, 1, figsize=(10, 7), sharex=True)
    axs[0].plot(days, observed, "o-", label="Measured synthetic", markersize=3)
    axs[0].plot(days, predicted, "--", label="Training-derived temperature baseline")
    axs[0].axvspan(44.5, 60.5, color="grey", alpha=0.12)
    axs[0].set_ylabel("Frequency (Hz)")
    axs[0].legend()
    axs[0].grid(alpha=0.2)
    axs[1].plot(days, residual, "o-", markersize=3, label="Residual")
    axs[1].axhline(threshold, linestyle="--", color="grey", label="±3σ training threshold")
    axs[1].axhline(-threshold, linestyle="--", color="grey")
    axs[1].scatter(days[persistent], residual[persistent], color="tab:red", zorder=5,
                   label="Two consecutive flags")
    axs[1].set(xlabel="Day", ylabel="Residual (Hz)")
    axs[1].legend(loc="lower left")
    axs[1].grid(alpha=0.2)
    fig.suptitle("Synthetic building monitoring: environmental compensation and alerting")
    fig.tight_layout()
    fig.savefig(out / "ai_shm_demo_plot.png", dpi=180)
    plt.close(fig)

    print("Educational synthetic example (not an engineering safety assessment)")
    print("Training days: 1-30 | validation days: 31-44 | holdout days: 45-60")
    print(f"Temperature regression: f = {beta[0]:.6f} + ({beta[1]:.6f})*(T-20) Hz")
    print(f"Training residual sigma: {sigma_train:.6f} Hz; 3sigma threshold: {threshold:.6f} Hz")
    print(f"Persistent alerts in validation: {persistent[validate].sum()} / {validate.sum()}")
    print(f"Persistent alerts in synthetic shifted holdout: {persistent[test].sum()} / {test.sum()}")
    return {"sigma": float(sigma_train), "threshold": float(threshold),
            "shift_flags": int(persistent[test].sum())}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default=".", help="Folder for CSV and PNG")
    a = parser.parse_args()
    run_demo(a.out)
