# SoftwareX submission package manifest — MohandesYar AI 2.0

## Primary upload files

1. Final editable manuscript generated from `paper/paper.md`
2. Final manuscript PDF for visual verification
3. Highlights as a separate editable Word file
4. Cover letter as a separate editable Word file
5. Architecture figure from `paper/figures/architecture.svg` if the portal requests separate artwork

## Repository records supporting the submission

- `paper/paper.bib` — reference source, including the archived software DOI
- `paper/DECLARATIONS.md` — funding, competing interests, CRediT, data/software availability
- `paper/AI_USAGE_DISCLOSURE.md` — canonical AI-use record
- `paper/FIGSHARE_METADATA.md` — archival record
- `paper/REFERENCE_VERIFICATION.md` — reference verification record
- `paper/SUBMISSION_CHECKLIST.md` — submission gates
- `paper/SOFTWAREX_2026_REQUIREMENTS.md` — current journal-preparation record
- `paper/EDITORIAL_PORTAL_FIELDS.md` — copy-ready portal metadata

## Final checks already completed

- Frozen version 2.0.0 GitHub release is public
- Release ZIP SHA-256 independently re-verified by CI
- Figshare item 33511795 is public
- Version DOI is recorded as `10.6084/m9.figshare.33511795.v1`
- Five highlights comply with the 85-character limit
- Abstract is concise and contains no citations
- Six keywords are used
- Code and software metadata tables are present
- Final English-language and technical review completed
- Repository verification and GitHub Pages deployment are passing

## Current release-readiness verification

GitHub Actions run 36018851340 (Verify MohandesYar AI PWA, run #91) completed successfully before PR #60 was merged. Static source/PWA validation, Chromium installation, browser release QA, JSON-manifest validation, scholarly-record checksum validation, and all public-route checks passed.

PR #60 was subsequently squash-merged into `main` at commit `3fb69e1b6139649db7312241660718c19567bc54`.

## Build result

The previously recorded SoftwareX package build, GitHub Actions run 34433833072, completed successfully on 10 September 2026:

- DOI.org resolution: HTTP 200
- Manuscript Word file: generated and structurally verified
- Highlights Word file: generated and structurally verified
- Cover-letter Word file: generated and structurally verified
- Submission artifact: `mohandesyar-softwarex-submission-package`

A fresh package build should be generated from the current `main` branch after the citation-readiness merge and verified before portal upload. The remaining external step after that verification is final author entry/upload in the SoftwareX submission portal.
