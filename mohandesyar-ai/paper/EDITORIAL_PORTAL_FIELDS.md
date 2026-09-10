# SoftwareX editorial portal fields — MohandesYar AI 2.0

Prepared for final submission after the Figshare DOI freeze.

## Target

- Journal: SoftwareX
- Manuscript type: Original Software Publication (use the equivalent SoftwareX software-article option if the portal wording differs)
- Corresponding author: Yousef Bahrambeigi

## Title

MohandesYar AI 2.0: An Offline-First Persian PWA for Civil Engineering Field Documentation, Evidence Integrity, and Reporting

## Abstract

MohandesYar AI 2.0 is an open-source, offline-first progressive web application
for Persian right-to-left civil-engineering field documentation. It enables
users to create project dossiers, retain original image and video evidence in
browser-local IndexedDB storage, record optional geolocation and SHA-256
integrity metadata, export and restore project backups, and generate multi-page
Persian A4 reports. The public release is a static web application with no
runtime server dependency and does not transmit project data to an external AI
inference service. Release validation combines automated static checks,
browser-based end-to-end tests, physical-device checks, and an independent-user
Windows test confirmed by the author. A controlled reinforced-concrete
inspection scenario demonstrates evidence persistence, hash verification,
backup/restore, Persian reporting, service-worker update retention, and offline
relaunch. The software is intended for research, teaching, and practical
evaluation of local-first engineering-documentation workflows rather than as a
trusted timestamping, regulatory submission, or legal chain-of-custody system.

## Keywords

1. civil engineering
2. field documentation
3. progressive web application
4. offline-first
5. Persian RTL
6. evidence integrity

## Author and affiliation

- Author: Yousef Bahrambeigi
- Affiliation: Civil Engineering, Islamic Azad University, Mahabad Branch, Mahabad, Iran
- Email: yousef.bahrambeigi@iau.ac.ir
- ORCID: 0000-0002-3421-8679

## Software record

- Software version: 2.0.0
- License: MIT
- Frozen GitHub release: https://github.com/y0bahrambeigi/bhb/releases/tag/mohandesyar-ai-v2.0.0
- Live application: https://y0bahrambeigi.github.io/bhb/mohandesyar-ai/
- Figshare item: 33511795
- Version DOI: 10.6084/m9.figshare.33511795.v1
- Release ZIP SHA-256: 9635e7fc37fb4fa1dca6be169bbc678ae5c6d45113b4cb6cde9e4f3460f25173

## Funding

This research did not receive any specific grant from funding agencies in the
public, commercial, or not-for-profit sectors.

## Competing interests

The author declares that he has no known competing financial interests or
personal relationships that could have appeared to influence the work reported
in this paper.

## CRediT

Yousef Bahrambeigi: Conceptualization; Methodology; Software; Validation;
Investigation; Data curation; Writing - original draft; Writing - review &
editing; Visualization; Project administration.

## Data/software availability

The source code, test procedures, controlled synthetic example, release
artifacts, and checksum evidence are publicly available in the version-specific
GitHub release. The frozen version 2.0.0 software archive is also publicly
archived on Figshare as item 33511795 with version DOI
10.6084/m9.figshare.33511795.v1. No confidential construction-project records,
personal media, credentials, or precise private geolocation data are included
in the public materials.

## Generative AI declaration

During the preparation of this work, the author used OpenAI ChatGPT and Codex
to assist with manuscript organization, drafting, language editing, code
review, refactoring, and test scaffolding. After using these tools, the author
reviewed and edited the resulting content as needed and takes full
responsibility for the software and the published article. AI-assisted
software-development activity that materially affected implementation or
testing is also documented as part of the development methodology. The public
MohandesYar AI 2.0 application does not transmit project data to an external AI
inference service.

## Submission readiness

The version DOI was independently checked through the GitHub Actions submission
build and returned HTTP 200 from DOI.org on 10 September 2026. The metadata
package is ready for final entry in the SoftwareX submission portal.
