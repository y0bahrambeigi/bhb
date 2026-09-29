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

The SoftwareX package workflow builds the manuscript Word and PDF, highlights
Word file, cover-letter Word file, and portal-field notes from the current
source revision. It verifies DOI.org resolution, the author identity and DOI
in the Word manuscript, readable Word archives, and a nonempty PDF. The PWA
verification workflow separately checks the application and public routes.

Before portal upload, use a successful package artifact from the merged main
commit, compare its DOI and author fields with
`paper/EDITORIAL_PORTAL_FIELDS.md`, and visually inspect the PDF. The frozen
software release archive and its checksum are independent of this editable
submission package.

## Build result

The first complete package was validated on the main branch after PR #62 merged
at commit `488cca8466eac3bd3cda0680bbe903433b319675`:

- [SoftwareX package build](https://github.com/y0bahrambeigi/bhb/actions/runs/36543955897): PASS
- [PWA verification](https://github.com/y0bahrambeigi/bhb/actions/runs/36543955869): PASS
- [GitHub Pages deployment](https://github.com/y0bahrambeigi/bhb/actions/runs/36543955045): PASS

This manifest is a source-level guide. For the final upload, use the latest
successful main-branch package artifact, rather than a previously downloaded
archive. Submission in the SoftwareX editorial portal remains a separate step.
