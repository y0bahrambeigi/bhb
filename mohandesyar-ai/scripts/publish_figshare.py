#!/usr/bin/env python3
"""Publish the frozen MohandesYar AI 2.0.0 release to Figshare.

Authentication is supplied only through the FIGSHARE_TOKEN environment
variable. The token is never written to disk or printed.
"""

from __future__ import annotations

import hashlib
import json
import os
import pathlib
import sys
import tempfile
from typing import Any

import requests

BASE = "https://api.figshare.com/v2"
TITLE = (
    "MohandesYar AI 2.0: An Offline-First Persian PWA for Civil Engineering "
    "Field Documentation, Evidence Integrity, and Reporting"
)
DESCRIPTION = (
    "MohandesYar AI 2.0 is an open-source, offline-first progressive web "
    "application for Persian right-to-left civil-engineering field "
    "documentation. It stores project records and original image/video "
    "evidence locally in IndexedDB, records optional geolocation and SHA-256 "
    "integrity metadata, supports backup and restoration, and generates "
    "multi-page Persian A4 reports. The public release is a static web "
    "application with no runtime server dependency and does not transmit "
    "project data to an external AI inference service. The software is "
    "intended for research, teaching, and practical evaluation of local-first "
    "engineering documentation workflows."
)
AUTHOR = "Yousef Bahrambeigi"
ORCID_URL = "https://orcid.org/0000-0002-3421-8679"
RELEASE_URL = (
    "https://github.com/y0bahrambeigi/bhb/releases/download/"
    "mohandesyar-ai-v2.0.0/mohandesyar-ai-2.0.0.zip"
)
RELEASE_PAGE = (
    "https://github.com/y0bahrambeigi/bhb/releases/tag/"
    "mohandesyar-ai-v2.0.0"
)
APP_URL = "https://y0bahrambeigi.github.io/bhb/mohandesyar-ai/"
EXPECTED_SHA256 = "9635e7fc37fb4fa1dca6be169bbc678ae5c6d45113b4cb6cde9e4f3460f25173"
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
    "software engineering",
    "technical reporting",
]
CATEGORY_NAMES = ["Civil engineering"]


def fail(message: str) -> None:
    raise RuntimeError(message)


def auth_headers() -> dict[str, str]:
    token = os.environ.get("FIGSHARE_TOKEN", "").strip()
    if not token:
        fail(
            "FIGSHARE_TOKEN is not configured. Add it as a GitHub Actions "
            "repository secret before running this publication workflow."
        )
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
        timeout=120,
    )
    if response.status_code >= 400:
        body = response.text[:1200]
        fail(f"Figshare request failed: {method} {url} -> {response.status_code}: {body}")
    return response


def json_response(response: requests.Response) -> Any:
    if not response.content:
        return None
    return response.json()


def get_categories() -> list[int]:
    categories = json_response(request("GET", "categories", auth=False))
    selected: list[int] = []
    for target in CATEGORY_NAMES:
        match = next(
            (item for item in categories if str(item.get("title", "")).casefold() == target.casefold()),
            None,
        )
        if match is None:
            match = next(
                (item for item in categories if str(item.get("name", "")).casefold() == target.casefold()),
                None,
            )
        if match is None:
            fail(f"Required Figshare category not found: {target}")
        selected.append(int(match["id"]))
    return selected


def get_mit_license_id() -> int:
    licenses = json_response(request("GET", "licenses", auth=False))
    candidates = []
    for item in licenses:
        name = str(item.get("name", "")).casefold()
        if name == "mit" or "mit license" in name:
            candidates.append(item)
    if not candidates:
        fail("MIT license was not found in the Figshare license catalogue.")
    value = candidates[0].get("value", candidates[0].get("id"))
    if value is None:
        fail("Figshare MIT license entry did not expose an id/value.")
    return int(value)


def find_existing() -> dict[str, Any] | None:
    response = request(
        "POST",
        "account/articles/search",
        payload={"search_for": TITLE, "page_size": 100},
    )
    for item in json_response(response) or []:
        if str(item.get("title", "")).strip() == TITLE:
            article_id = int(item["id"])
            detail = json_response(request("GET", f"account/articles/{article_id}"))
            return detail
    return None


