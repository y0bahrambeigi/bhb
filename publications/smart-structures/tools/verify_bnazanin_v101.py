#!/usr/bin/env python3
"""Preflight checks for Smart Structures v1.0.1 typography release.

This tool does not obtain, bundle, or distribute B Nazanin.
Exit nonzero on failed automated gates; manual full-page visual QA is separate.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

def command(*args: str) -> str:
    return subprocess.check_output(args, text=True, stderr=subprocess.STDOUT)

def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()

def run() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--docx", type=Path, required=True)
    p.add_argument("--pdf", type=Path, required=True)
    p.add_argument("--report", type=Path, required=True)
    p.add_argument("--expected-pages", type=int, default=40)
    args = p.parse_args()
    checks = {}
    for name, file in (("docx", args.docx), ("pdf", args.pdf)):
        checks[f"{name}_exists"] = file.is_file() and file.stat().st_size > 0
    if shutil.which("fc-match"):
        match = command("fc-match", "-f", "%{family}", "B Nazanin").strip()
        checks["resolved_font_family"] = match
        checks["b_nazanin_resolved"] = bool(re.search(r"(?i)\bb[ -]?nazanin\b", match))
    else:
        checks["b_nazanin_resolved"] = False
        checks["font_tool_missing"] = "fc-match"
    if checks["pdf_exists"] and shutil.which("pdfinfo"):
        info = command("pdfinfo", str(args.pdf))
        found = re.search(r"^Pages:\s*(\d+)", info, re.MULTILINE)
        checks["pdf_pages"] = int(found.group(1)) if found else None
        checks["page_count_pass"] = checks["pdf_pages"] == args.expected_pages
    else:
        checks["page_count_pass"] = False
    if checks["pdf_exists"] and shutil.which("pdffonts"):
        fonts = command("pdffonts", str(args.pdf))
        checks["pdf_font_listing"] = fonts
        checks["b_nazanin_in_pdf"] = any(
            re.search(r"(?i)b[+_-]?nazanin|b[ -]?nazanin", line)
            for line in fonts.splitlines()[2:]
        )
    else:
        checks["b_nazanin_in_pdf"] = False
    if checks["docx_exists"]:
        import zipfile
        with zipfile.ZipFile(args.docx) as package:
            checks["docx_valid_zip"] = package.testzip() is None
            xml = package.read("word/document.xml").decode("utf-8")
            checks["b_nazanin_referenced"] = "B Nazanin" in xml or any(
                "B Nazanin" in package.read(name).decode("utf-8")
                for name in package.namelist() if name == "word/styles.xml"
            )
    else:
        checks["docx_valid_zip"] = checks["b_nazanin_referenced"] = False
    for name, file in (("docx", args.docx), ("pdf", args.pdf)):
        if checks[f"{name}_exists"]:
            checks[f"{name}_sha256"] = sha256(file)
    required = ["docx_exists", "pdf_exists", "b_nazanin_resolved",
                "page_count_pass", "b_nazanin_in_pdf",
                "docx_valid_zip", "b_nazanin_referenced"]
    passed = all(checks.get(k) is True for k in required)
    checks["automated_gate_pass"] = passed
    checks["manual_qa_required"] = (
        "Inspect all pages, RTL flow, mathematical content, tables, "
        "figure captions, headers/footers, and confirm embedding rights."
    )
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(checks, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Automated gate: {'PASS' if passed else 'NO-GO'}; report: {args.report}")
    return 0 if passed else 1

if __name__ == "__main__":
    sys.exit(run())
