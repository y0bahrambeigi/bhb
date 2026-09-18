#!/usr/bin/env python3
"""Publish the MohandesYar AI 2.0 technical report to Figshare.

This creates a research object distinct from the MohandesYar AI 2.0.0 software
archive. Authentication is supplied only through FIGSHARE_TOKEN. The token is
never written to disk or printed.
"""

from __future__ import annotations

import hashlib
import json
import os
import pathlib
import sys
from typing import Any

import requests

BASE = "https://api.figshare.com/v2"
TITLE = (
    "MohandesYar AI 2.0: An Offline-First Persian PWA for Civil Engineering "
    "Field Documentation, Evidence Integrity, and Reporting"
)
REPORT_NUMBER = "MYAI-TR-2026-02"
AUTHOR = "Yousef Bahrambeigi"
AFFILIATION = "Civil Engineering, Islamic Azad University, Mahabad Branch, Mahabad, Iran"
ORCID_URL = "https://orcid.org/0000-0002-3421-8679"
SOFTWARE_DOI = "10.6084/m9.figshare.33511795.v1"
SOFTWARE_DOI_URL = f"https://doi.org/{SOFTWARE_DOI}"
REPORT_PAGE = "https://y0bahrambeigi.github.io/bhb/mohandesyar-ai/publication/"
REPOSITORY_URL = "https://github.com/y0bahrambeigi/bhb/tree/main/mohandesyar-ai"
PDF_PATH = pathlib.Path("mohandesyar-ai/publication/mohandesyar-ai-v2-technical-report.pdf")
EXPECTED_SHA256 = "c938de488c8b1e70eb8c7a53c38f30d5e719effda6256b5599f18c5ae8453e16"
LICENSE_NAME = "CC BY 4.0"
DEFINED_TYPE = "preprint"
TAGS = [
    "civil engineering",
    "field documentation",
    "progressive web application",
    "offline-first",
    "Persian RTL",
    "IndexedDB",
    "SHA-256",
    "geolocation",
    "evidence integrity",
    "technical report",
    "research software",
]
DESCRIPTION = f"""<p><strong>Technical report {REPORT_NUMBER}</strong></p>
<p>MohandesYar AI 2.0 is an offline-first progressive web application designed
for Persian right-to-left field documentation in civil engineering projects.
The public edition supports multiple project dossiers, storage of original image
and video evidence in the browser, optional geolocation capture, SHA-256
integrity metadata, project backup and restoration, and generation of
multi-page Persian A4 reports.</p>
<p>The architecture follows a local-first model: project data and evidence
remain in IndexedDB on the user's device and are not transmitted to the public
hosting service. Release validation combines static contract checks with
browser-based end-to-end tests covering persistence, evidence hashing, backup
and restore, report rendering, service-worker updates, IndexedDB retention, and
offline relaunch.</p>
<p><strong>Author affiliation:</strong> {AFFILIATION}</p>
<p><strong>ORCID:</strong> {ORCID_URL}</p>
<p><strong>First public availability of the report:</strong> 2026-08-25</p>
<p>This technical report is a research object distinct from the software
archive. The related MohandesYar AI 2.0.0 software is archived separately at
{SOFTWARE_DOI_URL}.</p>"""


def fail(message: str) -> None:
    raise RuntimeError(message)


def auth_headers() -> dict[str, str]:
    token = os.environ.get("FIGSHARE_TOKEN", "").strip()
    if not token:
        fail("FIGSHARE_TOKEN is not configured.")
    return {"Authorization": f"token {token}"}


def request(
    method: str,
    path_or_url: str,
    *,
    payload: dict[str, Any] | None = None,
    binary: bytes | None = None,
    auth: bool = True,
) -> requests.Response:
    url = path_or_url if path_or_url.startswith("http") else f"{BASE}/{path_or_url.lstrip('/')}"
    headers: dict[str, str] = {}
    if auth:
        headers.update(auth_headers())
    if payload is not None:
        headers["Content-Type"] = "application/json"
    response = requests.request(
        method,
        url,
        headers=headers,
        data=(json.dumps(payload) if payload is not None else binary),
        timeout=180,
    )
    if response.status_code >= 400:
        fail(f"Figshare request failed: {method} {url} -> {response.status_code}: {response.text[:1500]}")
    return response


