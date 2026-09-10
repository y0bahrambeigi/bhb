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

# Summary

MohandesYar AI 2.0 is an open-source, offline-first progressive web application
for Persian right-to-left documentation of civil-engineering field activities.
It enables a user to create project dossiers, retain original image and video
evidence in the browser, record optional geolocation and SHA-256 integrity
metadata, export and restore project backups, and generate multi-page Persian
A4 reports. The public release is a static web application with no runtime
server dependency. Project records remain in the browser's IndexedDB storage
and are not transmitted to the hosting service.

The software is intended as a practical documentation and research-support
tool. It does not replace professional review, an institutional document
management system, a trusted timestamping service, or a legally recognized
chain of custody. The term *AI* is part of the product name; version 2.0.0 does
not transmit project data to an external AI inference service.

# Code and software metadata

| Metadata item | MohandesYar AI 2.0 |
|---|---|
| Current code/software version | 2.0.0 |
| Permanent version-specific repository link | https://github.com/y0bahrambeigi/bhb/releases/tag/mohandesyar-ai-v2.0.0 |
| Archival record | To be inserted only after the public Zenodo DOI resolves |
| License | MIT |
| Version control | Git / GitHub |
| Languages and web technologies | HTML5, CSS, JavaScript, IndexedDB, Service Worker, Web Crypto, Geolocation |
| Test/development dependencies | Playwright 1.62.1 and pdf-lib 1.17.1 |
| Runtime environment | Modern browser with required PWA, IndexedDB and Service Worker support |
| User/developer documentation | Repository README, manual QA record, release notes and submission package |
| Support contact | Verified corresponding-author/support email to be inserted before submission |

# Statement of need

Field documentation in civil engineering may have to be performed where
network access is intermittent, while the working language and report layout
must remain Persian and right-to-left. A useful field tool in this context must
continue operating after connectivity is lost, preserve the relationship
between a project and its original evidence files, and allow the user to move
their records without depending on a remote account.

MohandesYar addresses this narrow need with an installable browser application.
Its local-first design follows the principle that users should retain access to
their work without continuous reliance on a server [@kleppmann2019localfirst].
The software combines Persian RTL workflows, on-device evidence storage,
optional location capture, content hashing, backup and restoration, and
print-ready reporting in one reproducible public implementation. The target
audience includes civil-engineering researchers, educators, students, and
practitioners evaluating local-first documentation workflows.

# State of the field

General-purpose form, cloud-storage, and document-management systems can
collect field information, but commonly place synchronization, account
management, or a server-side workflow at the center of the user experience.
MohandesYar is not presented as a replacement for those systems. Its scholarly
contribution is a transparent reference implementation for a different design
point: a Persian RTL, single-device workflow that remains functional offline
and exposes the evidence-integrity metadata used in its reports.

The release is intentionally limited in scope. It does not claim immutable
provenance, trusted time, organizational access control, digital signatures, or
automatic submission to authorities. These distinctions are important because
a cryptographic digest can help detect changes to a file but cannot, by itself,
establish when, where, or by whom the file was created. SHA-256 is implemented
as integrity metadata in accordance with the Secure Hash Standard
[@nist2015sha].

# Software design

MohandesYar is implemented with HTML, CSS, and JavaScript and is distributed as
a static progressive web application. Its main components are:

1. a project-dossier interface for creating and editing local records;
2. an IndexedDB data layer for project metadata and original evidence blobs;
3. a service worker for application-shell caching and offline relaunch;
4. a reporting module that renders Persian RTL A4 output; and
5. export and restore routines that preserve files and verify restored hashes.

The application records each evidence item's file name, media type, size,
capture or import time, SHA-256 digest, and optional geolocation with reported
accuracy. Images can be rendered in the report; videos are represented by
their metadata and digest rather than embedded in the PDF. Backup files contain
the project records and evidence required to reconstruct the local workspace.

# Quality assurance

The repository provides static release-contract checks and browser-based
end-to-end tests. The automated scenario exercises JavaScript syntax, the web
manifest, public paths, RTL presentation, cache separation, IndexedDB
persistence, image and video evidence, geolocation metadata, backup and
restore, hash verification, multi-page report generation, service-worker
upgrade behavior, and offline relaunch. Browser automation is performed with
Playwright [@playwright].

The release evidence records successful physical-device checks for Android
Chrome, iPhone Safari, and Windows. The Windows validation was performed
successfully by an independent user outside the development workflow and was
confirmed by the author on 10 September 2026. Device, operating-system,
browser-version, tester identity, and original test-date fields that were not
supplied remain explicitly marked as unavailable rather than being inferred
after the fact. This evidence is reported as author-confirmed independent-user
validation and is not represented as a signed third-party certification.

# Illustrative civil-engineering example

