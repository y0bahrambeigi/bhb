# Smart Structures v1.0.1 — B Nazanin font intake (2026-10-26)

## Evidence collected

A user-supplied file named `BNazanin(1).ttf` was inspected locally. This document contains **metadata only** and intentionally does not distribute or commit the font binary.

- SHA-256: `85e99f938567b29918530044b0111799ff6a9ba4376ca1adba495a5af5a91c46`
- Internal family: `B Nazanin`; style: `Regular`; PostScript name: `BNazanin`
- Font format: TrueType; cmap parses; glyphs for sampled Persian text and digits present
- Installed in isolated validation environment; `fc-match 'B Nazanin'` resolves to the supplied font
- Requesting Bold currently resolves to Regular: **no independent Bold face verified**
- OS/2 fsType: 0 (no embedding restriction indicated by that machine-readable flag; this is **not** proof of copyright license/redistribution permission)

## Still blocking publication

1. Verify lawful possession and publication/embedding terms for the supplied font. No font binary should be committed.
2. Obtain and validate actual B Nazanin Bold face where Heading 1/2, captions and table headers require it; synthetic bold requires explicit visual approval.
3. Obtain frozen v1.0.0 source DOCX from a verified release asset and verify source checksum.
4. Build v1.0.1 DOCX/PDF using real regular/bold faces, complete automated and **all 40-page visual QA** (equations, tables, RTL, page breaks, fallback).
5. Generate final hashes and metadata, review and merge, publish Figshare v3 and the matching GitHub tag/release.

## Status

**G1 partially met / G2 NO-GO.** Font identity and local family resolution have been verified; license and Bold availability remain unverified. The released v1.0.0 and Figshare v2 must not be changed.
