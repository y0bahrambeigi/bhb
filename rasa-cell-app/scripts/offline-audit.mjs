import { promises as fs } from "node:fs";
import path from "node:path";

const dist = path.resolve("dist");
const required = [
  "index.html",
  "manifest.webmanifest",
  "sw.js",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png"
];

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : full;
  }));
  return nested.flat();
}

for (const relative of required) {
  await fs.access(path.join(dist, relative));
}

const files = await walk(dist);
const textFiles = files.filter((file) => /\.(?:html|css|js|json|webmanifest|svg)$/.test(file));
const external = [];
for (const file of textFiles) {
  const text = await fs.readFile(file, "utf8");
  const extension = path.extname(file);
  const patterns = extension === ".html"
    ? [/(?:src|href)\s*=\s*["']https?:\/\/[^"']+/gi]
    : extension === ".css"
      ? [/@import\s+(?:url\()?\s*["']?https?:\/\/[^\s"')]+/gi, /url\(\s*["']?https?:\/\/[^\s"')]+/gi]
      : extension === ".js"
        ? [/(?:fetch|import)\(\s*["']https?:\/\/[^"']+/gi, /new\s+(?:Worker|WebSocket)\(\s*["']https?:\/\/[^"']+/gi]
        : [];
  for (const pattern of patterns) {
    for (const match of text.match(pattern) || []) external.push([path.relative(dist, file), match]);
  }
}
if (external.length) throw new Error(`External runtime URLs found: ${JSON.stringify(external)}`);

const sw = await fs.readFile(path.join(dist, "sw.js"), "utf8");
for (const file of files) {
  const relative = `./${path.relative(dist, file).split(path.sep).join("/")}`;
  if (relative !== "./sw.js" && !sw.includes(relative)) throw new Error(`Asset missing from precache: ${relative}`);
}

const html = await fs.readFile(path.join(dist, "index.html"), "utf8");
for (const marker of ["rasa-canvas", "play-stages", "stage-range", "install-app", "manifest.webmanifest"]) {
  if (!html.includes(marker)) throw new Error(`UI marker missing from build: ${marker}`);
}

const bytes = (await Promise.all(files.map(async (file) => (await fs.stat(file)).size))).reduce((sum, size) => sum + size, 0);
console.log(`Offline audit passed: ${files.length} files, ${(bytes / 1024 / 1024).toFixed(2)} MiB, no external runtime dependency.`);
