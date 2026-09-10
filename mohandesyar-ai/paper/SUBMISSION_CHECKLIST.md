# MohandesYar AI 2.0 software-paper checklist

## Gate 1 — software identity and licensing

- [x] Canonical English title is consistent across the manuscript and software metadata.
- [x] Author is listed as Yousef Bahrambeigi.
- [x] Version is 2.0.0.
- [x] An actual MIT `LICENSE` file is present in the submitted software directory.
- [x] Affiliation cross-checked against public academic profiles: Civil Engineering, Islamic Azad University, Mahabad Branch, Mahabad, Iran.
- [x] Verified corresponding-author email added: `yousef.bahrambeigi@iau.ac.ir`; verified ORCID added: `0000-0002-3421-8679`.

## Gate 2 — reproducible release

- [x] Run `npm ci` in `mohandesyar-ai` ([GitHub Actions run 17](https://github.com/y0bahrambeigi/bhb/actions/runs/34418861786)).
- [x] Run `npm run verify` ([GitHub Actions run 17](https://github.com/y0bahrambeigi/bhb/actions/runs/34418861786)).
- [x] Run `npm run qa:browser` in the supported release environment ([GitHub Actions run 17](https://github.com/y0bahrambeigi/bhb/actions/runs/34418861786)).
- [x] Physical Windows PWA test completed and recorded as user-confirmed PASS in `tests/MANUAL-QA.md`.
- [ ] Append exact Windows device/OS/browser version and original test date if those details become available; do not infer them.
- [x] Version-specific tag `mohandesyar-ai-v2.0.0` created from verified release commit `3296a372eb3d8d6c172b7f24477dcf946229f3de`.
- [x] GitHub Release `MohandesYar AI 2.0.0` published with source ZIP and SHA-256 evidence.
- [x] Published release ZIP re-downloaded by CI and SHA-256 verified: `9635e7fc37fb4fa1dca6be169bbc678ae5c6d45113b4cb6cde9e4f3460f25173`.

## Gate 3 — archive and DOI

- [x] Prepare canonical Figshare deposit metadata in `paper/FIGSHARE_METADATA.md`.
- [x] Add a repeatable Figshare API publication script that verifies the frozen GitHub release SHA-256 before upload.
- [x] Add a manual GitHub Actions workflow for authenticated Figshare DOI reservation/publication using the `FIGSHARE_TOKEN` repository secret.
- [x] Configure the private `FIGSHARE_TOKEN` secret in GitHub Actions; the value remains masked and is not committed.
- [x] Run the Figshare workflow with publication enabled; item 33511795 published successfully with version DOI `10.6084/m9.figshare.33511795.v1`.
- [x] Confirm publication-side metadata and the account-assigned Structural engineering category; Figshare returned the public item and version DOI.
- [ ] Confirm that the DataCite DOI resolves through `doi.org` without authentication.
- [x] Propagate version DOI `10.6084/m9.figshare.33511795.v1` to `CITATION.cff`, README, publication page, release notes, declarations, cover letter, and manuscript.
- [x] Preserve the frozen release ZIP checksum unchanged; no archived ZIP or technical-report PDF bytes were modified by DOI metadata synchronization.
- [ ] Optionally publish a matching Zenodo archive later as a secondary archive; do not cite any reserved or draft DOI.

## Gate 4 — manuscript evidence

- [x] Summary and statement of need are drafted.
- [x] Software architecture and limitations are described without legal or safety overclaiming.
- [x] Automated QA scope is described.
- [x] Android, iPhone, and Windows physical-device results are recorded without inventing missing environment details.
- [x] Controlled synthetic reinforced-concrete inspection example added to the browser QA workflow and manuscript (`DEMO-RC-B01`).
- [x] Compact comparison table added for QField, ODK Collect, and KoboCollect with official-documentation references.
- [x] Independent Windows PWA validation completed successfully by a user outside the development workflow; detailed tester/environment fields not supplied and therefore not inferred.
- [x] Core manuscript references and official QField, ODK Collect, KoboCollect, Playwright, and NIST source URLs were rechecked on 10 September 2026; the Local-First Software DOI was independently corroborated.
- [x] Pictorial component overview added as `paper/figures/architecture.svg` and referenced in the Software description to address the SoftwareX reviewer criterion for a component overview.

## Gate 5 — declarations and submission

- [x] Elsevier-ready AI declaration drafted with tool/service, purpose, human oversight, responsibility, and research-process disclosure where code assistance is material.
- [x] Author verified the AI declaration on 10 September 2026; unrecorded model versions or dates remain excluded.
- [x] Funding, conflict-of-interest, data-availability, and CRediT statement templates are drafted in `paper/DECLARATIONS.md`.
- [x] Author verified the final no-specific-funding statement, no-known-competing-interests statement, data/software availability statement, and proposed CRediT roles on 10 September 2026.
- [x] Primary journal selected: SoftwareX.
- [x] Manuscript structure aligned with the current SoftwareX OSP template: separate code/software metadata tables plus Motivation and significance, Software description, Illustrative example, Impact, and Conclusions. Figshare version DOI is frozen as `10.6084/m9.figshare.33511795.v1`.
- [x] Cover letter, highlights, independent-user protocol, and SoftwareX submission map are drafted.
- [ ] Run the final English-language and technical review after DOI/release fields are frozen.
- [x] Author confirmed that no private project data, precise private GPS coordinates, credentials, or personal media are included in the public submission materials.
- [ ] Submit only after all mandatory items above are checked and supporting evidence is public.

## Recommended venue order

1. **SoftwareX** — primary candidate for a full software article after the release and DOI gates close.
2. **Journal of Open Source Software (JOSS)** — secondary candidate after confirming that the web application meets current scope, research-impact, public-development-history, and local-testability screening criteria.