def create_or_update_article() -> dict[str, Any]:
    license_id = get_mit_license_id()
    payload = {
        "title": TITLE,
        "description": DESCRIPTION,
        "tags": TAGS,
        "references": [RELEASE_PAGE, APP_URL, ORCID_URL],
        "authors": [{"name": AUTHOR}],
        "defined_type": "software",
        "license": license_id,
    }

    existing = find_existing()
    if existing:
        article_id = int(existing["id"])
        if existing.get("published_date"):
            doi = existing.get("doi")
            print(f"Existing published Figshare item found: {article_id}")
            if doi:
                print(f"FIGSHARE_DOI={doi}")
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
    return json_response(request("GET", location))


def download_release(directory: pathlib.Path) -> pathlib.Path:
    destination = directory / "mohandesyar-ai-2.0.0.zip"
    with requests.get(RELEASE_URL, stream=True, timeout=180) as response:
        response.raise_for_status()
        with destination.open("wb") as handle:
            for chunk in response.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    handle.write(chunk)

    digest = hashlib.sha256(destination.read_bytes()).hexdigest()
    if digest != EXPECTED_SHA256:
        fail(f"Release SHA-256 mismatch: expected {EXPECTED_SHA256}, got {digest}")
    print(f"Release SHA-256 verified: {digest}")
    return destination


def md5_size(path: pathlib.Path) -> tuple[str, int]:
    md5 = hashlib.md5()
    size = 0
    with path.open("rb") as handle:
        while True:
            chunk = handle.read(1024 * 1024)
            if not chunk:
                break
            md5.update(chunk)
            size += len(chunk)
    return md5.hexdigest(), size


def upload_file(article_id: int, path: pathlib.Path) -> None:
    current = json_response(request("GET", f"account/articles/{article_id}/files")) or []
    if any(item.get("name") == path.name for item in current):
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
            request(
                "PUT",
                f"{upload_url}/{part['partNo']}",
                binary=data,
                auth=False,
            )

    request("POST", f"account/articles/{article_id}/files/{info['id']}")
    print(f"Uploaded to Figshare: {path.name}")


def reserve_and_publish(article: dict[str, Any], publish: bool) -> tuple[str, str]:
    article_id = int(article["id"])
    if article.get("published_date"):
        doi = str(article.get("doi") or "")
        url = str(article.get("url_public_api") or article.get("url") or "")
        return doi, url

    reserved = json_response(request("POST", f"account/articles/{article_id}/reserve_doi"))
    doi = str(reserved.get("doi", "")).strip()
    if not doi:
        fail("Figshare did not return a reserved DOI.")
    print(f"Reserved DOI: {doi}")

    if not publish:
        print("Draft prepared and DOI reserved, but publication was intentionally skipped.")
        return doi, ""

    response = request("POST", f"account/articles/{article_id}/publish")
    location = response.headers.get("Location", "")
    public = json_response(request("GET", f"articles/{article_id}", auth=False))
    public_doi = str(public.get("doi") or doi)
    public_url = str(public.get("url_public_api") or public.get("url") or location)
    print(f"Published Figshare item: {article_id}")
    print(f"FIGSHARE_DOI={public_doi}")
    print(f"FIGSHARE_URL={public_url}")
    return public_doi, public_url


def main() -> None:
    publish = os.environ.get("FIGSHARE_PUBLISH", "true").strip().lower() in {"1", "true", "yes"}

    article = create_or_update_article()
    article_id = int(article["id"])

    if article.get("published_date"):
        doi = str(article.get("doi") or "")
        print(f"Already published; no new version created. FIGSHARE_DOI={doi}")
        return

    with tempfile.TemporaryDirectory() as tmp:
        directory = pathlib.Path(tmp)
        archive = download_release(directory)
        checksum = directory / f"{archive.name}.sha256"
        checksum.write_text(f"{EXPECTED_SHA256}  {archive.name}\n", encoding="utf-8")
        upload_file(article_id, archive)
        upload_file(article_id, checksum)

    doi, url = reserve_and_publish(article, publish)
    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a", encoding="utf-8") as handle:
            handle.write("## MohandesYar Figshare DOI\n\n")
            handle.write(f"- Article ID: `{article_id}`\n")
            handle.write(f"- DOI: `{doi}`\n")
            if url:
                handle.write(f"- Public API/landing reference: {url}\n")
            handle.write(f"- Release SHA-256: `{EXPECTED_SHA256}`\n")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise
