---
title: >-
  MohandesYar AI 2.0: An Offline-First Persian PWA for Civil Engineering Field
  Documentation, Evidence Integrity, and Reporting
tags:
  - civil engineering
  - field documentation
  - progressive web application
  - offline-first
  - Persian RTL
  - evidence integrity
authors:
  - name: Yousef Bahrambeigi
    affiliation: 1
affiliations:
  - name: Civil Engineering, Islamic Azad University, Mahabad Branch, Mahabad, Iran
    index: 1
date: 10 September 2026
bibliography: paper.bib
---

# Abstract

MohandesYar AI 2.0 is an open-source, offline-first progressive web application
for Persian right-to-left civil-engineering field documentation. It enables
users to create project dossiers, retain original image and video evidence in
browser-local IndexedDB storage, record optional geolocation and SHA-256
integrity metadata, export and restore project backups, and generate multi-page
Persian A4 reports. The public release is a static web application with no
runtime server dependency and does not transmit project data to an external AI
inference service. Release validation combines automated static checks,
browser-based end-to-end tests, physical-device checks, and an
author-confirmed independent Windows-user test. A controlled reinforced-concrete
inspection scenario demonstrates evidence persistence, hash verification,
backup/restore, Persian reporting, service-worker update retention, and offline
relaunch. The software is intended for research, teaching, and practical
evaluation of local-first engineering-documentation workflows rather than as a
trusted timestamping, regulatory submission, or legal chain-of-custody system.

**Keywords:** civil engineering; field documentation; progressive web
application; offline-first; Persian RTL; evidence integrity

# Code metadata

| Nr. | Code metadata description | MohandesYar AI 2.0 |
|---|---|---|
| C1 | Current code version | 2.0.0 |
| C2 | Permanent link to code/repository used for this code version | https://github.com/y0bahrambeigi/bhb/tree/mohandesyar-ai-v2.0.0/mohandesyar-ai |
| C3 | Permanent link to Reproducible Capsule | N/A; version-specific GitHub release and public CI evidence are used instead |
| C4 | Legal Code License | MIT License |
| C5 | Code versioning system used | Git |
| C6 | Software code languages, tools, and services used | HTML5, CSS, JavaScript, IndexedDB, Service Worker, Web Crypto API, Geolocation API |
| C7 | Compilation requirements, operating environments & dependencies | No compilation/runtime server required; modern standards-compliant browser. Test dependencies include Playwright 1.62.1 and pdf-lib 1.17.1 |
| C8 | Link to developer documentation/manual | https://github.com/y0bahrambeigi/bhb/tree/mohandesyar-ai-v2.0.0/mohandesyar-ai |
| C9 | Support email for questions | [VERIFIED CORRESPONDING-AUTHOR/SUPPORT EMAIL] |

# Software metadata

| Nr. | Software metadata description | MohandesYar AI 2.0 |
|---|---|---|
| S1 | Current software version | 2.0.0 |
| S2 | Permanent link to executable/public version | https://y0bahrambeigi.github.io/bhb/mohandesyar-ai/ |
| S3 | Permanent link to version-specific release | https://github.com/y0bahrambeigi/bhb/releases/tag/mohandesyar-ai-v2.0.0 |
| S4 | Legal Software License | MIT License |
| S5 | Computing platforms/Operating Systems | Web/PWA; physically checked on Android, iPhone/iOS, and Microsoft Windows |
| S6 | Installation requirements & dependencies | A modern browser supporting Service Worker and IndexedDB; first successful online load is required before offline relaunch |
| S7 | Link to user manual | https://github.com/y0bahrambeigi/bhb/blob/mohandesyar-ai-v2.0.0/mohandesyar-ai/README.md |
| S8 | Support email for questions | [VERIFIED CORRESPONDING-AUTHOR/SUPPORT EMAIL] |

# 1. Motivation and significance

Civil-engineering field documentation is often performed under intermittent
network connectivity, while records may need to remain readable and printable
in Persian right-to-left format. In this setting, a useful field tool should
continue operating after connectivity is lost, preserve the association between
a project and its original evidence files, expose enough integrity metadata to
detect file changes, and allow users to move their records without depending on
a remote account.

