# DOI registration preparation — application v0.1.0

Status: prepared metadata; no DOI has been reserved or registered.

## Object to archive

- Title: SG-DLS Research Lab: Interactive Steel-Truss Optimization Results Explorer
- Creator: Yousef Bahram Beigi (یوسف بهرام بیگی)
- Resource type: Software
- Version: 0.1.0
- First public source availability: 2026-10-22
- Application source snapshot: c9318b5d9898f6a12edfd43e6a0cdd9b563d990e
- Path within the monorepository: apps/sgdls-research-lab
- Deployed Site source snapshot: 2bad8ebf9f00df527b7400ef0084aed283b720dc
- Application URL: https://sgdls-research-lab.yousefbhb.chatgpt.site (owner-private)
- Code URL: https://github.com/y0bahrambeigi/bhb/tree/main/apps/sgdls-research-lab
- License: MIT for original code and CC BY 4.0 for original documentation; creator selected these on 2026-10-23. Third-party notices are preserved.
- ORCID: not supplied; omit instead of guessing.

This deposit must archive the application subdirectory, not all unrelated
projects in bhb. It is not the scientific BMPOA-FF-SG-DLS release tracked by
Issue #84 and must not imply that its scientific audit gates have passed.

## Record description

SG-DLS Research Lab is a Persian RTL application for exploring the archived
results of a controlled discrete steel-truss sizing experiment. It compares
BMPOA-FF-core, BMPOA-FF-RandomDiscreteLS and BMPOA-FF-SGDLS on the repository's
72-bar and 120-bar models using five paired seeds each (30 rows total), with
35,070 evaluator calls per run. Features include paired-seed final-weight
plots, runtime comparisons, raw diagnostics, CSV export, provenance and
scientific caveats. It does not execute a structural solver or reconstruct
unarchived convergence histories. Statistical superiority is not established.
The server-only OpenAI integration is implemented but inactive and has not
been live-tested.

## Data provenance

- Authoritative workflow: https://github.com/y0bahrambeigi/bhb/actions/runs/39207965973
- Source SHA: a8d9fc46966842ec56980853a4ee4ab56395a7e0
- Artifact: sgdls-full-30run-35070-p4, ID 12168833062
- CSV SHA-256: 2e13eba58e4ccbfb9f3e8b28fd359bba337edd01717d6264ffc49f5b37fc590e

## Remaining steps

1. DONE: Creator selected MIT (code) and CC BY 4.0 (documentation); bundled third-party notices retained.
2. Access the creator's chosen repository account (Zenodo selected).
3. Check the account for an existing record for this exact software to avoid
   duplicate deposition.
4. Prepare a source ZIP with citation metadata, dependency lockfile, original
   CSV/summary/checksum, readme and third-party notices. Exclude credentials,
   node_modules and temporary/build state.
5. Reserve a DOI in the saved draft. Label it reserved, not registered.
6. Validate files and metadata, then publish the software record to register
   the DOI. Verify the record and DOI resolution.
7. Insert the actual assigned DOI into CITATION.cff, README and the app.

Official guidance:
- https://help.zenodo.org/docs/deposit/describe-records/reserve-doi/
- https://help.zenodo.org/docs/github/archive-software/manual-upload/
- https://help.zenodo.org/docs/deposit/describe-records/licenses/