def json_response(response: requests.Response) -> Any:
    return response.json() if response.content else None


def verify_pdf() -> tuple[str, int]:
    if not PDF_PATH.exists():
        fail(f"Technical-report PDF is missing: {PDF_PATH}")
    h = hashlib.sha256()
    size = 0
    with PDF_PATH.open("rb") as handle:
        while True:
            chunk = handle.read(1024 * 1024)
            if not chunk:
                break
            h.update(chunk)
            size += len(chunk)
    digest = h.hexdigest()
    if digest != EXPECTED_SHA256:
        fail(f"Technical-report SHA-256 mismatch: expected {EXPECTED_SHA256}, got {digest}")
    print(f"Technical-report SHA-256 verified: {digest}")
    return digest, size


def get_license_id() -> int:
    licenses = json_response(request("GET", "licenses", auth=False)) or []
    for item in licenses:
        if str(item.get("name", "")).strip().casefold() == LICENSE_NAME.casefold():
            value = item.get("value", item.get("id"))
            if value is None:
                break
            return int(value)
    fail(f"Figshare license not found: {LICENSE_NAME}")


def get_categories() -> list[int]:
    categories = json_response(request("GET", "account/categories")) or []
    if not categories:
        fail("Figshare returned no account-specific categories.")

    parent_ids = {
        int(item["parent_id"])
        for item in categories
        if item.get("parent_id") not in (None, 0, "0")
    }
    leaves = [item for item in categories if int(item.get("id", 0)) not in parent_ids]
    candidates = leaves or categories

    def label(item: dict[str, Any]) -> str:
        return str(item.get("title") or item.get("name") or "").strip()

    def score(item: dict[str, Any]) -> tuple[int, int]:
        name = label(item).casefold()
        value = 0
        if name == "structural engineering":
            value += 120
        if name == "civil engineering":
            value += 110
        if "structural" in name:
            value += 80
        if "civil" in name and "engineering" in name:
            value += 75
        elif "engineering" in name:
            value += 50
        return value, -int(item.get("id", 0))

    chosen = max(candidates, key=score)
    if score(chosen)[0] <= 0:
        chosen = candidates[0]
    print(f"Selected Figshare category: {label(chosen)} (id={chosen['id']})")
    return [int(chosen["id"])]


def find_existing() -> dict[str, Any] | None:
    results = json_response(request(
        "POST",
        "account/articles/search",
        payload={"search_for": TITLE, "page_size": 100},
    )) or []

    for item in results:
        if str(item.get("title", "")).strip() != TITLE:
            continue
        article_id = int(item["id"])
        detail = json_response(request("GET", f"account/articles/{article_id}"))
        defined_type = str(detail.get("defined_type") or "").strip().casefold()
        description = str(detail.get("description") or "")
        if defined_type == DEFINED_TYPE and REPORT_NUMBER in description:
            return detail
    return None


def create_or_update() -> dict[str, Any]:
    payload = {
        "title": TITLE,
        "description": DESCRIPTION,
        "tags": TAGS,
        "references": [
            SOFTWARE_DOI_URL,
            REPORT_PAGE,
            REPOSITORY_URL,
            ORCID_URL,
        ],
        "categories": get_categories(),
        "authors": [{"name": AUTHOR}],
        "defined_type": DEFINED_TYPE,
        "license": get_license_id(),
    }

    existing = find_existing()
    if existing:
        article_id = int(existing["id"])
        if existing.get("published_date"):
            print(f"Existing published technical-report item found: {article_id}")
            return existing
        request("PUT", f"account/articles/{article_id}", payload=payload)
        return json_response(request("GET", f"account/articles/{article_id}"))

    response = request("POST", "account/articles", payload=payload)
    location = response.headers.get("Location")
    if not location:
        body = json_response(response)
        location = body.get("location") if isinstance(body, dict) else None
    if not location:
        fail("Figshare did not return the new article location.")
    article = json_response(request("GET", location))
    print(f"Created Figshare technical-report draft: {article['id']}")
    return article


