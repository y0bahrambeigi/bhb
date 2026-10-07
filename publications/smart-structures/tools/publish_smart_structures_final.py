#!/usr/bin/env python3
from __future__ import annotations
import argparse, datetime as dt, hashlib, json, os, pathlib, shutil, sys, zipfile
from typing import Any
import requests
from docx import Document
from lxml import etree
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, TextStringObject

BASE="https://api.figshare.com/v2"
ARTICLE_ID=34063335
AUTHOR_ID=24753196
ORCID_URL="https://orcid.org/0000-0002-3421-8679"
RELEASE_TAG="smart-structures-v1.0.0"
RELEASE_URL=f"https://github.com/y0bahrambeigi/bhb/releases/tag/{RELEASE_TAG}"
APP_URL="https://y0bahrambeigi.github.io/bhb/publications/smart-structures/webapp/"
TITLE_EN="Smart Structures and Seismic Response Control — Digital Book v1.0.0 (Persian)"
TITLE_FA="سازه‌های هوشمند و کنترل پاسخ لرزه‌ای"
SUBTITLE_FA="از جداسازی پایه و میرایی تا کنترل فعال، دوقلوی دیجیتال و هوش سازه‌ای"
DESCRIPTION=("Final digital version 1.0.0 of the Persian academic book "
"«سازه‌های هوشمند و کنترل پاسخ لرزه‌ای» by Yousef Bahrambeigi. "
"This version supersedes release candidate 1 while preserving RC1 as the historical "
"Figshare version 1. The package contains the 40-page expanded digital PDF, editable "
"DOCX source, citation metadata, CC BY 4.0 license, integrity checksums, and a QA report. "
"The associated GitHub repository provides an interactive offline-capable PWA.")
TAGS=["smart structures","structural control","seismic response control","civil engineering",
"base isolation","active control","digital twin","structural health monitoring",
"Persian","academic book","PWA"]
DC_NS="http://purl.org/dc/elements/1.1/"
RDF_NS="http://www.w3.org/1999/02/22-rdf-syntax-ns#"

class PublicationError(RuntimeError): pass
def fail(m:str)->None: raise PublicationError(m)

def auth_headers():
    token=os.environ.get("FIGSHARE_TOKEN","").strip()
    if not token: fail("FIGSHARE_TOKEN is not configured.")
    return {"Authorization":f"token {token}"}

def request(method,path_or_url,*,payload=None,binary=None,auth=True,allow_redirects=True):
    url=path_or_url if path_or_url.startswith("http") else f"{BASE}/{path_or_url.lstrip('/')}"
    headers={"User-Agent":"Smart-Structures-Final-Release/1.0"}
    if auth: headers.update(auth_headers())
    data=binary
    if payload is not None:
        headers["Content-Type"]="application/json"
        data=json.dumps(payload,ensure_ascii=False).encode("utf-8")
    r=requests.request(method,url,headers=headers,data=data,timeout=180,allow_redirects=allow_redirects)
    if r.status_code>=400: fail(f"{method} {url} -> {r.status_code}: {r.text[:1600]}")
    return r
def j(r): return r.json() if r.content else None

def concept_doi(doi: str) -> str:
    """Return the stable Figshare concept DOI for a version DOI or concept DOI."""
    import re
    return re.sub(r"\\.v\\d+$", "", doi.strip())

def get_ccby_license_id():
    licenses=j(request("GET","licenses",auth=False)) or []
    ranked=[]
    for item in licenses:
        name=str(item.get("name","")).casefold(); url=str(item.get("url","")).casefold(); score=0
        if "creative commons attribution 4.0" in name: score+=100
        if "cc by 4.0" in name or "cc-by-4.0" in name: score+=90
        if "creativecommons.org/licenses/by/4.0" in url: score+=100
        if score: ranked.append((score,item))
    if not ranked: fail("CC BY 4.0 license not found.")
    item=max(ranked,key=lambda x:x[0])[1]; value=item.get("value",item.get("id"))
    if value is None: fail("CC BY 4.0 license has no id/value.")
    return int(value)

def final_public_version():
    versions=j(request("GET",f"articles/{ARTICLE_ID}/versions",auth=False)) or []
    newest=max((int(v.get("version",0)) for v in versions),default=0)
    if newest<2: return None
    public=j(request("GET",f"articles/{ARTICLE_ID}/versions/{newest}",auth=False))
    title=str(public.get("title",""))
    return public if ("v1.0.0" in title and "rc1" not in title.casefold()) else None

