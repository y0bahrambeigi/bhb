import { promises as fs } from "node:fs";
import path from "node:path";

const source = path.resolve("dist");
const target = path.resolve("..", "rasa-cell");
if (path.basename(target) !== "rasa-cell") throw new Error("Unsafe deployment target");
await fs.rm(target, { recursive: true, force: true });
await fs.cp(source, target, { recursive: true });
console.log(`Synced web build to ${target}`);
