import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const out = join(root, 'mobile', 'www');
const files = ['index.html','styles.css','app.js','audio.js','manifest.webmanifest','sw.js'];

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const file of files) await cp(join(root, file), join(out, file));
try { await cp(join(root, 'icons'), join(out, 'icons'), { recursive: true }); } catch {}
console.log(`Prepared Capacitor web assets in ${out}`);