def download_existing_final(public: dict[str, Any], output_dir: pathlib.Path, result_path: pathlib.Path):
    output_dir.mkdir(parents=True, exist_ok=True)
    files = public.get("files") or []
    if not files:
        fail("Published final Figshare version has no files.")
    required = {
        "Smart_Structures_Yousef_Bahrambeigi_v1.0.0_source.docx",
        "Smart_Structures_Yousef_Bahrambeigi_v1.0.0_digital.pdf",
        "SHA256SUMS", "CITATION.cff", "CITATION.bib", "LICENSE.md", "QA_REPORT.json",
    }
    present = {str(item.get("name")) for item in files}
    missing = sorted(required - present)
    if missing:
        fail(f"Published final Figshare version is missing files: {missing}")
    for item in files:
        name = str(item.get("name") or "")
        if name not in required:
            continue
        url = str(item.get("download_url") or "")
        if not url:
            fail(f"No download URL for published file {name}")
        response = requests.get(url, headers={"User-Agent":"Smart-Structures-Final-Release/1.0"}, timeout=180)
        if response.status_code >= 400:
            fail(f"Download failed for {name}: HTTP {response.status_code}")
        path = output_dir / name
        path.write_bytes(response.content)
        expected_md5 = str(item.get("computed_md5") or item.get("supplied_md5") or "").strip()
        if expected_md5 and hashlib.md5(response.content).hexdigest() != expected_md5:
            fail(f"MD5 mismatch after downloading published file {name}")
    manifest = output_dir / "SHA256SUMS"
    expected = {}
    for line in manifest.read_text(encoding="utf-8").splitlines():
        if line.strip():
            digest, name = line.split(maxsplit=1)
            expected[name.strip()] = digest.strip()
    for name in (
        "Smart_Structures_Yousef_Bahrambeigi_v1.0.0_source.docx",
        "Smart_Structures_Yousef_Bahrambeigi_v1.0.0_digital.pdf",
    ):
        path = output_dir / name
        actual = hashlib.sha256(path.read_bytes()).hexdigest()
        if expected.get(name) != actual:
            fail(f"SHA-256 mismatch for downloaded published file {name}")
    public_doi = str(public.get("doi") or "").strip()
    if not public_doi:
        fail("Published final Figshare version has no DOI.")
    canonical_doi = concept_doi(public_doi)
    authors = public.get("authors") or []
    ids = [int(a.get("id",-1)) for a in authors]
    if ids != [AUTHOR_ID]:
        fail(f"Published final Figshare author list is unexpected: {ids}")
    version = int(public.get("version") or 0)
    doi_url = f"https://doi.org/{canonical_doi}"
    version_doi_url = f"https://doi.org/{public_doi}"
    resolved = requests.get(
        doi_url,
        headers={"User-Agent":"Smart-Structures-Final-DOI-Verifier/1.0"},
        timeout=90,
        allow_redirects=True,
    )
    if resolved.status_code >= 400:
        fail(f"Canonical DOI resolution HTTP {resolved.status_code}")
    version_resolved = requests.get(
        version_doi_url,
        headers={"User-Agent":"Smart-Structures-Final-Version-DOI-Verifier/1.0"},
        timeout=90,
        allow_redirects=True,
    )
    if version_resolved.status_code >= 400:
        fail(f"Version DOI resolution HTTP {version_resolved.status_code}")
    result = {
        "article_id": ARTICLE_ID,
        "version": version,
        "doi": canonical_doi,
        "concept_doi": canonical_doi,
        "version_doi": public_doi,
        "doi_url": doi_url,
        "version_doi_url": version_doi_url,
        "resolved_url": resolved.url,
        "version_resolved_url": version_resolved.url,
        "public_url": public.get("url_public_api") or public.get("url_public_html") or "",
        "release_tag": RELEASE_TAG,
        "status": "published",
        "author_count": len(authors),
        "source_assets": "downloaded verbatim from published Figshare final version",
    }
    result_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    pathlib.Path("figshare_final_reservation.json").write_text(
        json.dumps(
            {
                "article_id": ARTICLE_ID,
                "doi": canonical_doi,
                "version_doi": public_doi,
                "status": "already-published",
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    return result

def reserve_final_doi(result_path:pathlib.Path):
    already=final_public_version()
    if already:
        version_doi=str(already.get("doi","")).strip()
        if not version_doi: fail("Final public version exists without DOI.")
        doi=concept_doi(version_doi)
        result_path.write_text(json.dumps({
            "article_id":ARTICLE_ID,
            "doi":doi,
            "version_doi":version_doi,
            "status":"already-published"
        },indent=2),encoding="utf-8")
        return doi
    article=j(request("GET",f"account/articles/{ARTICLE_ID}"))
    categories=[int(x["id"]) for x in (article.get("categories") or []) if x.get("id")]
    payload={"title":TITLE_EN,"description":DESCRIPTION,"tags":TAGS,
             "references":[RELEASE_URL,APP_URL,ORCID_URL],"defined_type":"book",
             "license":get_ccby_license_id()}
    if categories: payload["categories"]=categories
    request("PUT",f"account/articles/{ARTICLE_ID}",payload=payload)
    request("PUT",f"account/articles/{ARTICLE_ID}/authors",payload={"authors":[{"id":AUTHOR_ID}]})
    authors=j(request("GET",f"account/articles/{ARTICLE_ID}/authors")) or []
    ids=[int(a.get("id",-1)) for a in authors]
    if ids!=[AUTHOR_ID]: fail(f"Author replacement failed; got {ids}")
    reserved=j(request("POST",f"account/articles/{ARTICLE_ID}/reserve_doi")) or {}
    reserved_doi=str(reserved.get("doi","")).strip()
    if not reserved_doi: fail("Figshare did not return reserved DOI.")
    doi=concept_doi(reserved_doi)
    result_path.write_text(json.dumps({
        "article_id":ARTICLE_ID,
        "doi":doi,
        "reserved_doi":reserved_doi,
        "status":"reserved"
    },indent=2),encoding="utf-8")
    print("Reserved canonical DOI:",doi); return doi

def replace_or_append_notice(doc:Document,doi:str,release_date:str):
    text=f"نسخه ۱.۰.۰ | DOI: {doi} | تاریخ انتشار: {release_date}"
    for p in doc.paragraphs:
        if "شناسه رسمی" in p.text or ("نسخه ۱.۰.۰" in p.text and "DOI" in p.text):
            p.text=text; return
    if doc.tables:
        cell=doc.tables[0].cell(0,0)
        for p in cell.paragraphs:
            if "شناسه رسمی" in p.text or ("نسخه ۱.۰.۰" in p.text and "DOI" in p.text):
                p.text=text; return
        cell.add_paragraph(text)
    else: doc.add_paragraph(text)

def copy_embedded_fonts(rc1_docx:pathlib.Path,final_docx:pathlib.Path):
    with zipfile.ZipFile(rc1_docx,"r") as rz, zipfile.ZipFile(final_docx,"r") as fz:
        rc={n:rz.read(n) for n in rz.namelist()}; parts={n:fz.read(n) for n in fz.namelist()}
    fonts=[n for n in rc if n.startswith("word/fonts/") and n.endswith(".odttf")]
    if len(fonts)!=6: fail(f"Expected 6 RC1 embedded fonts, found {len(fonts)}")
    for n in list(parts):
        if n.startswith("word/fonts/") and n.endswith(".odttf"): del parts[n]
    for n in fonts: parts[n]=rc[n]
    for n in ("word/fontTable.xml","word/_rels/fontTable.xml.rels"):
        if n not in rc: fail(f"RC1 missing {n}")
        parts[n]=rc[n]
    ns="http://schemas.openxmlformats.org/package/2006/content-types"
    rcct=etree.fromstring(rc["[Content_Types].xml"]); fct=etree.fromstring(parts["[Content_Types].xml"])
    if not any(x.get("Extension")=="odttf" for x in fct.findall(f"{{{ns}}}Default")):
        node=next((x for x in rcct.findall(f"{{{ns}}}Default") if x.get("Extension")=="odttf"),None)
        if node is None: fail("RC1 content types missing odttf.")
        fct.append(node); parts["[Content_Types].xml"]=etree.tostring(fct,xml_declaration=True,encoding="UTF-8",standalone=True)
    tmp=final_docx.with_suffix(".fonts.tmp")
    with zipfile.ZipFile(tmp,"w",compression=zipfile.ZIP_DEFLATED) as out:
        for n in sorted(parts): out.writestr(n,parts[n])
    tmp.replace(final_docx); return len(fonts)

def finalize_docx(expanded,rc1,output,doi,release_date):
    doc=Document(expanded); props=doc.core_properties
    props.title=TITLE_FA; props.subject="Smart Structures and Seismic Response Control — final digital v1.0.0"
    props.author="Yousef Bahrambeigi (یوسف بهرام بیگی)"; props.last_modified_by="Yousef Bahrambeigi"
    props.keywords=f"smart structures; seismic response control; civil engineering; v1.0.0; DOI {doi}; CC BY 4.0"
    props.comments=f"Final digital version 1.0.0. DOI: {doi}. Licensed under CC BY 4.0."
    props.modified=dt.datetime.now(dt.timezone.utc).replace(microsecond=0)
    props.revision=max(int(props.revision or 0),3)
    replace_or_append_notice(doc,doi,release_date); output.parent.mkdir(parents=True,exist_ok=True); doc.save(output)
    count=copy_embedded_fonts(rc1,output)
    with zipfile.ZipFile(output,"r") as z:
        bad=z.testzip()
        if bad: fail(f"Corrupt DOCX member {bad}")
        names=[n for n in z.namelist() if n.startswith("word/fonts/") and n.endswith(".odttf")]
        if len(names)!=6: fail(f"Final DOCX embedded font count {len(names)}")
        joined=b"".join(z.read(n) for n in ("docProps/core.xml","word/document.xml") if n in z.namelist())
        if doi.encode() not in joined: fail("Final DOCX does not contain DOI.")
    return count

def set_pdf_xmp(writer:PdfWriter,doi:str):
    ref=writer._root_object.get(NameObject("/Metadata"))
    if ref is None: return
    stream=ref.get_object(); root=etree.fromstring(stream.get_data())
    desc=root.find(f".//{{{RDF_NS}}}Description")
    if desc is None: return
    for e in desc.findall(f"{{{DC_NS}}}identifier"): desc.remove(e)
    e=etree.SubElement(desc,f"{{{DC_NS}}}identifier"); e.text=doi
    for e in desc.findall(f"{{{DC_NS}}}language"): desc.remove(e)
    lang=etree.SubElement(desc,f"{{{DC_NS}}}language"); bag=etree.SubElement(lang,f"{{{RDF_NS}}}Bag")
    etree.SubElement(bag,f"{{{RDF_NS}}}li").text="fa-IR"
    stream.set_data(etree.tostring(root,encoding="UTF-8",xml_declaration=False))

def finalize_pdf(expanded,output,doi,release_date):
    reader=PdfReader(expanded); writer=PdfWriter(); writer.pdf_header=reader.pdf_header; writer.clone_document_from_reader(reader)
    writer._root_object[NameObject("/Lang")]=TextStringObject("fa-IR")
    md={k:str(v) for k,v in (reader.metadata or {}).items() if v is not None}
    md.update({"/Title":TITLE_FA,"/Author":"Yousef Bahrambeigi",
               "/Subject":f"Final digital version 1.0.0 — DOI {doi}",
               "/Keywords":f"smart structures, seismic response control, civil engineering, v1.0.0, DOI {doi}, CC BY 4.0",
               "/Identifier":doi,"/ModDate":"D:"+release_date.replace("-","")+"000000Z"})
    writer.add_metadata(md); set_pdf_xmp(writer,doi); output.parent.mkdir(parents=True,exist_ok=True)
    with output.open("wb") as f: writer.write(f)
    check=PdfReader(output); root=check.trailer["/Root"]; pages=len(check.pages)
    if pages!=40: fail(f"Final PDF has {pages} pages; expected 40.")
    if str(root.get("/Lang"))!="fa-IR": fail("Final PDF /Lang is not fa-IR.")
    if not root.get("/StructTreeRoot") or not root.get("/MarkInfo",{}).get("/Marked"): fail("Tagged structure not preserved.")
    outline_count=len(check.outline)
    if outline_count<1: fail("PDF outline not preserved.")
    if doi not in " ".join(str(v) for v in (check.metadata or {}).values() if v is not None): fail("PDF metadata missing DOI.")
    return {"pages":pages,"outline_entries":outline_count,"tagged":True}

def write_metadata(out,doi,date):
    cff=f'''cff-version: 1.2.0
message: "Please cite the final v1.0.0 digital book using the DOI below."
title: "{TITLE_FA}"
version: 1.0.0
doi: "{doi}"
date-released: {date}
authors:
  - family-names: Bahrambeigi
    given-names: Yousef
    orcid: "https://orcid.org/0000-0002-3421-8679"
license: CC-BY-4.0
repository-code: "https://github.com/y0bahrambeigi/bhb"
url: "https://doi.org/{doi}"
preferred-citation:
  type: book
  title: "{TITLE_FA}: {SUBTITLE_FA}"
  authors:
    - family-names: Bahrambeigi
      given-names: Yousef
  edition: 1
  year: 2026
  doi: "{doi}"
  publisher: Figshare
'''
    bib=f'''@book{{bahrambeigi_smart_structures_2026,
  author    = {{Bahrambeigi, Yousef}},
  title     = {{{TITLE_FA}}},
  subtitle  = {{{SUBTITLE_FA}}},
  year      = {{2026}},
  edition   = {{First academic edition}},
  version   = {{1.0.0}},
  language  = {{Persian}},
  langid    = {{persian}},
  doi       = {{{doi}}},
  url       = {{https://doi.org/{doi}}},
  urldate   = {{{date}}},
  publisher = {{Figshare}},
  note      = {{Final digital version 1.0.0}},
  license   = {{CC BY 4.0}}
}}
'''
    (out/"CITATION.cff").write_text(cff,encoding="utf-8"); (out/"CITATION.bib").write_text(bib,encoding="utf-8")

def sha256(path):
    h=hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda:f.read(1024*1024),b""): h.update(chunk)
    return h.hexdigest()

def build_assets(args,doi):
    out=args.output_dir; out.mkdir(parents=True,exist_ok=True)
    docx=out/"Smart_Structures_Yousef_Bahrambeigi_v1.0.0_source.docx"
    pdf=out/"Smart_Structures_Yousef_Bahrambeigi_v1.0.0_digital.pdf"
    fonts=finalize_docx(args.expanded_docx,args.rc1_docx,docx,doi,args.release_date)
    pinfo=finalize_pdf(args.expanded_pdf,pdf,doi,args.release_date); write_metadata(out,doi,args.release_date)
    shutil.copy2(args.license_file,out/"LICENSE.md")
    primary=[docx,pdf]; (out/"SHA256SUMS").write_text("\n".join(f"{sha256(p)}  {p.name}" for p in primary)+"\n",encoding="utf-8")
    qa={"release":"v1.0.0","release_date":args.release_date,"doi":doi,"source":"expanded 40-page draft",
        "docx_embedded_fonts":fonts,"pdf":pinfo,"checksums":{p.name:sha256(p) for p in primary},
        "webapp_validation":"performed by GitHub Actions before publication","scope":"digital-only; print/PDF-X outside this release"}
    (out/"QA_REPORT.json").write_text(json.dumps(qa,ensure_ascii=False,indent=2),encoding="utf-8")
    return [docx,pdf,out/"SHA256SUMS",out/"CITATION.cff",out/"CITATION.bib",out/"LICENSE.md",out/"QA_REPORT.json"]

def md5_size(path):
    h=hashlib.md5(); size=0
    with path.open("rb") as f:
        for chunk in iter(lambda:f.read(1024*1024),b""): h.update(chunk); size+=len(chunk)
    return h.hexdigest(),size

def upload_file(path):
    md5,size=md5_size(path)
    r=request("POST",f"account/articles/{ARTICLE_ID}/files",payload={"md5":md5,"size":size,"name":path.name})
    location=r.headers.get("Location")
    if not location:
        body=j(r); location=body.get("location") if isinstance(body,dict) else None
    if not location: fail(f"No upload location for {path.name}")
    info=j(request("GET",location)); upload_url=info["upload_url"]; parts=j(request("GET",upload_url,auth=False))["parts"]
    with path.open("rb") as stream:
        for part in parts:
            start=int(part["startOffset"]); end=int(part["endOffset"]); stream.seek(start)
            request("PUT",f"{upload_url}/{part['partNo']}",binary=stream.read(end-start+1),auth=False)
    request("POST",f"account/articles/{ARTICLE_ID}/files/{info['id']}"); print("Uploaded",path.name)

def replace_files(assets):
    for item in (j(request("GET",f"account/articles/{ARTICLE_ID}/files")) or []):
        request("DELETE",f"account/articles/{ARTICLE_ID}/files/{int(item['id'])}"); print("Removed",item.get("name"))
    for p in assets: upload_file(p)

def publish_verify(doi,assets,result_path):
    public=final_public_version()
    if not public:
        replace_files(assets); request("POST",f"account/articles/{ARTICLE_ID}/publish")
        public=j(request("GET",f"articles/{ARTICLE_ID}",auth=False))
    version_doi=str(public.get("doi","")).strip()
    if not version_doi:
        fail("Published Figshare version has no DOI.")
    canonical_doi=concept_doi(version_doi)
    if canonical_doi!=concept_doi(doi):
        fail(f"Published DOI {version_doi} is not a version of canonical DOI {doi}")
    authors=public.get("authors") or []; ids=[int(a.get("id",-1)) for a in authors]
    if ids!=[AUTHOR_ID]: fail(f"Published authors unexpected: {ids}")
    title=str(public.get("title",""))
    if "v1.0.0" not in title or "rc1" in title.casefold(): fail(f"Published title not final: {title}")
    versions=j(request("GET",f"articles/{ARTICLE_ID}/versions",auth=False)) or []; newest=max((int(v.get("version",0)) for v in versions),default=0)
    if newest<2: fail(f"Expected Figshare version >=2, got {newest}")
    doi_url=f"https://doi.org/{canonical_doi}"
    version_doi_url=f"https://doi.org/{version_doi}"
    r=requests.get(doi_url,headers={"User-Agent":"Smart-Structures-Final-DOI-Verifier/1.0"},timeout=90,allow_redirects=True)
    if r.status_code>=400: fail(f"Canonical DOI resolution HTTP {r.status_code}")
    rv=requests.get(version_doi_url,headers={"User-Agent":"Smart-Structures-Final-Version-DOI-Verifier/1.0"},timeout=90,allow_redirects=True)
    if rv.status_code>=400: fail(f"Version DOI resolution HTTP {rv.status_code}")
    result={"article_id":ARTICLE_ID,"version":newest,"doi":canonical_doi,"version_doi":version_doi,
            "doi_url":doi_url,"version_doi_url":version_doi_url,
            "resolved_url":r.url,"version_resolved_url":rv.url,
            "public_url":public.get("url_public_api") or public.get("url") or "","release_tag":RELEASE_TAG,
            "status":"published","author_count":len(authors)}
    result_path.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding="utf-8"); return result

def parse_args():
    p=argparse.ArgumentParser()
    p.add_argument("--expanded-docx",type=pathlib.Path,default=pathlib.Path("publications/smart-structures/expanded-draft/Smart_Structures_Yousef_Bahram_Beigi_Expanded.docx"))
    p.add_argument("--expanded-pdf",type=pathlib.Path,default=pathlib.Path("publications/smart-structures/expanded-draft/Smart_Structures_Yousef_Bahram_Beigi_Expanded.pdf"))
    p.add_argument("--rc1-docx",type=pathlib.Path,default=pathlib.Path("publications/smart-structures/Smart_Structures_Yousef_Bahrambeigi_v1.0.0-rc1_source.docx"))
    p.add_argument("--license-file",type=pathlib.Path,default=pathlib.Path("publications/smart-structures/LICENSE.md"))
    p.add_argument("--output-dir",type=pathlib.Path,default=pathlib.Path("final_release"))
    p.add_argument("--release-date",default=dt.date.today().isoformat())
    p.add_argument("--result",type=pathlib.Path,default=pathlib.Path("figshare_final_result.json"))
    return p.parse_args()

def main():
    args=parse_args()
    existing = final_public_version()
    if existing:
        result = download_existing_final(existing, args.output_dir, args.result)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return
    for p in (args.expanded_docx,args.expanded_pdf,args.rc1_docx,args.license_file):
        if not p.is_file(): fail(f"Missing input: {p}")
    doi=reserve_final_doi(pathlib.Path("figshare_final_reservation.json"))
    assets=build_assets(args,doi); result=publish_verify(doi,assets,args.result)
    print(json.dumps(result,ensure_ascii=False,indent=2))

if __name__=="__main__":
    try: main()
    except Exception as exc:
        print(f"ERROR: {exc}",file=sys.stderr); raise
