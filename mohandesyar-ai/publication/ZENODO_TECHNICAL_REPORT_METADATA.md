# Zenodo metadata — MohandesYar AI 2.0 Technical Report

This file prepares a distinct Zenodo record for the technical report. It is
separate from the already-published MohandesYar AI 2.0.0 software archive.

- **Resource type:** Publication / Report
- **Title:** MohandesYar AI 2.0: An Offline-First Persian PWA for Civil Engineering Field Documentation, Evidence Integrity, and Reporting
- **Creator:** Yousef Bahrambeigi
- **Affiliation:** Civil Engineering, Islamic Azad University, Mahabad Branch, Mahabad, Iran
- **ORCID:** 0000-0002-3421-8679
- **Publication date:** 2026-08-25
- **Publisher:** BHB Smart Structures Lab
- **Report number:** MYAI-TR-2026-02
- **Language:** English
- **Access:** Open
- **Primary file:** `mohandesyar-ai-v2-technical-report.pdf`
- **PDF SHA-256:** `c938de488c8b1e70eb8c7a53c38f30d5e719effda6256b5599f18c5ae8453e16`
- **Public report DOI (Figshare):** `10.6084/m9.figshare.33935692.v1`
- **Public Figshare item:** `33935692`
- **Report license:** CC BY 4.0
- **Reserved Zenodo DOI:** `10.5281/zenodo.22089146`
- **Zenodo DOI status:** Reserved/unpublished and superseded as the primary DOI route for this exact report. Do not cite it.
- **Related software DOI:** `10.6084/m9.figshare.33511795.v1`
- **Relationship:** this report **documents** the related MohandesYar AI 2.0.0 software archive
- **Report landing page:** https://y0bahrambeigi.github.io/bhb/mohandesyar-ai/publication/
- **Source repository:** https://github.com/y0bahrambeigi/bhb/tree/main/mohandesyar-ai
- **Frozen software release:** https://github.com/y0bahrambeigi/bhb/releases/tag/mohandesyar-ai-v2.0.0

## Abstract

MohandesYar AI 2.0 is an offline-first progressive web application designed for
Persian right-to-left field documentation in civil engineering projects. The
public edition supports multiple project dossiers, storage of original image
and video evidence in the browser, optional geolocation capture, SHA-256
integrity metadata, project backup and restoration, and generation of
multi-page Persian A4 reports. The architecture follows a local-first model:
project data and evidence remain in IndexedDB on the user's device and are not
transmitted to the public hosting service. Release validation combines static
contract checks with browser-based end-to-end tests covering persistence,
evidence hashing, backup and restore, report rendering, service-worker updates,
IndexedDB retention, and offline relaunch. The report documents the software
scope, architecture, validation evidence, limitations, and reproducibility
information for version 2.0.0.

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

## Related works

Use the related-identifier field to link the report to the software archive:

- **Identifier:** https://doi.org/10.6084/m9.figshare.33511795.v1
- **Relation:** documents
- **Resource:** software

The software DOI must not be entered as the DOI of this report.

## License gate

The software is MIT-licensed, but that software license should not automatically
be assumed to license the prose and figures of this technical report. Before
publishing the report record, explicitly select the report's publication
license in Zenodo and, if necessary, add the same license statement to the PDF.

## Zenodo secondary-preservation policy

The exact technical report is now publicly registered on Figshare with DOI
`10.6084/m9.figshare.33935692.v1`. A future Zenodo preservation copy of the **same report**
should use Zenodo's "already has a DOI" path with that existing DOI rather than
minting a second DOI for the identical research object. The reserved Zenodo DOI
`10.5281/zenodo.22089146` should therefore remain unpublished unless it is
deliberately reassigned to a genuinely different research object.

## Final publication gate

Before pressing Publish in Zenodo:

1. verify the PDF SHA-256 against the value above;
2. confirm title, creator, ORCID, affiliation, publication date, publisher, and report number;
3. ensure the resource type is Publication / Report, not Software;
4. add the Figshare software DOI as a related work with relation `documents`;
5. choose an explicit license for the report;
6. confirm the reserved DOI is `10.5281/zenodo.22089146`;
7. preview the record and verify that no private project records, credentials,
   personal media, or precise private GPS coordinates are included;
8. publish the record;
9. verify public DOI resolution through DOI.org;
10. only after resolution, propagate the report DOI to the publication page and
    other scholarly metadata.
