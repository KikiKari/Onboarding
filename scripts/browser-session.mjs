#!/usr/bin/env node
/**
 * Persistente Browser-Sitzung der Sandbox.
 *
 * Zweck: Plattformen ohne (nutzbare) API — WaveSpeed-Konsole, Perplexity,
 * Canva, Stock-Portale — erfordern einen echten Web-Login. Diese Sitzung
 * speichert Cookies/LocalStorage DAUERHAFT in einem user-data-dir, akzeptiert
 * Cookie-Banner automatisch und bleibt über Skript-Läufe hinweg angemeldet.
 *
 * Profil-Verzeichnis: <repo>/.browser-profile (gitignored — enthält Secrets).
 *
 * Nutzung (immer unter Xvfb, damit echtes Chrome mit Codecs läuft):
 *   xvfb-run -a node scripts/browser-session.mjs open <URL>          # öffnen, Cookies akzeptieren, Screenshot
 *   xvfb-run -a node scripts/browser-session.mjs login <URL> [--user-field ..] [--pass-field ..] [--env-user X] [--env-pass Y]
 *   xvfb-run -a node scripts/browser-session.mjs shot <URL> [--out file.png] [--wait ms] [--full]
 *   xvfb-run -a node scripts/browser-session.mjs state                 # gespeicherte Cookies auflisten (Domains)
 *
 * Die Sitzung wird NICHT geschlossen-und-verworfen: das Profil bleibt auf Platte.
 */
import { chromium } from "playwright";
import { mkdirSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const PROFILE = process.env.BROWSER_PROFILE_DIR || join(REPO, ".browser-profile");
const CHROME = ["/usr/bin/google-chrome-stable", "/usr/bin/google-chrome"].find(existsSync);

const [cmd, target, ...rest] = process.argv.slice(2);
const flag = (n, d) => {
  const i = rest.indexOf(`--${n}`);
  return i >= 0 && rest[i + 1] ? rest[i + 1] : d;
};
const has = (n) => rest.includes(`--${n}`);

// .env laden (nur für login-Credentials; nichts wird geloggt)
function loadEnv() {
  const f = join(REPO, ".env");
  if (!existsSync(f)) return {};
  const out = {};
  for (const line of readFileSync(f, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

/** Häufige Cookie-Consent-Buttons klicken (mehrsprachig, best effort). */
async function acceptCookies(page) {
  const labels = [
    "Accept all", "Accept All", "Alle akzeptieren", "Accept all cookies",
    "Alle Cookies akzeptieren", "I agree", "Ich stimme zu", "Zustimmen",
    "Allow all", "Akzeptieren", "Accept", "Got it", "Agree",
  ];
  for (const name of labels) {
    try {
      const btn = page.getByRole("button", { name, exact: false }).first();
      if (await btn.isVisible({ timeout: 800 })) {
        await btn.click({ timeout: 1500 });
        return name;
      }
    } catch { /* weiter */ }
  }
  // Generische Consent-IDs
  for (const sel of ["#onetrust-accept-btn-handler", "[aria-label*='accept' i]", "button[title*='accept' i]"]) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 500 })) { await el.click({ timeout: 1500 }); return sel; }
    } catch { /* weiter */ }
  }
  return null;
}

mkdirSync(PROFILE, { recursive: true });

// Sandbox-Egress läuft über den Agent-Proxy (MITM mit CA in /root/.ccr).
// Chrome muss den Proxy nutzen; die CA ist zuvor via certutil in ~/.pki/nssdb
// importiert (siehe docs/VISUAL_QA.md), damit TLS ohne Fehler verifiziert.
const PROXY = process.env.HTTPS_PROXY || process.env.https_proxy || null;

const ctx = await chromium.launchPersistentContext(PROFILE, {
  headless: false,
  executablePath: CHROME,
  viewport: { width: 1440, height: 900 },
  acceptDownloads: true,
  // Playwright verwaltet den Proxy zuverlässiger als das rohe --proxy-server-Arg;
  // bypass für loopback (Dev-Server) und interne Hosts.
  proxy: PROXY ? { server: PROXY, bypass: "localhost,127.0.0.1,::1" } : undefined,
  args: [
    "--no-sandbox",
    "--autoplay-policy=no-user-gesture-required",
    "--disable-blink-features=AutomationControlled",
    // Der Agent-MITM-Proxy resettet TLS-1.3-Handshakes (Chrome/BoringSSL) —
    // TLS 1.2 max lässt den re-terminierten Tunnel durch. curl/OpenSSL wäre
    // nicht betroffen, Chrome schon. Ohne das: ERR_CONNECTION_RESET extern.
    ...(PROXY ? ["--ssl-version-max=tls1.2"] : []),
  ],
});

const page = ctx.pages()[0] || (await ctx.newPage());

try {
  if (cmd === "state") {
    const cookies = await ctx.cookies();
    const domains = [...new Set(cookies.map((c) => c.domain))].sort();
    console.log(`Profil: ${PROFILE}`);
    console.log(`${cookies.length} Cookies über ${domains.length} Domains:`);
    domains.forEach((d) => console.log("  " + d));
  } else if (cmd === "open" || cmd === "shot") {
    if (!target) throw new Error("URL fehlt");
    await page.goto(target, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(parseInt(flag("wait", "2500"), 10));
    const accepted = await acceptCookies(page);
    if (accepted) console.log(`Cookie-Consent bestätigt via: ${accepted}`);
    await page.waitForTimeout(1000);
    const out = flag("out", join("/tmp", `browser-${Date.now()}.png`));
    await page.screenshot({ path: out, fullPage: has("full") });
    console.log(`Screenshot: ${out}`);
    console.log(`URL final: ${page.url()}`);
  } else if (cmd === "login") {
    if (!target) throw new Error("URL fehlt");
    const env = loadEnv();
    const user = env[flag("env-user", "")] || flag("user", "");
    const pass = env[flag("env-pass", "")] || flag("pass", "");
    await page.goto(target, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(2500);
    await acceptCookies(page);
    if (user) {
      const uf = flag("user-field", "input[type=email], input[name=email], input[name=username], input[id*=email i]");
      await page.locator(uf).first().fill(user, { timeout: 8000 });
    }
    if (pass) {
      const pf = flag("pass-field", "input[type=password]");
      await page.locator(pf).first().fill(pass, { timeout: 8000 });
    }
    const out = flag("out", join("/tmp", `login-${Date.now()}.png`));
    await page.screenshot({ path: out });
    console.log(`Login-Formular ausgefüllt (user=${user ? "gesetzt" : "-"}, pass=${pass ? "gesetzt" : "-"}). Screenshot: ${out}`);
    console.log("Absenden bewusst NICHT automatisch — nächster Schritt nach Sichtprüfung.");
  } else {
    console.log("Befehle: open <URL> | shot <URL> | login <URL> | state");
  }
} finally {
  await ctx.close(); // Profil (Cookies) bleibt auf Platte erhalten
}
