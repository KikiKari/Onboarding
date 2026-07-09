#!/usr/bin/env node
/**
 * Visual-QA-Tool der Sandbox — rendert eine laufende Seite in echten Browsern
 * bei mehreren Auflösungen und legt Screenshots ab, damit Claude das Ergebnis
 * SELBST betrachten kann, bevor es weiterverwendet wird.
 *
 * Warum echtes Chrome: Der Playwright-Bundle-Chromium hat keine proprietären
 * Codecs (H.264/AAC) → Videos bleiben schwarz. Google Chrome Stable
 * (channel/executablePath) dekodiert die MP4-Hero-Videos korrekt.
 *
 * Nutzung:
 *   xvfb-run -a node scripts/visual-qa.mjs [URL] [--engines chrome,firefox,webkit]
 *     [--out <dir>] [--click "<aria-name>"] [--wait <ms>] [--full]
 *
 * Auflösungen: Desktop 1920x1080 & 1366x768, Laptop 1440x900,
 *              Tablet 1024x768, Mobile 390x844 (iPhone-Klasse).
 */
import { chromium, firefox, webkit } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith("--"));
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : def;
};
const has = (name) => args.includes(`--${name}`);

const URL = positional[0] || "http://localhost:3000";
const OUT = flag("out", "/tmp/visual-qa");
const WAIT = parseInt(flag("wait", "3500"), 10);
const CLICK = flag("click", null);
const FULL = has("full");
const ENGINES = flag("engines", "chrome").split(",").map((s) => s.trim());

const RESOLUTIONS = [
  { name: "desktop-1920", width: 1920, height: 1080 },
  { name: "desktop-1366", width: 1366, height: 768 },
  { name: "laptop-1440", width: 1440, height: 900 },
  { name: "tablet-1024", width: 1024, height: 768 },
  { name: "mobile-390", width: 390, height: 844 },
];

const CHROME_PATHS = ["/usr/bin/google-chrome-stable", "/usr/bin/google-chrome"];

async function launch(engine) {
  if (engine === "chrome") {
    const PROXY = process.env.HTTPS_PROXY || process.env.https_proxy || null;
    return chromium.launch({
      executablePath: CHROME_PATHS.find(() => true),
      proxy: PROXY ? { server: PROXY, bypass: "localhost,127.0.0.1,::1" } : undefined,
      args: [
        "--autoplay-policy=no-user-gesture-required",
        "--no-sandbox",
        // externe HTTPS-Ziele: TLS 1.2 max gegen den MITM-Proxy-Reset
        ...(PROXY ? ["--ssl-version-max=tls1.2"] : []),
      ],
    });
  }
  if (engine === "firefox") return firefox.launch();
  if (engine === "webkit") return webkit.launch();
  throw new Error(`Unbekannte Engine: ${engine}`);
}

mkdirSync(OUT, { recursive: true });
const manifest = [];

for (const engine of ENGINES) {
  let browser;
  try {
    browser = await launch(engine);
  } catch (e) {
    console.error(`[${engine}] Start fehlgeschlagen: ${e.message}`);
    continue;
  }
  for (const res of RESOLUTIONS) {
    const ctx = await browser.newContext({
      viewport: { width: res.width, height: res.height },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    try {
      await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(WAIT);
      if (CLICK) {
        try {
          await page.getByRole("button", { name: CLICK }).first().click({ timeout: 8000 });
          await page.waitForTimeout(2000);
        } catch (e) {
          console.error(`[${engine}/${res.name}] Klick '${CLICK}' fehlgeschlagen: ${e.message}`);
        }
      }
      const file = join(OUT, `${engine}-${res.name}.png`);
      await page.screenshot({ path: file, fullPage: FULL });
      const phase = await page
        .locator("[data-pond-phase]")
        .getAttribute("data-pond-phase")
        .catch(() => null);
      manifest.push({ engine, res: res.name, file, phase });
      console.log(`OK  ${engine.padEnd(8)} ${res.name.padEnd(13)} phase=${phase ?? "-"}  ${file}`);
    } catch (e) {
      console.error(`ERR ${engine}/${res.name}: ${e.message}`);
    } finally {
      await ctx.close();
    }
  }
  await browser.close();
}

console.log(`\n${manifest.length} Screenshots in ${OUT}`);