MohandesYar addresses this design problem with an installable, local-first web
application. The local-first approach follows the broader principle that users
should retain access to their work without continuous reliance on a server
[@kleppmann2019localfirst]. The software combines Persian RTL project
documentation, browser-local original-media storage, optional geolocation,
content hashing, backup/restore, and print-oriented reporting in a single,
open-source implementation.

The software is not presented as a replacement for general-purpose field-data
platforms, cloud document systems, or institutional records software. Its
scientific value is as a reproducible reference implementation for studying a
narrower workflow: local-first engineering evidence capture and reporting in a
Persian RTL environment. The intended users include civil-engineering
researchers, educators, students, and practitioners evaluating offline field
documentation, browser data persistence, evidence integrity, and localized
report-generation workflows.

A SHA-256 digest can help detect whether file content has changed but cannot by
itself establish when, where, or by whom a file was created. For that reason,
MohandesYar uses SHA-256 only as integrity metadata in accordance with the
Secure Hash Standard [@nist2015sha] and makes no claim of trusted timestamping,
immutable provenance, digital signature, or legal chain of custody.

# 2. Software description

## 2.1. Architecture

MohandesYar is implemented as a static progressive web application using HTML,
CSS, and JavaScript. Its principal components are:

1. a project-dossier interface for creating and editing local project records;
2. an IndexedDB data layer for project metadata and original evidence blobs;
3. a service worker for application-shell caching and offline relaunch;
4. a reporting module for Persian RTL A4 output; and
5. export/restore routines that preserve evidence and verify restored hashes.

Project and evidence data remain inside the browser origin. The application does
not require a runtime application server, user account, or cloud database.
Static application assets are served from GitHub Pages, while project records
are stored locally in IndexedDB.

## 2.2. Evidence and reporting workflow

For each evidence item, the application records the original file object
together with file name, media type, size, capture/import time, SHA-256 digest,
and optional geolocation with reported accuracy. Images can be rendered in the
report. Videos are represented by metadata and digest rather than embedded
inside the PDF-oriented report.

Backup files contain the project records and evidence needed to reconstruct the
local workspace. During restoration, evidence hashes are recomputed and
compared with the stored values. A mismatch is rejected rather than silently
restored with inconsistent integrity metadata.

The reporting component generates a Persian RTL project report targeted at A4
printing. Report status is visually identified as draft, review-required, or
approved within the software workflow. This internal status is not equivalent
to professional approval, institutional registration, signature, seal, or
regulatory acceptance.

## 2.3. Quality assurance and release evidence

The repository includes static release-contract checks and browser-based
end-to-end tests. Browser automation is implemented with Playwright
[@playwright] and exercises JavaScript syntax, public paths, RTL presentation,
cache separation, IndexedDB persistence, image/video evidence, geolocation
metadata, backup and restore, deliberate hash-mismatch rejection, multi-page
report generation, service-worker update behavior, and offline relaunch.

Physical-device checks are recorded for Android Chrome, iPhone Safari, and
Windows. The Windows validation was performed successfully by an independent
user outside the development workflow and was confirmed by the author on 10
September 2026. Device model, exact operating-system/browser versions, tester
identity, and original test date were not supplied and therefore are not
reconstructed after the fact. The evidence is described as author-confirmed
independent-user validation, not as signed third-party certification.

The frozen release is `mohandesyar-ai-v2.0.0`, published on 10 September
2026. Its version-specific ZIP has SHA-256
`9635e7fc37fb4fa1dca6be169bbc678ae5c6d45113b4cb6cde9e4f3460f25173`.
The release workflow independently re-downloaded the published archive and
verified the checksum.

# 3. Illustrative example

A controlled, non-sensitive reinforced-concrete inspection scenario,
`DEMO-RC-B01`, is included in the browser QA workflow. It contains no real
project address, client information, personal media, credentials, or private
geolocation data. The scenario exercises the same software path expected for a
small field-inspection dossier: project creation, evidence attachment, SHA-256
calculation, local persistence, backup, deliberate integrity-failure detection,
restoration, Persian report generation, service-worker update, and offline
relaunch.

The scenario uses six synthetic image items and one synthetic video item. After
project creation, the evidence is stored locally and a backup is exported. One
evidence payload is deliberately modified in the test data to confirm that
restoration rejects a hash mismatch. The untampered backup is then restored.
The report path verifies RTL rendering, non-empty image previews, evidence
notes, watermark visibility, and multi-page A4 output. The application is
subsequently reopened after a service-worker update and again with network
access disabled to verify that project and evidence data remain available.

