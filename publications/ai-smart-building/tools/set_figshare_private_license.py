#!/usr/bin/env python3
"""Apply author-approved CC BY 4.0 to Figshare private draft only.

Never publishes or uploads the book. Idempotent, safety gated.
"""
import json, os, pathlib, re, sys, urllib.request, urllib.error

API = "https://api.figshare.com/v2"
ARTICLE_ID = 34322970
AUTHOR_ID = 24753196
RESERVED_DOI = "10.6084/m9.figshare.34322970"
TITLE = "AI-Enabled Smart Building Monitoring — Persian Digital Book v1.0"
DESCRIPTION = (
    "Persian digital educational book «پایش هوشمند ساختمان با هوش مصنوعی» "
    "by Yousef Bahrambeigi (یوسف بهرام بیگی), covering structural health "
    "monitoring (SHM), AI, vibration sensors, IoT, BIM, digital twins and "
    "predictive maintenance. The 31-page A4 PDF is typeset right-to-left "
    "with embedded B Nazanin subset. The source DOCX, original cover, "
    "reproducible educational code and SHA-256 manifest will accompany the "
    "final published version. All educational data are synthetic; independent "
    "peer review and real-building field validation are not claimed. "
    "License for original author-owned text, figures and educational examples: "
    "Creative Commons Attribution 4.0 International (CC BY 4.0). "
    "Third-party materials, including the separately supplied font file, are "
    "excluded from the license. THIS RECORD IS PRIVATE UNTIL ASSETS ARE VERIFIED."
)
TAGS = [
    "structural health monitoring", "smart buildings", "artificial intelligence",
    "digital twin", "building sensors", "IoT", "civil engineering",
    "predictive maintenance", "Persian", "academic book"
]
OUT = pathlib.Path("publications/ai-smart-building/FIGSHARE_METADATA_CC_BY_4_0.json")

def req(method, endpoint, obj=None, auth=True):
    url = endpoint if endpoint.startswith("http") else API+"/"+endpoint.lstrip("/")
    headers={"Accept":"application/json","User-Agent":"BHB-Book-Metadata-QA/1.0"}
    if auth:
        token=os.environ.get("FIGSHARE_TOKEN","").strip()
        if not token: raise RuntimeError("Missing FIGSHARE_TOKEN")
        headers["Authorization"]="token "+token
    data=None
    if obj is not None:
        headers["Content-Type"]="application/json"
        data=json.dumps(obj,ensure_ascii=False).encode()
    try:
        with urllib.request.urlopen(urllib.request.Request(url,method=method,data=data,headers=headers),timeout=90) as r:
            raw=r.read()
            return json.loads(raw.decode()) if raw else {}
    except urllib.error.HTTPError as err:
        raise RuntimeError(f"{method} {url} HTTP {err.code}: {err.read()[:500]!r}") from None

def ccby_id():
    found=req("GET","licenses",auth=False)
    for item in found:
        name=str(item.get("name","")).lower()
        url=str(item.get("url","")).lower()
        if "creativecommons.org/licenses/by/4.0" in url or "cc by 4.0" in name:
            return int(item.get("value",item.get("id")))
    raise RuntimeError("Official Figshare CC BY 4.0 license not found")

def main():
    current=req("GET",f"account/articles/{ARTICLE_ID}")
    if int(current.get("id",0))!=ARTICLE_ID:
        raise RuntimeError("Wrong Figshare article")
    if current.get("is_public") or current.get("status")=="public":
        raise RuntimeError("Record already public: refusing prepublication metadata update")
    ident=str(current.get("doi") or "")
    if ident and not ident.startswith(RESERVED_DOI):
        raise RuntimeError("DOI mismatch: "+ident)
    license_id=ccby_id()
    req("PUT",f"account/articles/{ARTICLE_ID}",{
        "title":TITLE,
        "description":DESCRIPTION,
        "defined_type":"book",
        "license":license_id,
        "categories":[26371],
        "tags":TAGS,
        "references":["https://github.com/y0bahrambeigi/bhb/tree/main/publications/ai-smart-building"]
    })
    req("PUT",f"account/articles/{ARTICLE_ID}/authors",{"authors":[{"id":AUTHOR_ID}]})
    authors=req("GET",f"account/articles/{ARTICLE_ID}/authors")
    ids=[int(item.get("id",-1)) for item in authors]
    updated=req("GET",f"account/articles/{ARTICLE_ID}")
    if ids!=[AUTHOR_ID]: raise RuntimeError("Author verification failed: "+repr(ids))
    if updated.get("is_public") or updated.get("status")=="public":
        raise RuntimeError("Record unexpectedly published; STOP")
    license_val=updated.get("license") or {}
    actual=license_val.get("value",license_val.get("id")) if isinstance(license_val,dict) else license_val
    if int(actual)!=license_id:
        raise RuntimeError("CC BY license confirmation failed")
    if str(updated.get("defined_type_name","")).lower()!="book":
        raise RuntimeError("Figshare item type is not book")
    report={
        "article_id":ARTICLE_ID,
        "reserved_doi":RESERVED_DOI,
        "doi_state":"reserved-unpublished",
        "status":"private",
        "publicly_published":False,
        "user_approved_license":"CC BY 4.0",
        "figshare_license_id":license_id,
        "figshare_license_name":license_val.get("name") if isinstance(license_val,dict) else "CC BY 4.0",
        "title":updated.get("title"),
        "defined_type_name":updated.get("defined_type_name"),
        "authors":[{"id":a.get("id"),"name":a.get("full_name")} for a in authors],
        "files_uploaded":len(updated.get("files",[])),
        "next_step":"Upload final checked PDF/DOCX/cover and companions, verify license/content/hash before calling publish. Do not claim DOI is live."
    }
    OUT.parent.mkdir(parents=True,exist_ok=True)
    OUT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(report,ensure_ascii=False))

if __name__=="__main__":
    try: main()
    except Exception as exc:
        print("PRIVATE_METADATA_UPDATE_FAILED:",str(exc),file=sys.stderr)
        sys.exit(1)
