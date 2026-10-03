# Smart Structures release status

## Current public release

**Tag:** `smart-structures-v1.0.0-rc1`

**Title:** `Smart Structures v1.0.0-rc1`

**Published:** 2026-10-03

**Status:** Public GitHub prerelease; digital RC1.

RC1 was published after the release workflow verified the publication checksums and Smart Structures PWA validation suite. The public release contains:

- `Smart_Structures_Yousef_Bahrambeigi_v1.0.0-rc1_source.docx`
- `Smart_Structures_Yousef_Bahrambeigi_v1.0.0-rc1_digital.pdf`
- `SHA256SUMS`
- `CITATION.bib`
- `CITATION.cff`
- `LICENSE.md`

The print-candidate PDF is intentionally excluded from the digital release.

## Public webapp

The Smart Structures PWA is part of the repository and its GitHub Pages deployment completed successfully after the RC1 publication changes. The webapp validation workflow checks JavaScript syntax, PWA requirements, and engineering calculations.

## Zenodo archival status

A guarded Zenodo workflow is present. It downloads the exact RC1 release assets, validates the released primary assets against `SHA256SUMS`, checks for duplicate title+version deposits, validates metadata and uploaded files, publishes only after those checks pass, verifies DOI resolution, and then updates the GitHub Release notes.

The current external blocker is repository credential configuration: `ZENODO_TOKEN` is not configured. The workflow therefore stops before contacting Zenodo and no partial or fabricated DOI is created.

## Final v1.0.0 gate

Create the final tag `smart-structures-v1.0.0` only after all of the following are true:

1. a real Zenodo DOI for this book is reserved/published and resolves through DOI.org;
2. DOI and publication date are synchronized across DOCX/PDF, `README.md`, `CITATION.cff`, `CITATION.bib`, Zenodo metadata, and GitHub Release metadata;
3. final digital assets pass the publication QA again;
4. final checksums are regenerated from the frozen assets;
5. release-candidate wording is removed from final citation metadata.

Until then, `smart-structures-v1.0.0-rc1` is the canonical public release candidate.
