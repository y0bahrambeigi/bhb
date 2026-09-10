# MohandesYar AI 2.0.0 — Release notes

## Release identity

- Product: MohandesYar AI
- Version: 2.0.0
- Intended tag: `mohandesyar-ai-v2.0.0`
- License: MIT
- Release commit: tag the final verified/frozen commit only
- Archival DOI: add only after the Zenodo record is public and resolves through DOI.org

## Highlights

MohandesYar AI 2.0.0 is an offline-first Persian PWA for civil-engineering
field documentation. The release supports project dossiers, original image and
video evidence stored in IndexedDB, optional geolocation, SHA-256 integrity
metadata, backup/restore, multi-page Persian A4 reporting, service-worker
updates, and offline relaunch.

## Validation evidence

- Static release-contract verification: PASS
- Automated browser release QA: PASS
- Android physical-device test: PASS (user-confirmed)
- iPhone physical-device test: PASS (user-confirmed)
- Windows physical-device test: PASS (user-confirmed)
- Controlled civil-engineering QA scenario: `DEMO-RC-B01`
- Independent-user validation: required before journal submission unless the
  independent tester is explicitly documented elsewhere

## Important limitations

This release is local-only and single-device. It does not provide cloud
synchronization, server-side identity, organizational access control, trusted
timestamps, digital signatures, immutable provenance, legal chain of custody,
or automatic authority submission. The term "AI" is part of the product name;
version 2.0.0 does not transmit project data to an external AI inference
service.

## Release checksum procedure

After publishing the GitHub release:

1. Download the release asset independently.
2. Calculate SHA-256 for the exact downloaded asset.
3. Store the digest in `SHA256SUMS` or the release evidence record.
4. Re-download once and verify the digest before publishing the DOI.
5. Do not reuse the technical-report PDF checksum as the software-release
   archive checksum.
