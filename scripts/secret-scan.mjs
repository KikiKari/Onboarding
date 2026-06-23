import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = new URL("../", import.meta.url);
const skipped = new Set([
  "node_modules",
  ".next",
  ".git",
  ".pytest_cache",
  "__pycache__",
  "media-production/raw",
  "media-production/private",
]);
const patterns = [
  /sk-(?:proj|svcacct|ant|or-v1|admin)-[A-Za-z0-9_-]{20,}/,
  /(?:nvapi|lin_api|ntn|vcp)_[A-Za-z0-9_-]{20,}/,
  /ELEVENLABS_API_KEY\s*=\s*["']?[A-Za-z0-9]{20,}/,
  /WAVESPEED_API_KEY\s*=\s*["']?[A-Za-z0-9]{20,}/,
];
const findings = [];

async function walk(url, relative = "") {
  for (const entry of await readdir(url)) {
    const rel = path.join(relative, entry);
    if (
      entry === ".env" ||
      (entry.startsWith(".env.") && entry !== ".env.example") ||
      [...skipped].some(
        (item) =>
          rel === item ||
          rel.startsWith(`${item}${path.sep}`) ||
          rel.split(path.sep).includes(item),
      )
    ) continue;
    const target = new URL(`${entry}${(await stat(new URL(entry, url))).isDirectory() ? "/" : ""}`, url);
    const info = await stat(target);
    if (info.isDirectory()) await walk(target, rel);
    else if (info.size < 2_000_000) {
      const content = await readFile(target, "utf8").catch(() => "");
      for (const pattern of patterns) if (pattern.test(content)) findings.push(rel);
    }
  }
}
await walk(root);
if (findings.length) {
  console.error(`Secret-Scan fehlgeschlagen: ${[...new Set(findings)].join(", ")}`);
  process.exit(1);
}
console.log("Secret-Scan bestanden.");