The example evaluates software behavior, data persistence, integrity checking,
and report generation only. It does not evaluate the engineering condition or
safety of a real reinforced-concrete member and does not establish regulatory
or legal admissibility.

# 4. Impact

MohandesYar contributes a public, reusable implementation for examining
local-first civil-engineering documentation in a Persian RTL environment. It
supports research and teaching exercises on field-data organization, browser
storage behavior, offline web architecture, evidence hashing, portable
backup/restore, and localized technical-report generation. These workflows can
be reproduced without provisioning a server-side application stack.

The software may also reduce the setup burden for small controlled field studies
that require offline records and Persian reporting, because a browser and the
published application are sufficient for the tested workflow. The versioned
release, automated QA, physical-device evidence, and controlled example provide
a basis for independent replication and future usability or reliability
studies.

For context, QField, ODK Collect, and KoboCollect are established field-data
tools with broader use cases. MohandesYar is intentionally narrower and is not
claimed to outperform them.

| Capability or design focus | MohandesYar AI 2.0 | QField | ODK Collect | KoboCollect |
|---|---|---|---|---|
| Primary focus | Persian civil-engineering project dossiers and reporting | GIS/QGIS fieldwork | General structured field-data collection | General structured field-data collection |
| Offline workflow | Yes, after first successful application load | Yes | Yes | Yes |
| Image/media evidence | Yes | Yes | Yes | Yes |
| Geolocation | Optional | Yes | Yes | Yes |
| Persistence model emphasized here | Browser-local IndexedDB | QGIS-oriented local/offline workflow with synchronization options | Offline collection with synchronization workflows | Offline collection with synchronization workflows |
| Persian RTL engineering A4 reporting evaluated in this work | Yes | Not evaluated here | Not evaluated here | Not evaluated here |
| Per-evidence SHA-256 metadata evaluated in this work | Yes | Not evaluated here | Not evaluated here | Not evaluated here |

The comparison is deliberately limited to documented design scope rather than
an artificial performance ranking [@qfield; @odkcollect; @kobocollect].
Version 2.0.0 has not yet accumulated sufficient independent adoption,
citation, or commercialization evidence to support claims of widespread uptake.
Those outcomes should be evaluated separately as the software is reused.

# 5. Conclusions

MohandesYar AI 2.0 demonstrates that a static, installable web application can
combine Persian RTL civil-engineering documentation, browser-local original
media, optional geolocation, SHA-256 integrity metadata, backup/restore,
multi-page reporting, and offline relaunch without a runtime server.

The principal contribution is the integration and reproducible validation of
this local-first workflow rather than a claim of legal evidence certification
or structural decision automation. Current limitations include single-device
local storage, browser storage quotas, absence of cloud synchronization,
server-side identity, organizational authorization, trusted timestamps,
digital signatures, immutable provenance, and automatic authority submission.
Future work can evaluate usability, long-term data-loss recovery, cross-device
transfer, larger independent-user studies, and any separately designed
AI-assisted engineering functionality.

# Data and software availability

The source code and version-specific release are publicly available at
https://github.com/y0bahrambeigi/bhb/releases/tag/mohandesyar-ai-v2.0.0. The
live PWA is available at
https://y0bahrambeigi.github.io/bhb/mohandesyar-ai/. The source code, test
procedures, independent-user evidence record, controlled example, release
notes, and checksum evidence are included in the public repository.

The release ZIP SHA-256 is
`9635e7fc37fb4fa1dca6be169bbc678ae5c6d45113b4cb6cde9e4f3460f25173`.
A Zenodo DOI will be inserted only after the archival record is publicly
published and independently confirmed to resolve through DOI.org.

# Declaration of generative AI and AI-assisted technologies in the manuscript preparation process

During the preparation of this work, the author used OpenAI ChatGPT and Codex
to assist with manuscript organization, drafting, language editing, code
review, refactoring, and test scaffolding. After using these tools, the author
reviewed and edited the resulting content as needed and takes full
responsibility for the software and the published article. AI-assisted
software-development activity that materially affected implementation or
testing is also documented as part of the development methodology. The public
MohandesYar AI 2.0 application does not transmit project data to an external AI
inference service.

# Acknowledgements

The author acknowledges the civil-engineering and software-testing context used
to refine and validate the public release.

# References
