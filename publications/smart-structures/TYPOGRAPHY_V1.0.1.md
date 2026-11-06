# Smart Structures v1.0.1 — B Nazanin typography revision

## Status

A typography revision candidate has been prepared from the frozen v1.0.0 DOCX.

Target typography:

- Persian body: **B Nazanin 12 pt**
- Heading 1: **B Nazanin Bold 17.5 pt**
- Heading 2: **B Nazanin Bold 14 pt**
- Lists: **B Nazanin 12 pt**
- Captions: **B Nazanin Bold 10.5 pt**
- Table body: **B Nazanin 10.75 pt**
- Table headers: **B Nazanin Bold 11.25 pt**
- Equations / mathematical content: preserved; no global font replacement

The forced final page break used by v1.0.0 is removed so the 40-page structure is retained.

## Local QA completed

Using the frozen v1.0.0 release asset as input:

- output page count: **40**
- pages 1–39 remained pixel-identical after the final page-break adjustment
- page 40 was visually inspected and closes cleanly with the bibliography and end statement
- tables, figures, captions and mathematical blocks showed no clipping or overlap under the available renderer
- candidate DOCX SHA-256 from the local preparation run:
  `79f60fed55ce189341eff165adc129eda8f784f079f644710f8cb8315cf787d4`

## Publication gate

**Do not publish v1.0.1 yet.**

B Nazanin is not bundled in this repository and was not present in the build environment. The font is therefore referenced by family name but not embedded. A licensed B Nazanin installation/file must be supplied and the complete DOCX/PDF must be rendered again with the real font before:

1. freezing the v1.0.1 DOCX/PDF;
2. regenerating SHA256SUMS;
3. updating citation/version metadata;
4. creating Figshare v3;
5. creating tag/release `smart-structures-v1.0.1`.

The historical v1.0.0 / Figshare v2 release must remain unchanged.
