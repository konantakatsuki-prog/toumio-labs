import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(process.argv[2] || fileURLToPath(new URL("../src", import.meta.url)));
const port = Number(process.argv[3] || 4173);
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8"
};

const safePath = (requestPath) => {
  const decoded = decodeURIComponent(requestPath.split("?")[0]);
  const clean = normalize(decoded).replace(/^([.][.][\\/])+/, "");
  return resolve(join(root, clean));
};

const resolveFile = async (pathname) => {
  const candidate = safePath(pathname);
  if (!candidate.startsWith(root)) return null;
  try {
    const details = await stat(candidate);
    if (details.isFile()) return candidate;
  } catch {}
  const indexFile = join(candidate, "index.html");
  try {
    const details = await stat(indexFile);
    if (details.isFile()) return indexFile;
  } catch {}
  if (!extname(candidate)) {
    const htmlFile = `${candidate}.html`;
    try {
      const details = await stat(htmlFile);
      if (details.isFile()) return htmlFile;
    } catch {}
  }
  return null;
};

createServer(async (request, response) => {
  try {
    const file = await resolveFile(request.url || "/");
    if (!file) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }
    const body = await readFile(file);
    response.writeHead(200, {
      "cache-control": "no-cache",
      "content-type": types[extname(file)] || "application/octet-stream"
    });
    response.end(body);
  } catch (error) {
    response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    response.end(error instanceof Error ? error.message : "Server error");
  }
}).listen(port, () => {
  console.log(`Tomio Labs site running at http://localhost:${port}`);
});
