import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import { collectPrecacheEntries, createCacheVersion } from "../scripts/generate-sw.mjs";

describe("service worker cache version", () => {
  let directory;

  beforeEach(async () => {
    directory = await fs.mkdtemp(path.join(os.tmpdir(), "rasa-cell-sw-"));
    await fs.mkdir(path.join(directory, "assets"));
    await fs.writeFile(path.join(directory, "index.html"), "<main>version one</main>");
    await fs.writeFile(path.join(directory, "assets", "app.js"), "console.log('stable')");
  });

  afterEach(async () => {
    await fs.rm(directory, { recursive: true, force: true });
  });

  it("changes when file content changes without a filename change", async () => {
    const firstEntries = await collectPrecacheEntries(directory);
    const firstVersion = createCacheVersion(firstEntries);

    await fs.writeFile(path.join(directory, "index.html"), "<main>version two</main>");

    const secondEntries = await collectPrecacheEntries(directory);
    const secondVersion = createCacheVersion(secondEntries);

    expect(secondEntries.map(({ url }) => url)).toEqual(firstEntries.map(({ url }) => url));
    expect(secondVersion).not.toBe(firstVersion);
  });

  it("is stable when paths and contents are unchanged", async () => {
    const firstVersion = createCacheVersion(await collectPrecacheEntries(directory));
    const secondVersion = createCacheVersion(await collectPrecacheEntries(directory));
    expect(secondVersion).toBe(firstVersion);
  });
});
