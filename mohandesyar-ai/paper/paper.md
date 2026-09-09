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
  - name: Islamic Azad University, Iran
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
Chrome and iPhone Safari. Device and browser version details that were not
captured at test time remain explicitly marked as unavailable. A comparable
physical Windows installation test is pending and will not be represented as
complete until its device, operating-system, browser, date, tester, result, and
evidence reference have been recorded.

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
2.0.0 is licensed under the MIT License. A version-specific archival DOI and
release tag will be added to this section only after the public archive resolves
and the tagged source has been independently downloaded and verified.

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

Generative AI tools assisted with software-development activities and the
initial drafting and language editing of this manuscript. The author remains
responsible for the problem formulation, design decisions, source review,
testing, validation, accuracy, originality, licensing, and final text. The
specific tools, model versions, dates, and scope of assistance must be completed
in `AI_USAGE_DISCLOSURE.md` and verified by the author before submission.

# Acknowledgements

The author acknowledges the civil-engineering and software-testing context used
to refine the public release. Funding and conflict-of-interest declarations
must be completed before submission.

# References
