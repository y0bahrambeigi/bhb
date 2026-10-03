#!/usr/bin/env python3
"""Archive Smart Structures v1.0.0-rc1 on Figshare.

Uses FIGSHARE_TOKEN from the environment. The token is never printed or written.
This creates an archival DOI for the release candidate, not the final book v1.0.0.
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
TITLE = "Smart Structures and Seismic Response Control — Digital Book v1.0.0-rc1 (Persian)"
DESCRIPTION = (
    "Archival research object for release candidate 1 of the Persian academic book "
    "«سازه‌های هوشمند و کنترل پاسخ لرزه‌ای» by Yousef Bahrambeigi. "
    "The package contains the tagged digital PDF, editable DOCX source, citation "
    "metadata, CC BY 4.0 license text, and SHA-256 integrity manifest. "
    "The associated GitHub repository also provides an interactive offline-capable "
    "PWA. This DOI identifies v1.0.0-rc1 only; final v1.0.0 is a separate milestone."
)
AUTHOR = "Yousef Bahrambeigi"
ORCID_URL = "https://orcid.org/0000-0002-3421-8679"
RELEASE_PAGE = "https://github.com/y0bahrambeigi/bhb/releases/tag/smart-structures-v1.0.0-rc1"
APP_URL = "https://y0bahrambeigi.github.io/bhb/publications/smart-structures/webapp/"
TAGS = [
    "smart structures",
    "structural control",
    "seismic response control",
    "civil engineering",
    "base isolation",
    "active control",
    "digital twin",
    "Persian",
    "academic book",
    "PWA",
]
ASSET_NAMES = [
    "Smart_Structures_Yousef_Bahrambeigi_v1.0.0-rc1_digital.pdf",
    "Smart_Structures_Yousef_Bahrambeigi_v1.0.0-rc1_source.docx",
    "SHA256SUMS",
    "CITATION.cff",
    "CITATION.bib",
    "LICENSE.md",
]


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
    data = binary
    if payload is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    response = requests.request(method, url, headers=headers, data=data, timeout=180)
    if response.status_code >= 400:
        fail(f"Figshare {method} {url} -> {response.status_code}: {response.text[:1200]}")
    return response


def j(response: requests.Response) -> Any:
    return response.json() if response.content else None


def get_category_ids() -> list[int]:
    categories = j(request("GET", "account/categories")) or []
    if not categories:
        fail("Figshare returned no account categories.")

    parent_ids = {
        int(x["parent_id"])
        for x in categories
        if x.get("parent_id") not in (None, 0, "0")
    }
    leaves = [x for x in categories if int(x.get("id", 0)) not in parent_ids]
    pool = leaves or categories

    def label(x: dict[str, Any]) -> str:
        return str(x.get("title") or x.get("name") or "").strip()

    def score(x: dict[str, Any]) -> tuple[int, int]:
        name = label(x).casefold()
        value = 0
        if name == "structural engineering":
            value += 120
        if name == "civil engineering":
            value += 110
        if "structural" in name:
            value += 90
        if "civil" in name and "engineering" in name:
            value += 80
        elif "engineering" in name:
            value += 40
        return value, -int(x.get("id", 0))

    chosen = max(pool, key=score)
    if score(chosen)[0] <= 0:
        chosen = pool[0]
    print(f"Selected category: {label(chosen)} (id={chosen['id']})")
    return [int(chosen["id"])]


def get_ccby_license_id() -> int:
    licenses = j(request("GET", "licenses", auth=False)) or []
    ranked = []
    for item in licenses:
        name = str(item.get("name", "")).casefold()
        url = str(item.get("url", "")).casefold()
        score = 0
        if "creative commons attribution 4.0" in name:
            score += 100
        if "cc by 4.0" in name or "cc-by-4.0" in name:
            score += 90
        if "creativecommons.org/licenses/by/4.0" in url:
            score += 100
        if score:
            ranked.append((score, item))
    if not ranked:
        fail("CC BY 4.0 license was not found in Figshare license catalogue.")
    item = max(ranked, key=lambda x: x[0])[1]
    value = item.get("value", item.get("id"))
    if value is None:
        fail("Figshare CC BY license entry has no id/value.")
    return int(value)


def find_existing() -> dict[str, Any] | None:
    results = j(request(
        "POST",
        "account/articles/search",
        payload={"search_for": TITLE, "page_size": 100},
    )) or []
    for item in results:
        if str(item.get("title", "")).strip() == TITLE:
            article_id = int(item["id"])
            return j(request("GET", f"account/articles/{article_id}"))
    return None


def create_or_update() -> dict[str, Any]:
    payload = {
        "title": TITLE,
        "description": DESCRIPTION,
        "tags": TAGS,
        "references": [RELEASE_PAGE, APP_URL, ORCID_URL],
        "categories": get_category_ids(),
        "authors": [{"name": AUTHOR}],
        "defined_type": "book",
        "license": get_ccby_license_id(),
    }
    existing = find_existing()
    if existing:
        article_id = int(existing["id"])
        if existing.get("published_date"):
            print(f"Existing published item: {article_id}")
            return existing
        request("PUT", f"account/articles/{article_id}", payload=payload)
        return j(request("GET", f"account/articles/{article_id}"))

    response = request("POST", "account/articles", payload=payload)
    location = response.headers.get("Location")
    if not location:
        body = j(response)
        location = body.get("location") if isinstance(body, dict) else None
    if not location:
        fail("Figshare did not return new item location.")
    return j(request("GET", location))


def md5_size(path: pathlib.Path) -> tuple[str, int]:
    h = hashlib.md5()
    size = 0
    with path.open("rb") as f:
        while chunk := f.read(1024 * 1024):
            h.update(chunk)
            size += len(chunk)
    return h.hexdigest(), size


def upload_file(article_id: int, path: pathlib.Path) -> None:
    current = j(request("GET", f"account/articles/{article_id}/files")) or []
    if any(x.get("name") == path.name for x in current):
        print(f"Already present: {path.name}")
        return

    md5, size = md5_size(path)
    response = request(
        "POST",
        f"account/articles/{article_id}/files",
        payload={"md5": md5, "size": size, "name": path.name},
    )
    location = response.headers.get("Location")
    if not location:
        body = j(response)
        location = body.get("location") if isinstance(body, dict) else None
    if not location:
        fail(f"No upload location for {path.name}")

    info = j(request("GET", location))
    upload_url = info["upload_url"]
    parts = j(request("GET", upload_url, auth=False))["parts"]

    with path.open("rb") as stream:
        for part in parts:
            start = int(part["startOffset"])
            end = int(part["endOffset"])
            stream.seek(start)
            data = stream.read(end - start + 1)
            request("PUT", f"{upload_url}/{part['partNo']}", binary=data, auth=False)

    request("POST", f"account/articles/{article_id}/files/{info['id']}")
    print(f"Uploaded: {path.name}")


def verify_primary_checksums(directory: pathlib.Path) -> None:
    manifest = (directory / "SHA256SUMS").read_text(encoding="utf-8").splitlines()
    expected: dict[str, str] = {}
    for line in manifest:
        if not line.strip():
            continue
        digest, name = line.split(maxsplit=1)
        expected[name.strip()] = digest.strip()

    required = ASSET_NAMES[:2]
    for name in required:
        path = directory / name
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        if expected.get(name) != digest:
            fail(f"SHA-256 mismatch for {name}: expected {expected.get(name)}, got {digest}")
        print(f"SHA-256 verified: {name} {digest}")


def reserve_and_publish(article: dict[str, Any]) -> tuple[int, str, str]:
    article_id = int(article["id"])
    if article.get("published_date"):
        doi = str(article.get("doi") or "")
        public_url = str(article.get("url_public_api") or article.get("url") or "")
        return article_id, doi, public_url

    reserved = j(request("POST", f"account/articles/{article_id}/reserve_doi"))
    doi = str(reserved.get("doi", "")).strip()
    if not doi:
        fail("Figshare did not return a reserved DOI.")
    print(f"Reserved DOI: {doi}")

    response = request("POST", f"account/articles/{article_id}/publish")
    location = response.headers.get("Location", "")
    public = j(request("GET", f"articles/{article_id}", auth=False))
    public_doi = str(public.get("doi") or doi)
    public_url = str(public.get("url_public_api") or public.get("url") or location)
    print(f"FIGSHARE_ARTICLE_ID={article_id}")
    print(f"FIGSHARE_DOI={public_doi}")
    print(f"FIGSHARE_URL={public_url}")
    return article_id, public_doi, public_url


def main() -> None:
    directory = pathlib.Path(os.environ.get("SMART_STRUCTURES_ASSET_DIR", "figshare_upload"))
    if not directory.is_dir():
        fail(f"Asset directory not found: {directory}")
    for name in ASSET_NAMES:
        if not (directory / name).is_file():
            fail(f"Missing asset: {name}")

    verify_primary_checksums(directory)
    article = create_or_update()
    article_id = int(article["id"])

    if not article.get("published_date"):
        for name in ASSET_NAMES:
            upload_file(article_id, directory / name)

    article_id, doi, url = reserve_and_publish(article)
    result = {
        "article_id": article_id,
        "doi": doi,
        "doi_url": f"https://doi.org/{doi}" if doi else "",
        "public_url": url,
        "release_tag": "smart-structures-v1.0.0-rc1",
        "status": "published" if doi else "unknown",
    }
    pathlib.Path("figshare_result.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8"
    )


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise
