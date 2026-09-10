# SoftwareX submission map — MohandesYar AI 2.0

This file maps the current paper package to the practical submission elements.
The current SoftwareX Guide for Authors must be checked again immediately
before upload because journal requirements can change.

## Core manuscript structure

| Submission element | Repository source | Status |
|---|---|---|
| Title and authorship | `paper.md` | Draft complete; email/ORCID pending verification |
| Abstract | `paper.md` | Complete |
| Keywords | `paper.md` | Complete |
| Code/software metadata | README, CFF, package.json, release metadata | Release URL and DOI pending |
| Motivation / statement of need | `paper.md` | Complete |
| Software description/functionality | `paper.md` | Complete |
| Controlled illustrative example | `paper.md`, `tests/browser-qa.mjs` | Complete and automated |
| Related-tool comparison | `paper.md`, `paper.bib` | Complete |
| Impact/research use | `paper.md` | Complete with conservative claims |
| Limitations | `paper.md` | Complete |
| Data/software availability | release + Zenodo metadata | Pending public release/DOI |
| AI declaration | `AI_USAGE_DISCLOSURE.md` | Draft complete; author verification required |
| CRediT contribution roles | submission declarations | Author verification required |
| Funding statement | submission declarations | Author verification required |
| Competing-interest statement | submission declarations | Author verification required |
| Independent-user evidence | `INDEPENDENT_USER_TEST.md` | Pending external tester |
| Highlights | `HIGHLIGHTS.md` | Draft complete |
| Cover letter | `COVER_LETTER.md` | Draft complete |
| Release notes | `RELEASE_NOTES_2.0.0.md` | Complete |
| Zenodo metadata | `ZENODO_METADATA.md` and publication JSON | Complete except DOI/ORCID |

## Final freeze sequence

1. Obtain and archive independent-user validation.
2. Run the repository verification workflow and require PASS.
3. Freeze the verified commit.
4. Create tag `mohandesyar-ai-v2.0.0`.
5. Publish a version-specific GitHub release.
6. Independently download the release asset and verify its SHA-256 digest.
7. Publish the Zenodo software record.
8. Confirm public DOI resolution.
9. Insert the DOI/release URL into README, CFF, publication page, Zenodo
   metadata, manuscript, and release notes.
10. Re-run metadata/static checks.
11. Apply the current SoftwareX template/Guide for Authors.
12. Export the final manuscript/submission files and complete the journal portal.

## Submission-stop conditions

Do not submit while any of the following is true:

- the independent-user evidence is absent;
- the exact release described in the paper has no permanent public archive;
- the DOI is reserved/draft or fails public resolution;
- the release checksum has not been independently verified;
- the corresponding-author email or ORCID is guessed rather than verified;
- funding, conflict-of-interest, CRediT, or AI declarations remain unreviewed;
- repository CI is failing.
