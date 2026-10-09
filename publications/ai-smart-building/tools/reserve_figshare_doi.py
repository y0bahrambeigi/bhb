#!/usr/bin/env python3
"""Create or reuse a private Figshare BOOK draft and reserve its DOI.

Scope: DOI reservation ONLY. Do not upload assets or call /publish.
This workflow runs in the author's trusted GitHub Actions environment.
"""
import json
import os
import pathlib
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://api.figshare.com/v2"
TITLE = "AI-Enabled Smart Building Monitoring — Persian Digital Book (Prepublication)"
AUTHOR_ID = 24753196  # Verified active Figshare author of Yousef Bahrambeigi
KEYWORDS = [
    "structural health monitoring", "smart buildings", "artificial intelligence",
    "digital twin", "building sensors", "IoT", "civil engineering",
    "predictive maintenance", "Persian", "academic book",
]
DESCRIPTION = (
    "Private prepublication record for the Persian technical book "
    "«پایش هوشمند ساختمان با هوش مصنوعی», by Yousef Bahrambeigi "
    "(یوسف بهرام بیگی). It covers structural health monitoring (SHM), "
    "smart-building systems, machine learning, sensors, building automation, "
    "digital twins and predictive maintenance. The work is an internally reviewed "
    "educational manuscript, NOT independently peer-reviewed nor validated "
    "with in-service building data. Assets, exact edition, font embedding and "
    "the public license have not yet passed final release gates. "
    "This draft/DOI reservation must not be cited as a published book."
)
REPORT = pathlib.Path("publications/ai-smart-building/FIGSHARE_RESERVATION.json")


def request(method, endpoint, payload=None):
    token = os.environ.get("FIGSHARE_TOKEN", "").strip()
    if not token:
        raise RuntimeError("FIGSHARE_TOKEN secret not configured: cannot reserve DOI")
    url = endpoint if endpoint.startswith("http") else API + "/" + endpoint.lstrip("/")
    headers = {"Authorization": "token " + token, "Accept": "application/json",
               "User-Agent": "BHB-AI-Smart-Building-DOI-Reservation/1.0"}
    body = None
    if payload is not None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=45) as response:
            raw = response.read()
            content = json.loads(raw.decode("utf-8")) if raw else {}
            return response.status, dict(response.headers), content
    except urllib.error.HTTPError as exc:
        details = exc.read().decode("utf-8", "replace")[:900]
        raise RuntimeError(f"{method} {url} HTTP {exc.code}: {details}") from None


def owned_items():
    found = []
    for offset in (0, 100, 200):
        _, _, page = request("GET", f"account/articles?offset={offset}&limit=100")
        if not isinstance(page, list):
            raise RuntimeError("Unexpected account article listing shape")
        found += page
        if len(page) < 100:
            break
    return found


def matching_private():
    matches = [item for item in owned_items() if item.get("title") == TITLE]
    if len(matches) > 1:
        raise RuntimeError("Multiple exact matching drafts. Manual resolution required.")
    if not matches:
        return None
    entry = matches[0]
    if entry.get("status") == "public" or entry.get("published_date"):
        raise RuntimeError("Matching draft is already public; refusing new reservation.")
    return int(entry["id"])


def create_record():
    item = {
        "title": TITLE, "description": DESCRIPTION,
        "defined_type": "book",
        "authors": [{"id": AUTHOR_ID}],
        "categories": [26371],
        "tags": KEYWORDS,
        "references": ["https://github.com/y0bahrambeigi/bhb/tree/main/publications/ai-smart-building"],
    }
    code, headers, response = request("POST", "account/articles", item)
    if code != 201:
        raise RuntimeError(f"Unexpected create status: {code}")
    location = response.get("location") or headers.get("Location") or headers.get("location") or ""
    match = re.search(r"/account/articles/(\d+)", location)
    if not match:
        raise RuntimeError("Record created but no article ID returned: inspect account manually")
    return int(match.group(1))


def main():
    article_id = matching_private()
    is_new = article_id is None
    if is_new:
        article_id = create_record()
    # Figshare auto-adds account authors sometimes; use verified existing ID only.
    request("PUT", f"account/articles/{article_id}/authors", {"authors": [{"id": AUTHOR_ID}]})
    _, _, authors = request("GET", f"account/articles/{article_id}/authors")
    ids = [int(a.get("id", -1)) for a in authors]
    if ids != [AUTHOR_ID]:
        raise RuntimeError(f"Author list did not verify as one author {AUTHOR_ID}: {ids}")
    _, _, item = request("GET", f"account/articles/{article_id}")
    if item.get("is_public") or item.get("status") == "public":
        raise RuntimeError("Refusing to reserve against a published item")
    _, _, result = request("POST", f"account/articles/{article_id}/reserve_doi")
    doi = str(result.get("doi") or "").strip()
    if not doi.startswith("10."):
        raise RuntimeError("No valid reserved DOI received from Figshare")
    report = {
        "article_id": article_id,
        "status": "reserved-unpublished",
        "doi": doi,
        "doi_url": "https://doi.org/" + doi,
        "figshare_private_url": f"https://figshare.com/account/articles/{article_id}",
        "title": TITLE,
        "author": "Yousef Bahrambeigi",
        "new_private_record": is_new,
        "files_uploaded": False,
        "license_selected": False,
        "published": False,
        "public_doi_resolves": False,
        "notes": "Reserved DOI is not a published/active DOI; do not cite as published.",
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Figshare draft ID:", article_id)
    print("DOI reserved (NOT YET PUBLIC):", doi)
    print("Publication gate: finalized fonts/license/assets and peer-review caveats")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("FIGSHARE_RESERVATION_FAILED:", exc, file=sys.stderr)
        sys.exit(1)
