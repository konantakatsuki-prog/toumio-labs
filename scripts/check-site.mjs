import { readdir, readFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../src", import.meta.url)));
const pages = [];

async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await collect(path);
    else if (extname(entry.name) === ".html") pages.push(path);
  }
}

await collect(root);
const failures = [];
for (const page of pages) {
  const html = await readFile(page, "utf8");
  const checks = [
    ["doctype", /<!doctype html>/i],
    ["title", /<title>[^<]+<\/title>/i],
    ["main landmark", /<main\b/i],
    ["skip link", /class="skip-link"/i],
    ["stylesheet", /\/assets\/styles\.css/],
    ["mobile script", /\/assets\/site\.js/]
  ];
  checks.forEach(([name, pattern]) => {
    if (!pattern.test(html)) failures.push(`${page}: missing ${name}`);
  });
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Checked ${pages.length} HTML pages, shared assets, and accessibility landmarks.`);
