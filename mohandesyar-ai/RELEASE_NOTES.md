# MohandesYar AI 2.0.0

Release date: 2026-09-10

MohandesYar AI 2.0.0 is an offline-first Persian progressive web application for
civil-engineering field documentation, evidence-integrity metadata, backup and
restore, and multi-page Persian reporting.

## Highlights

- Multiple local project dossiers with Persian RTL workflows.
- Original image and video evidence stored in IndexedDB.
- Optional GPS metadata and SHA-256 integrity hashes.
- JSON backup and verified restore, including restored-file hash checks.
- Multi-page A4 Persian reports with evidence thumbnails and status watermarks.
- Installable PWA with service-worker updates and offline relaunch.
- Public technical-report landing page, searchable PDF, citation metadata, and
  published SHA-256 checksum.

## Validation

- Static release validation: PASS.
- Browser QA: PASS (six images, one video, GPS, backup/restore, eight-page Persian
  report, service-worker update, IndexedDB retention, and offline relaunch).
- Android Chrome physical-device test: PASS (user-confirmed; device details incomplete).
- iPhone Safari physical-device test: PASS (user-confirmed; device details incomplete).
- Windows physical-device test: PASS (user-confirmed); an independent-user
  Windows validation was also author-confirmed, while exact device/browser
  details were not reconstructed after the fact.

## Known limitations

- Local-first, single-device public edition with no cloud synchronization.
- No server-side identity, role-based permissions, trusted timestamp, digital
  signature, organizational audit trail, or automatic authority submission.
- Browser storage quotas and device lifecycle remain outside the application's control.
- The archived software release is public on Figshare with version DOI `10.6084/m9.figshare.33511795.v1`.

## Canonical metadata

- Title: MohandesYar AI 2.0: An Offline-First Persian PWA for Civil Engineering Field Documentation, Evidence Integrity, and Reporting
- Author: Yousef Bahrambeigi
- Affiliation: Civil Engineering, Islamic Azad University, Mahabad Branch, Mahabad, Iran
- Version: 2.0.0
- Year: 2026
- Report: MYAI-TR-2026-02
- License: MIT

## Links

- Live application: https://y0bahrambeigi.github.io/bhb/mohandesyar-ai/
- Technical report: https://y0bahrambeigi.github.io/bhb/mohandesyar-ai/publication/
- Source: https://github.com/y0bahrambeigi/bhb/tree/main/mohandesyar-ai
- Frozen release: https://github.com/y0bahrambeigi/bhb/releases/tag/mohandesyar-ai-v2.0.0
- Figshare DOI: https://doi.org/10.6084/m9.figshare.33511795.v1
