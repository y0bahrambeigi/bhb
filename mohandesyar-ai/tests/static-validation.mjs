import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {access, readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = file => readFile(path.join(root, file), "utf8");
const readBinary = file => readFile(path.join(root, file));

const requiredFiles = [
  "index.html", "styles.css", "app.js", "db.js", "sw.js", "offline.html",
  "manifest.webmanifest", "app-icon.svg", "app-icon-192.png", "app-icon-512.png",
  "report/index.html", "report/report.js", "print.css", "README.md", "CITATION.cff",
  "publication/index.html", "publication/mohandesyar-ai-v2-technical-report.pdf",
  "publication/SHA256SUMS", "publication/zenodo-metadata.json",
  "RELEASE_NOTES.md", "LICENSE", "tests/MANUAL-QA.md",
  "paper/paper.md", "paper/paper.bib", "paper/AI_USAGE_DISCLOSURE.md",
  "paper/SUBMISSION_CHECKLIST.md", "paper/INDEPENDENT_USER_TEST.md",
  "paper/HIGHLIGHTS.md", "paper/COVER_LETTER.md",
  "paper/SOFTWAREX_SUBMISSION_MAP.md", "paper/SOFTWAREX_2026_REQUIREMENTS.md",
  "paper/DECLARATIONS.md",
  "paper/RELEASE_NOTES_2.0.0.md", "paper/ZENODO_METADATA.md"
];
await Promise.all(requiredFiles.map(file => access(path.join(root, file))));

const [index, app, db, serviceWorker, report, printCss, manifestText, publication, citation, readme, license, manuscript, independentTest] = await Promise.all([
  read("index.html"), read("app.js"), read("db.js"), read("sw.js"), read("report/index.html"), read("print.css"), read("manifest.webmanifest"),
  read("publication/index.html"), read("CITATION.cff"), read("README.md"),
  read("LICENSE"), read("paper/paper.md"), read("paper/INDEPENDENT_USER_TEST.md")
]);
const manifest = JSON.parse(manifestText);
const zenodoMetadata = JSON.parse(await read("publication/zenodo-metadata.json"));
const [publicationPdf, checksumText] = await Promise.all([
  readBinary("publication/mohandesyar-ai-v2-technical-report.pdf"),
  read("publication/SHA256SUMS")
]);
const expectedPdfSha256 = checksumText.trim().split(/\s+/)[0];
const actualPdfSha256 = createHash("sha256").update(publicationPdf).digest("hex");
assert.equal(actualPdfSha256, expectedPdfSha256, "The scholarly PDF must match its published SHA-256 checksum");

assert.match(index, /<html lang="fa" dir="rtl">/, "Persian RTL attributes are required");
assert.match(index, /type="module" src="\.\/app\.js"/, "The dashboard must load the module application");
assert.doesNotMatch(index, /پروژه مسکونی آریا/, "Demo project data must not ship in the production UI");
assert.match(db, /indexedDB\.open/, "IndexedDB persistence is required");
assert.match(db, /blob:\s*file/, "Evidence file blobs must be persisted");
assert.match(db, /SHA-256/, "Evidence hashing must be SHA-256");
assert.match(app, /navigator\.geolocation/, "Optional geolocation capture must be implemented");
assert.match(report, /src="\.\/report\.js"/, "The report must load the dynamic report module");
assert.match(report, /<html lang="fa" dir="rtl">/, "The printable report must remain Persian RTL");
assert.match(report, /id="report-watermark"/, "The printable report must include its review-status watermark");
assert.match(index, /href="\.\/publication\/"/, "The dashboard must link to the scholarly record");
assert.match(publication, /citation_technical_report_institution/, "The publication page must expose technical-report metadata");
assert.match(publication, /MYAI-TR-2026-02/, "The publication page must expose the stable report identifier");
assert.doesNotMatch(publication, /citation_doi/, "An inactive DOI must not be advertised to scholarly crawlers");
assert.match(publication, /Pending public Zenodo publication/, "The archival status must be explicit");
const canonicalTitle = "MohandesYar AI 2.0: An Offline-First Persian PWA for Civil Engineering Field Documentation, Evidence Integrity, and Reporting";
assert.equal(zenodoMetadata.metadata.title, canonicalTitle);
assert.equal(zenodoMetadata.metadata.version, "2.0.0");
assert.equal(zenodoMetadata.metadata.publication_date, "2026-09-10");
assert.equal(zenodoMetadata.metadata.creators[0].name, "Bahrambeigi, Yousef");
assert.equal(zenodoMetadata.metadata.creators[0].affiliation, "Civil Engineering, Islamic Azad University, Mahabad Branch, Mahabad, Iran");
assert.match(citation, new RegExp(canonicalTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
assert.match(citation, /affiliation: "Civil Engineering, Islamic Azad University, Mahabad Branch, Mahabad, Iran"/);
assert.match(citation, /mohandesyar-ai-v2\.0\.0/, "CITATION.cff must point to the frozen release");
assert.match(citation, /0000-0002-3421-8679/, "Verified ORCID must remain in CITATION.cff");
assert.match(citation, /yousef\.bahrambeigi@iau\.ac\.ir/, "Verified academic email must remain in CITATION.cff");
assert.match(manuscript, /0000-0002-3421-8679/, "Verified ORCID must remain in manuscript metadata");
assert.match(manuscript, /yousef\.bahrambeigi@iau\.ac\.ir/, "Verified academic email must remain in manuscript metadata");
assert.match(manuscript, /9635e7fc37fb4fa1dca6be169bbc678ae5c6d45113b4cb6cde9e4f3460f25173/, "Manuscript must record the verified release SHA-256");
assert.match(license, /^MIT License/m, "The software directory must contain the actual MIT license text");
assert.match(license, /Copyright \(c\) 2026 Yousef Bahrambeigi/);
assert.match(manuscript, new RegExp(canonicalTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+")));
assert.match(manuscript, /Windows validation was performed\s+successfully by an independent\s+user/);
assert.match(manuscript, /does\s+not\s+transmit\s+project\s+data\s+to\s+an\s+external\s+AI\s+inference\s+service/);
assert.match(manuscript, /# Code metadata/, "SoftwareX code metadata table is required");
assert.match(manuscript, /# Software metadata/, "SoftwareX software metadata table is required");
assert.match(manuscript, /# 1\. Motivation and significance/);
assert.match(manuscript, /# 2\. Software description/);
assert.match(manuscript, /# 3\. Illustrative example/);
assert.match(manuscript, /# 4\. Impact/);
assert.match(manuscript, /# 5\. Conclusions/);
assert.match(manuscript, /# Declaration of generative AI and AI-assisted technologies in the manuscript preparation process/);
assert.match(manuscript, /# CRediT authorship contribution statement/, "CRediT statement must remain in manuscript");
assert.match(manuscript, /This research did not receive any specific grant/, "Final funding statement must remain in manuscript");
assert.match(manuscript, /no known competing financial interests/, "Final competing-interest statement must remain in manuscript");
assert.match(manuscript, /DEMO-RC-B01/, "Controlled civil-engineering example must remain documented");
assert.match(independentTest, /INDEPENDENT_TEST_STATUS: PASS/, "Independent-user validation must be recorded as PASS before release");
assert.match(printCss, /@page\{size:A4/, "The print contract must explicitly target A4");
assert.match(printCss, /break-inside:avoid/, "Evidence and report sections must avoid clipping across pages");
assert.equal(manifest.start_url, "/bhb/mohandesyar-ai/", "Installed offline launch must use the cached canonical URL");
assert.equal(manifest.scope, "/bhb/mohandesyar-ai/");
assert.equal(manifest.dir, "rtl");
assert.equal(manifest.lang, "fa");
assert.ok(manifest.icons.some(icon => icon.sizes === "192x192"));
assert.ok(manifest.icons.some(icon => icon.sizes === "512x512"));
assert.match(serviceWorker, /key\.startsWith\(CACHE_PREFIX\)/, "Cache cleanup must be namespace-scoped");
assert.doesNotMatch(serviceWorker, /filter\(key\s*=>\s*key\s*!==\s*CACHE\)/, "Global origin cache deletion is forbidden");
assert.match(db, /const DB_NAME = "mohandesyar-production-v2"/, "The v2 IndexedDB identity must remain stable across application updates");
assert.doesNotMatch(serviceWorker, /deleteDatabase/, "Application updates must never delete local IndexedDB evidence");

for (const asset of [
  "db.js", "report/report.js", "offline.html", "manifest.webmanifest",
  "publication/index.html", "publication/mohandesyar-ai-v2-technical-report.pdf",
  "publication/SHA256SUMS"
]) {
  assert.ok(serviceWorker.includes(asset), `${asset} must be available offline`);
}

for (const [name, content] of [["dashboard", index], ["report", report], ["publication", publication], ["CITATION.cff", citation], ["README", readme]]) {
  assert.doesNotMatch(content, /10\.5281\/zenodo\.(?:22035833|22089146)/, `${name} must not claim an inactive DOI`);
}

console.log("MohandesYar AI static release validation passed.");
