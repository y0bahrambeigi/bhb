# Zenodo metadata — MohandesYar AI 2.0.0

Use these values when creating or reviewing a Zenodo preservation record for
MohandesYar AI 2.0.0.

The exact version 2.0.0 software artifact is already publicly archived on
Figshare with a registered DOI. Zenodo's current deposit guidance says that when
the upload already has a DOI for the same object, the existing DOI should be
supplied instead of minting a second DOI for that same object.

- **Upload type:** Software
- **Title:** MohandesYar AI 2.0: An Offline-First Persian PWA for Civil Engineering Field Documentation, Evidence Integrity, and Reporting
- **Creator:** Yousef Bahrambeigi
- **Affiliation:** Civil Engineering, Islamic Azad University, Mahabad Branch, Mahabad, Iran
- **ORCID:** 0000-0002-3421-8679
- **Version:** 2.0.0
- **First public publication date:** 2026-08-25
- **License:** MIT
- **Language:** English documentation / Persian RTL application
- **Access right:** Open
- **Repository:** https://github.com/y0bahrambeigi/bhb/tree/main/mohandesyar-ai
- **Version-specific release:** https://github.com/y0bahrambeigi/bhb/releases/tag/mohandesyar-ai-v2.0.0
- **Application:** https://y0bahrambeigi.github.io/bhb/mohandesyar-ai/
- **Release archive:** `mohandesyar-ai-2.0.0.zip`
- **Release archive SHA-256:** `9635e7fc37fb4fa1dca6be169bbc678ae5c6d45113b4cb6cde9e4f3460f25173`
- **Existing public DOI for this exact artifact:** `10.6084/m9.figshare.33511795.v1`
- **Reserved Zenodo DOI:** `10.5281/zenodo.22089146`
- **Reserved DOI status:** Pending/unpublished. Do not cite or publish it as a second DOI for the exact same software artifact.

## Recommended Zenodo route

For a Zenodo preservation copy of the same version 2.0.0 artifact:

1. choose the option indicating that the upload already has a DOI;
2. use `10.6084/m9.figshare.33511795.v1` as the existing DOI for the same object;
3. use publication date `2026-08-25`, because Zenodo asks for the date the
   upload was first made publicly available when it was previously published;
4. upload the exact frozen release archive and verify its SHA-256 before deposit;
5. keep the reserved Zenodo DOI unpublished unless it is reassigned to a
   genuinely distinct research object.

A distinct object (for example, the technical report rather than the exact
software archive) may legitimately receive its own DOI, provided its metadata,
files, resource type, title, and related-identifiers make that distinction clear.

## Description

MohandesYar AI 2.0 is an open-source, offline-first progressive web application
for Persian right-to-left civil-engineering field documentation. It stores
project records and original image/video evidence locally in IndexedDB, records
optional geolocation and SHA-256 integrity metadata, supports backup and
restoration, and generates multi-page Persian A4 reports. The public release is
a static web application with no runtime server dependency and does not transmit
project data to an external AI inference service.

The software is intended for research, teaching, and practical evaluation of
local-first engineering documentation workflows. It does not provide trusted
timestamps, digital signatures, immutable provenance, institutional
access-control, legal chain of custody, or automatic submission to authorities.

## Keywords

- civil engineering
- field documentation
- progressive web application
- offline-first
- Persian RTL
- IndexedDB
- SHA-256
- geolocation
- evidence integrity
- technical reporting

## Files/evidence to archive

Archive the exact tagged release source plus:
- README and MIT LICENSE
- CITATION.cff
- release notes
- automated QA/test sources
- physical-device QA evidence register
- software-paper manuscript package
- controlled example description
- SHA-256 evidence for the version-specific release asset

Do not archive private construction records, credentials, personal media, or
precise private GPS coordinates.

## Publication gate

Before publishing a Zenodo record, verify all of the following:

1. title, creator, ORCID, affiliation, version, first-publication date, and MIT
   license are consistent;
2. the archived software corresponds to tag `mohandesyar-ai-v2.0.0`;
3. the release archive SHA-256 is
   `9635e7fc37fb4fa1dca6be169bbc678ae5c6d45113b4cb6cde9e4f3460f25173`;
4. for the exact software artifact, retain the existing Figshare DOI
   `10.6084/m9.figshare.33511795.v1`;
5. do not propagate `10.5281/zenodo.22089146` into `CITATION.cff`, README,
   publication pages, manuscripts, or release notes unless a distinct Zenodo
   object is deliberately published under that identifier.