A controlled, non-sensitive reinforced-concrete inspection scenario is included
in the browser QA workflow under project code `DEMO-RC-B01`. The scenario is
explicitly synthetic: it contains no real project address, client information,
personal media, credentials, or private geolocation data. It exercises the same
workflow expected in a small field-inspection dossier: project creation,
evidence attachment, SHA-256 calculation, local persistence, backup, deliberate
integrity-failure detection, restoration, Persian report generation,
service-worker update, and offline relaunch.

The release scenario uses six synthetic image items and one synthetic video
item. The backup is exported, one evidence payload is deliberately altered to
confirm that restoration rejects a hash mismatch, and the untampered backup is
then restored. The report path verifies Persian right-to-left rendering,
non-empty image previews, evidence notes, watermark visibility, and multi-page
A4 output. The application is subsequently reopened after a service-worker
update and again with networking disabled to verify that the project and
evidence remain available.

This example evaluates software behavior and evidence-integrity handling only.
It does not evaluate structural safety, regulatory compliance, legal
admissibility, or the engineering condition of a real reinforced-concrete
member.

# Comparison with related field-data tools

| Capability or design focus | MohandesYar AI 2.0 | QField | ODK Collect | KoboCollect |
|---|---|---|---|---|
| Primary focus | Persian civil-engineering project dossiers and reporting | GIS/QGIS fieldwork | General structured field-data collection | General structured field-data collection |
| Offline workflow | Yes, after first successful application load | Yes | Yes | Yes |
| Image/media evidence | Yes | Yes | Yes | Yes |
| Geolocation | Optional | Yes | Yes | Yes |
| Default persistence model emphasized here | Browser-local IndexedDB | QGIS-oriented local/offline workflow with synchronization options | Offline collection with synchronization workflows | Offline collection with synchronization workflows |
| Persian RTL engineering A4 reporting evaluated in this work | Yes | Not evaluated here | Not evaluated here | Not evaluated here |
| Per-evidence SHA-256 metadata exposed by this implementation | Yes | Not evaluated here | Not evaluated here | Not evaluated here |

The comparison is deliberately scoped to design emphasis rather than a
performance ranking. QField, ODK Collect, and KoboCollect are established field
data tools with broader use cases. MohandesYar investigates a narrower design
point: a Persian RTL, local-first civil-engineering documentation workflow that
combines browser-resident original evidence, integrity metadata, portable
backup/restore, and print-oriented reporting [@qfield; @odkcollect;
@kobocollect].

# Research and teaching use

The software can support reproducible exercises on field-data organization,
offline web architecture, integrity checking, Persian report generation, and
the practical limitations of browser-resident evidence. A reference exercise
can create a sample project, attach controlled media, export the workspace,
restore it in a clean browser profile, and compare the stored SHA-256 values and
report output. This supports evaluation of the implemented workflow without
implying legal admissibility or suitability for safety-critical decisions.

# Availability

The source code, documentation, test procedures, and live application are
publicly available from the
[project repository](https://github.com/y0bahrambeigi/bhb/tree/main/mohandesyar-ai),
and the public application is available from
[GitHub Pages](https://y0bahrambeigi.github.io/bhb/mohandesyar-ai/). Version
2.0.0 is licensed under the MIT License and is frozen in GitHub Release
`mohandesyar-ai-v2.0.0`, published on 10 September 2026. The release archive
SHA-256 is
`9635e7fc37fb4fa1dca6be169bbc678ae5c6d45113b4cb6cde9e4f3460f25173`;
the published archive was independently re-downloaded and verified by the
release workflow. The archival Zenodo DOI will be added only after the public
record resolves successfully.

# Limitations and future work

The current public edition is local-only and single-device. It has no cloud
synchronization, server-side identity, role-based authorization, trusted
timestamp, digital signature, organizational audit trail, or automatic
authority submission. Browser storage quotas and device lifecycle remain
outside the application's control. Future research may evaluate usability,
data-loss recovery, cross-device transfer, and controlled comparisons with
alternative field-documentation workflows. Any future AI-assisted component
will require a separate description of its model, data flow, privacy controls,
validation, and human oversight.

# AI usage disclosure

During preparation of this work, OpenAI ChatGPT and Codex were used to assist
with code review, refactoring, test scaffolding, manuscript organization,
drafting, and language editing. The author reviewed and edited the resulting
content as needed and takes full responsibility for the software and the
published article. AI-assisted software-development activity that materially
affected implementation or testing is also documented as part of the
development methodology. The public MohandesYar AI 2.0 release does not send
project data to an external AI inference service.

# Acknowledgements

The author acknowledges the civil-engineering and software-testing context used
to refine the public release. Funding and conflict-of-interest declarations
must be completed before submission.

# References
