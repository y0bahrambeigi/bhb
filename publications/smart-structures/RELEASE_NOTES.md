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

## Archival DOI status

RC1 has been published as a Figshare **book** research object with version DOI `10.6084/m9.figshare.34063335.v1`. DOI resolution through DOI.org was verified in CI. The Figshare record ID is `34063335`.

A guarded Zenodo workflow is also present as an optional secondary archival route, but `ZENODO_TOKEN` is not currently configured. No duplicate Zenodo record has been created.

## Final v1.0.0 gate

Create the final tag `smart-structures-v1.0.0` only after all of the following are true:

1. final DOI/version metadata are embedded in the final DOCX/PDF and synchronized with `README.md`, `CITATION.cff`, `CITATION.bib`, the archival record, and GitHub Release metadata;
2. final digital assets pass the publication QA again;
3. final checksums are regenerated from the frozen assets;
4. a final archival version/record is published and its DOI resolves through DOI.org;
5. release-candidate wording is removed from final citation metadata.

Until then, `smart-structures-v1.0.0-rc1` is the canonical public release candidate.
