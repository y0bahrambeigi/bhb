# SoftwareX submission map — MohandesYar AI 2.0

This file maps the current paper package to the practical submission elements.
The current SoftwareX Guide for Authors must be checked again immediately
before upload because journal requirements can change.

## Core manuscript structure

| Submission element | Repository source | Status |
|---|---|---|
| Title and authorship | `paper.md` | Complete; corresponding email and ORCID verified |
| Abstract | `paper.md` | Complete |
| Keywords | `paper.md` | Complete |
| Code/software metadata | `paper.md`, README, CFF, package.json, release metadata | Two SoftwareX metadata tables complete; DOI pending |
| Motivation / statement of need | `paper.md` | Complete |
| Software description/functionality | `paper.md` | Complete |
| Controlled illustrative example | `paper.md`, `tests/browser-qa.mjs` | Complete and automated |
| Related-tool comparison | `paper.md`, `paper.bib` | Complete |
| Impact/research use | `paper.md` | Complete with conservative claims |
| Limitations | `paper.md` | Complete |
| Data/software availability | release + Zenodo metadata | GitHub release/checksum complete; Zenodo DOI pending |
| AI declaration | `AI_USAGE_DISCLOSURE.md` | Draft complete; author verification required |
| CRediT contribution roles | submission declarations | Author verification required |
| Funding statement | submission declarations | Author verification required |
| Competing-interest statement | submission declarations | Author verification required |
| Independent-user evidence | `INDEPENDENT_USER_TEST.md` | PASS; author-confirmed independent Windows user |
| Highlights | `HIGHLIGHTS.md` | Draft complete |
| Cover letter | `COVER_LETTER.md` | Draft complete |
| Release notes | `RELEASE_NOTES_2.0.0.md` | Complete |
| Zenodo metadata | `ZENODO_METADATA.md` and publication JSON | Complete except public DOI |

## Final freeze sequence

1. Independent-user validation: COMPLETE.
2. Repository verification: COMPLETE.
3. Frozen software release/tag: COMPLETE.
4. Version-specific GitHub release: COMPLETE.
5. Independent SHA-256 re-download verification: COMPLETE.
6. Publish the Zenodo software record.
7. Confirm public DOI resolution.
8. Insert the DOI into README, CFF, publication page, Zenodo
   metadata, manuscript, and release notes.
9. Re-run metadata/static checks.
10. Export the final manuscript/submission files and complete the journal portal.

## Submission-stop conditions

Do not submit while any of the following is true:

- the independent-user evidence is absent;
- the exact release described in the paper has no permanent public archive;
- the DOI is reserved/draft or fails public resolution;
- the release checksum has not been independently verified;
- the corresponding-author email or ORCID is guessed rather than verified;
- funding, conflict-of-interest, CRediT, or AI declarations remain unreviewed;
- repository CI is failing.
