# Real ground-motion records - v0.6

This folder contains the **selection manifest**, not reconstructed waveforms.
Do not digitize time histories from plotted images for publication-quality analysis.

## Pilot-3 selected records
1. Tabas 1978 - Tabas station - horizontal component 344.
2. Manjil 1990 - Abbar station - horizontal component 0.
3. El Centro 1940 - C&GS 117 - first horizontal PGA field 0.359 g; component orientation must be verified when the waveform is downloaded.

## Required local format
For every waveform, create a CSV with two columns:
`time_s, acceleration_mps2`

Use the exact filenames listed in `record_manifest_v0.6.csv`.
The MATLAB loader warns and skips missing files; it never fabricates missing records.

## Publication gate
Pilot-3 is for pipeline verification only. Final statistical claims should use a documented larger suite (target >=11 independent horizontal records unless the final study protocol justifies otherwise).
