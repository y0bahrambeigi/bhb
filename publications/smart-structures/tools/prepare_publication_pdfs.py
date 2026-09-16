#!/usr/bin/env python3
"""Prepare tagged digital and clearly labelled print-candidate PDFs.

The LibreOffice export is the canonical rendering of the final DOCX.  This
script preserves its tags, outline, annotations, and page content while
correcting the document language and adding publication/licensing metadata.
The print output is intentionally a candidate: it is not assigned a PDF/X
output intent until the printer supplies the trim, bleed, binding, and ICC
requirements documented in PRINT_SPEC.md.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from lxml import etree
from pypdf import PdfReader, PdfWriter
from pypdf.generic import BooleanObject, NameObject, TextStringObject


DC_NS = "http://purl.org/dc/elements/1.1/"
RDF_NS = "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
XML_NS = "http://www.w3.org/XML/1998/namespace"
XMP_RIGHTS_NS = "http://ns.adobe.com/xap/1.0/rights/"


def _replace_xmp_metadata(writer: PdfWriter, *, print_candidate: bool) -> None:
    metadata_ref = writer._root_object.get(NameObject("/Metadata"))
    if metadata_ref is None:
        raise ValueError("Source PDF has no XMP metadata stream")
    metadata_stream = metadata_ref.get_object()
    root = etree.fromstring(metadata_stream.get_data())
    description = root.find(f".//{{{RDF_NS}}}Description")
    if description is None:
        raise ValueError("Source XMP has no rdf:Description")

    for tag_name in ("language", "rights"):
        for existing in description.findall(f"{{{DC_NS}}}{tag_name}"):
            description.remove(existing)

    language = etree.SubElement(description, f"{{{DC_NS}}}language")
    bag = etree.SubElement(language, f"{{{RDF_NS}}}Bag")
    etree.SubElement(bag, f"{{{RDF_NS}}}li").text = "fa-IR"

    rights = etree.SubElement(description, f"{{{DC_NS}}}rights")
    alt = etree.SubElement(rights, f"{{{RDF_NS}}}Alt")
    rights_text = etree.SubElement(alt, f"{{{RDF_NS}}}li")
    rights_text.set(f"{{{XML_NS}}}lang", "x-default")
    rights_text.text = (
        "© 2026 Yousef Bahrambeigi. Original text, figures, tables, and code "
        "examples are licensed under CC BY 4.0; identified third-party "
        "material is excluded."
    )

    for existing in description.findall(f"{{{XMP_RIGHTS_NS}}}WebStatement"):
        description.remove(existing)
    web_statement = etree.SubElement(
        description, f"{{{XMP_RIGHTS_NS}}}WebStatement"
    )
    web_statement.text = "https://creativecommons.org/licenses/by/4.0/"

    metadata_stream.set_data(
        etree.tostring(root, xml_declaration=False, encoding="UTF-8")
    )


def _prepare(source: Path, destination: Path, *, print_candidate: bool) -> None:
    reader = PdfReader(source)
    writer = PdfWriter()
    writer.pdf_header = reader.pdf_header
    writer.clone_document_from_reader(reader)

    root = writer._root_object
    root[NameObject("/Lang")] = TextStringObject("fa-IR")
    viewer_preferences = root.get(NameObject("/ViewerPreferences"))
    if viewer_preferences is not None:
        viewer_preferences = viewer_preferences.get_object()
        viewer_preferences[NameObject("/DisplayDocTitle")] = BooleanObject(True)
        if print_candidate:
            viewer_preferences[NameObject("/PickTrayByPDFSize")] = BooleanObject(True)
            viewer_preferences[NameObject("/PrintScaling")] = NameObject("/None")

    metadata = {
        key: str(value)
        for key, value in (reader.metadata or {}).items()
        if value is not None
    }
    metadata["/ModDate"] = "D:20260825000000Z"
    metadata["/Creator"] = "LibreOffice Writer; Smart Structures publication QA"
    if print_candidate:
        metadata["/Subject"] = (
            "Print candidate — printer trim, bleed, binding, and ICC profile pending"
        )
        metadata["/Keywords"] = (
            metadata.get("/Keywords", "")
            + ", release candidate, print candidate, not PDF/X"
        ).strip(", ")
    else:
        metadata["/Subject"] = (
            "Tagged digital release candidate; Smart Structures and Seismic "
            "Response Control"
        )
        metadata["/Keywords"] = (
            metadata.get("/Keywords", "")
            + ", release candidate, tagged PDF, fa-IR"
        ).strip(", ")
    writer.add_metadata(metadata)
    _replace_xmp_metadata(writer, print_candidate=print_candidate)

    if print_candidate:
        for page in writer.pages:
            page.cropbox = page.mediabox
            page.trimbox = page.mediabox
            page.bleedbox = page.mediabox

    destination.parent.mkdir(parents=True, exist_ok=True)
    with destination.open("wb") as output:
        writer.write(output)


def _validate(path: Path, *, expected_pages: int = 36) -> None:
    reader = PdfReader(path)
    root = reader.trailer["/Root"]
    if len(reader.pages) != expected_pages:
        raise ValueError(f"{path}: expected {expected_pages} pages")
    if root.get("/Lang") != "fa-IR":
        raise ValueError(f"{path}: /Lang is not fa-IR")
    if not root.get("/StructTreeRoot") or not root.get("/MarkInfo", {}).get("/Marked"):
        raise ValueError(f"{path}: tagged structure was not preserved")
    if len(reader.outline) < 1:
        raise ValueError(f"{path}: outline was not preserved")
    links = 0
    for page in reader.pages:
        for annotation in page.get("/Annots", []):
            if annotation.get_object().get("/Subtype") == "/Link":
                links += 1
    if links != 10:
        raise ValueError(f"{path}: expected 10 links, found {links}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--digital", type=Path, required=True)
    parser.add_argument("--print-candidate", type=Path, required=True)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    _prepare(args.input, args.digital, print_candidate=False)
    _prepare(args.input, args.print_candidate, print_candidate=True)
    _validate(args.digital)
    _validate(args.print_candidate)
    print(f"Prepared {args.digital}")
    print(f"Prepared {args.print_candidate}")


if __name__ == "__main__":
    main()
