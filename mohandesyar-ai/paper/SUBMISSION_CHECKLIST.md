# MohandesYar AI 2.0 software-paper checklist

## Gate 1 — software identity and licensing

- [x] Canonical English title is consistent across the manuscript and software metadata.
- [x] Author is listed as Yousef Bahrambeigi.
- [x] Version is 2.0.0.
- [x] An actual MIT `LICENSE` file is present in the submitted software directory.
- [ ] Confirm the precise university branch/campus and department for the affiliation.
- [ ] Add author email and ORCID where required by the selected journal.

## Gate 2 — reproducible release

- [ ] Run `npm ci` in `mohandesyar-ai`.
- [ ] Run `npm run verify`.
- [ ] Run `npm run qa:browser` in the supported release environment.
- [ ] Complete the physical Windows PWA test and update `tests/MANUAL-QA.md`.
- [ ] Create the version-specific tag `mohandesyar-ai-v2.0.0` from the verified commit.
- [ ] Publish a GitHub release with source archives, release notes, and SHA-256 evidence.
- [ ] Download the release independently and verify its SHA-256 digest.

## Gate 3 — archive and DOI

- [ ] Publish the Zenodo record; do not cite a reserved or draft DOI.
- [ ] Confirm that the public metadata matches title, author, affiliation, version, year, and license.
- [ ] Confirm that the DOI resolves through `doi.org` without authentication.
- [ ] Add the verified DOI to `CITATION.cff`, README, publication page, release notes, and manuscript.
- [ ] Regenerate affected checksums after metadata or PDF changes.

## Gate 4 — manuscript evidence

- [x] Summary and statement of need are drafted.
- [x] Software architecture and limitations are described without legal or safety overclaiming.
- [x] Automated QA scope is described.
- [x] Android and iPhone results are distinguished from the pending Windows test.
- [ ] Add at least one controlled civil-engineering example with shareable, non-sensitive test data.
- [ ] Add a compact comparison table covering at least three relevant alternatives.
- [ ] Obtain an independent installation/test report from a user outside the development workflow.
- [ ] Verify every reference, URL, version, and access date.

## Gate 5 — declarations and submission

- [ ] Complete the AI usage disclosure with exact tools, model versions, dates, and scope.
- [ ] Complete funding, conflict-of-interest, data-availability, and author-contribution statements.
- [ ] Select the journal and apply its exact template and word limit.
- [ ] Run a final English-language and technical review.
- [ ] Confirm that no private project data, precise GPS coordinates, credentials, or personal media are included.
- [ ] Submit only after all mandatory items above are checked and supporting evidence is public.

## Recommended venue order

1. **SoftwareX** — primary candidate for a full software article after the release and DOI gates close.
2. **Journal of Open Source Software (JOSS)** — secondary candidate after confirming that the web application meets current scope, research-impact, public-development-history, and local-testability screening criteria.