def md5_size(path: pathlib.Path) -> tuple[str, int]:
    h = hashlib.md5()
    size = 0
    with path.open("rb") as handle:
        while True:
            chunk = handle.read(1024 * 1024)
            if not chunk:
                break
            h.update(chunk)
            size += len(chunk)
    return h.hexdigest(), size


def upload_file(article_id: int, path: pathlib.Path) -> None:
    current = json_response(request("GET", f"account/articles/{article_id}/files")) or []
    for item in current:
        if item.get("name") == path.name:
            print(f"File already present on Figshare draft: {path.name}")
            return

    md5, size = md5_size(path)
    response = request(
        "POST",
        f"account/articles/{article_id}/files",
        payload={"md5": md5, "size": size, "name": path.name},
    )
    location = response.headers.get("Location")
    if not location:
        body = json_response(response)
        location = body.get("location") if isinstance(body, dict) else None
    if not location:
        fail(f"Figshare did not return upload location for {path.name}")

    info = json_response(request("GET", location))
    upload_url = info["upload_url"]
    parts = json_response(request("GET", upload_url, auth=False))["parts"]

    with path.open("rb") as stream:
        for part in parts:
            start = int(part["startOffset"])
            end = int(part["endOffset"])
            stream.seek(start)
            data = stream.read(end - start + 1)
            request("PUT", f"{upload_url}/{part['partNo']}", binary=data, auth=False)

    request("POST", f"account/articles/{article_id}/files/{info['id']}")
    print(f"Uploaded to Figshare: {path.name}")


def reserve_and_publish(article: dict[str, Any]) -> tuple[int, str, str]:
    article_id = int(article["id"])
    if article.get("published_date"):
        doi = str(article.get("doi") or "")
        url = str(article.get("url_public_api") or article.get("url") or "")
        return article_id, doi, url

    reserved = json_response(request("POST", f"account/articles/{article_id}/reserve_doi"))
    doi = str(reserved.get("doi") or "").strip()
    if not doi:
        fail("Figshare did not return a reserved DOI.")
    print(f"Reserved technical-report DOI: {doi}")

    request("POST", f"account/articles/{article_id}/publish")
    public = json_response(request("GET", f"articles/{article_id}", auth=False))
    public_doi = str(public.get("doi") or doi)
    public_url = str(public.get("url_public_api") or public.get("url") or "")
    print(f"Published Figshare technical report: {article_id}")
    print(f"TECHNICAL_REPORT_FIGSHARE_DOI={public_doi}")
    print(f"TECHNICAL_REPORT_FIGSHARE_URL={public_url}")
    return article_id, public_doi, public_url


def main() -> None:
    verify_pdf()
    article = create_or_update()
    article_id = int(article["id"])

    if not article.get("published_date"):
        upload_file(article_id, PDF_PATH)
        checksum_path = pathlib.Path("/tmp") / f"{PDF_PATH.name}.sha256"
        checksum_path.write_text(f"{EXPECTED_SHA256}  {PDF_PATH.name}\n", encoding="utf-8")
        upload_file(article_id, checksum_path)

    article_id, doi, url = reserve_and_publish(article)

    if not doi:
        fail("Published technical-report record did not expose a DOI.")

    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a", encoding="utf-8") as handle:
            handle.write("## MohandesYar AI 2.0 technical-report DOI\n\n")
            handle.write(f"- Figshare item ID: `{article_id}`\n")
            handle.write(f"- DOI: `{doi}`\n")
            if url:
                handle.write(f"- Public record: {url}\n")
            handle.write(f"- Resource type: `{DEFINED_TYPE}`\n")
            handle.write(f"- License: `{LICENSE_NAME}`\n")
            handle.write(f"- PDF SHA-256: `{EXPECTED_SHA256}`\n")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise
