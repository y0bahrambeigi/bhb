import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const dashboardRoot = resolve(scriptDirectory, "../dashboard");
const args = process.argv.slice(2);

function readArg(name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

const host = readArg("--host", "127.0.0.1");
const port = Number(readArg("--port", "4173"));

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
};

const server = createServer((request, response) => {
  try {
    const requestUrl = new URL(request.url || "/", `http://${host}:${port}`);
    const requestedPath = requestUrl.pathname === "/" ? "/index.html" : decodeURIComponent(requestUrl.pathname);
    const normalizedPath = normalize(requestedPath).replace(/^([/\\])+/, "");
    const filePath = resolve(join(dashboardRoot, normalizedPath));

    if (filePath !== dashboardRoot && !filePath.startsWith(`${dashboardRoot}${sep}`)) {
      response.writeHead(403).end("Forbidden");
      return;
    }

    const stat = statSync(filePath);
    if (!stat.isFile()) throw new Error("Not a file");

    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
      "Cache-Control": filePath.endsWith("deployment.json") ? "no-store" : "no-cache",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
  }
});

server.listen(port, host, () => {
  console.log(`BHB dashboard: http://${host}:${port}`);
  if (host === "0.0.0.0") console.log(`Open this computer's LAN IP on port ${port} from your phone.`);
});
