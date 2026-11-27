# Smart Structures v1.0.1 — B Nazanin font intake (2026-10-26)

## Original intake on 2026-10-26

A user-supplied file named `BNazanin(1).ttf` was inspected locally. This document contains **metadata only** and intentionally does not distribute or commit the font binary.

- SHA-256: `85e99f938567b29918530044b0111799ff6a9ba4376ca1adba495a5af5a91c46`
- Internal family: `B Nazanin`; style: `Regular`; PostScript name: `BNazanin`
- Font format: TrueType; cmap parses; glyphs for sampled Persian text and digits present
- Installed in isolated validation environment; `fc-match 'B Nazanin'` resolves to the supplied font
- Requesting Bold currently resolves to Regular: **no independent Bold face verified**
- OS/2 fsType: 0 (no embedding restriction indicated by that machine-readable flag; this is **not** proof of copyright license/redistribution permission)

## Initial publication checklist

1. Verify lawful possession and publication/embedding terms for the supplied font. No font binary should be committed.
2. Obtain and validate actual B Nazanin Bold face where Heading 1/2, captions and table headers require it; synthetic bold requires explicit visual approval.
3. Obtain frozen v1.0.0 source DOCX from a verified release asset and verify source checksum.
4. Build v1.0.1 DOCX/PDF using real regular/bold faces, complete automated and **all 40-page visual QA** (equations, tables, RTL, page breaks, fallback).
5. Generate final hashes and metadata, review and merge, publish Figshare v3 and the matching GitHub tag/release.

## Status at initial intake

**G1 partially met / G2 NO-GO.** Font identity and local family resolution have been verified; license and Bold availability remain unverified. The released v1.0.0 and Figshare v2 must not be changed.

## Verification on 2026-11-06

- The public GitHub v1.0.0 and Figshare v2 DOCX and PDF matched byte for byte and passed the release-attached SHA-256 manifest. The DOCX used for testing hashed to `2111389b572b4d71175faaac42d6ace1f0394f60871ccb127ee0fdb0027301c2`. The `FINAL_QA_v1.0.0.json` in the historical tag records different values. The release attachments and matching Figshare files establish the input used here.
- The [official Borna Rayaneh package](https://www.bornaray.com/Content/downloads/bfonts.zip) supplies distinct B Nazanin Regular and Bold files. Both report Version 2.01, Build 1379 and OS/2 fsType 0. Regular (`BNazanin`, weight 400) SHA-256: `7ae508e94fbbf35f1a43f7a93d125f003debcf0e0af64805309f3a3ebac4188c`. Bold (`BNazaninBold`, weight 700) SHA-256: `2293311d5738f48bf7dbf3bb38e1b7fa1475e955893e0b026258493ac1d4658c`. The official Regular has a different hash from the file inspected in October.
- Fontconfig selected both official faces in isolation. An internal LibreOffice 26.8 alpha render of commit `9b0d0adf6b3ab85530b83aa320a1aca216279b6c` had 40 pages. Poppler reported embedded subsets of both faces. Automated extraction found only these two faces in PDF text spans containing characters in U+0600–U+06FF after the header and footer fix. The body image region matched the preview before that fix on all 40 pages. These checks cover the internal render and targeted regression only. Full-size visual review and production renderer validation are pending.
- The official package and the font metadata supplied no license text governing public PDF or DOCX embedding. Written confirmation remains the G1 blocker. The internal render and font files are excluded from release assets.

**Current decision: NO-GO for publication.**
