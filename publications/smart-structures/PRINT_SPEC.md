# Print production specification gate

## Current file

`Smart_Structures_Yousef_Bahrambeigi_v1.0.0-rc1_print-candidate.pdf` is a **proof and printer-coordination candidate only**.

Current characteristics:

- PDF 1.7, 36 pages;
- US Letter page size: 612 × 792 pt (8.5 × 11 in);
- MediaBox, CropBox, TrimBox, and BleedBox currently coincide;
- all fonts are embedded;
- tagged structure, bookmarks, and links are retained from the digital PDF;
- no PDF/X output intent or printer ICC profile is present;
- cover artwork has not been extended beyond the trim edge.

It is therefore **not a production PDF/X-4 file and must not be sent to press as final artwork**.

## Required printer inputs

Obtain a written production specification containing all of the following:

1. final trim width and height;
2. bleed required on the cover and interior, plus safe-area requirements;
3. binding method, paper stock, cover stock, spine calculation, and whether a separate wraparound cover is required;
4. required ICC profile/output condition, CMYK conversion policy, and maximum total area coverage;
5. crop/registration/color-bar requirements and whether printer marks must be included or omitted;
6. required PDF/X standard and validator profile;
7. barcode/ISBN placement, minimum size, quiet zone, and black-generation requirements;
8. overprint, transparency, rich-black, minimum line weight, and image-resolution constraints;
9. imposition responsibility and delivery naming convention.

## Finalization workflow

After receiving those inputs:

1. set the final page geometry in the DOCX and reflow all 36 pages;
2. rebuild or extend the cover to the required bleed and, if needed, create a separate wraparound cover;
3. insert the exact DOI/ISBN, publisher, and final publication date everywhere they appear;
4. export with the printer-supplied output intent as PDF/X-4 without flattening required transparency;
5. validate with the printer's preflight profile or a conforming PDF/X validator;
6. confirm TrimBox/BleedBox, embedded fonts, output intent, color spaces, image resolution, overprint, transparency, and total ink coverage;
7. render and visually inspect every final page, then obtain an approved hard proof or contract proof;
8. regenerate `SHA256SUMS` only after the printer-approved files are frozen.

The final QA note must name the actual validator/profile and the exact printer specification used; “PDF/X-4” must not be asserted solely from a filename or export setting.
