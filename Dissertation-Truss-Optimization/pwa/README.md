# BMPOA Truss Optimization Studio — iPhone PWA

A read-only first-stage mobile dashboard for validated dynamic-discrete BMPOA evidence.

## Scientific boundary
- Publication-grade optimization remains in the repository MATLAB/Octave + CI path.
- The PWA does not reimplement the optimizer in JavaScript.
- Smoke data are excluded from performance claims.
- Pre-correction 120-bar data are diagnostic-only and excluded.
- Current summary values mirror the validated post-correction publication package.

## iPhone
Serve this directory over HTTPS (for example through GitHub Pages), open it in Safari, then Share → Add to Home Screen.

## Next stage
Add authenticated workflow dispatch, run-status polling, convergence plots, benchmark geometry visualization, artifact inspection, and CSV/PDF export without weakening publication gates.


## Completed implementation (2026-10-03)
- Summary values are computed from the frozen 40-row post-correction dataset, not manually copied constants.
- `data.json` and downloadable `results.csv` derive from official artifact 10795994838, run 35961509977, source 723bdc81d198a7895ce5401c083620c709897307.
- Dataset validation fails closed on wrong provenance, incomplete/duplicate keys, wrong seeds, budgets, feasibility or nonfinite weight.
- Weight is labeled lbf; static load-case counts are separate from evaluator/modal counts.
- Comparison bars use a zero baseline. No algorithm-superiority claim is made.
- PNG installation icons and scoped versioned offline asset caching are included.
- The frozen snapshot is identified; this is not live workflow monitoring.

## QA evidence and remaining gates
The official ZIP digest and internal checksums were verified; all 40 CSV rows match the ten MATLAB-v7 shards. All eight combinations passed a local JavaScript rendering/data-gate check. This does not substitute for browser/device testing.

Before ready-for-review: verify an HTTPS deployment, Safari Add to Home Screen on a physical iPhone, relaunch and offline rendering after the first online load. Record URL, tested commit, device/OS, date and actual result. No physical-device result is claimed here.

Convergence histories are absent from the source dataset and are not fabricated. The optimizer and scientific artifacts are unchanged.
