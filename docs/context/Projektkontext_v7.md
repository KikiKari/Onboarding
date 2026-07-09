# Projektkontext — "Onboarding and Project Pages" (v7)

> Stand: 9. Juli 2026 · finalisierte Fassung · reine Dokumentation
> v7 dokumentiert die Umsetzung der **persistenten Sandbox + Diff-Sync-Topologie** in **Claude Code on the Web (Fable 5)** und den daraus entstandenen Infrastruktur-Stand. Basis: v6.
> Umgebung: Remote-Sandbox `claude-sandbox` · Repo `KikiKari/Onboarding` · Arbeitsbranch `claude/onboarding-persistent-sandbox-vjfmcx` (Basis `main@25a0828`).

---

## 1. Ausgangsstand (v1–v6, weiter gültig)
GitHub `KikiKari/Onboarding` (public, MIT) · Vercel-Prod `produkt-landingpage-3bb41d0a` · Linear/Notion/Canva · Stack Next.js+TS/Tailwind/Framer Motion/FastAPI/Docker · Pond-Hero-Feature. Historische 355-URL-Liste liegt im Repo unter `docs/context/`.

## 2. Umgebungs-Topologie (jetzt live)
Claude Code arbeitet in einer **eigenen, dauerhaften Remote-Sandbox** (Claude Code on the Web); das lokale Docker des Nutzers wird **inkrementell** synchron gehalten. Umgesetzt:
- **Sync-Brücke** (Commit `a978aa8`): `docker-compose.dev.yml` (Bind-Mounts, `next dev`, `uvicorn --reload`, `npm install` nur bei Lockfile-Hash-Änderung), `scripts/sync-local.ps1`/`.sh` (pollt Branch, Fast-Forward-Pull, Rebuild nur bei Dependency-/Dockerfile-Änderung), `docs/SYNC.md`. **Hot-Reload end-to-end bestätigt.**
- **Sandbox-Selbstprovisionierung** (`779c78c`): `scripts/sandbox-setup.sh` + `.claude/hooks/session-start.sh` + `.claude/settings.json`. Verifiziert: Node 22, Python 3.11/3.12, ffmpeg 6.1.1, ImageMagick; ESLint/Vitest (2/2)/Pytest (3/3)/Typecheck grün.
- **Docker-in-Sandbox** (`c979e95`): `docker-compose.sandbox.yml` + Daemon mit Registry-Mirror (`mirror.gcr.io`, `public.ecr.aws`), da Docker-Hub-Blob-CDN blockiert; Proxy-CA in den Container gereicht.
- **Devcontainer-Fallback** (`6a979b7`): `.devcontainer/` (Node 22, Py 3.12, Docker-in-Docker, Chrome/Xvfb/Blender/GIMP via post-create) für frische Codespaces.

## 3. GitHub-Schreibweg
Der Session-Git-Proxy ist **read-only** (403 „Resource not accessible by integration"). Push-Weg gelöst über **PAT-Credential-Helper** `.claude/git-credential-pat.sh` (`cd111f6`) mit dem fine-grained PAT des Nutzers; der Session-Proxy bleibt lesend. Zusätzlich: sauberer github.com-Egress nur über die Tailscale-VPN (siehe §6), da der Agent-Proxy github.com repo-scoped blockt.

## 4. Aktueller Hero-Stand (Produkt)
- Aktive Komponente: **„Pond Experience V8"** — `components/site/pond-experience.tsx`, eingebunden in `app/page.tsx`; Idle `wide-idle-v2.mp4`, 9 Kugeln auf 4 Blättern.
- **Ungenutzt/Altlast:** `components/site/pond-hero.tsx` und die R3F-Variante unter `components/site/pond/` — Kandidaten für Aufräumen.
- Offene Produkt-QA (aus v6 fortbestehend): Klick-Hitbox exakt auf die Video-Kugel, Splash passend zur Idle-Komposition, 9 Kugeln erst nach Splash + korrekt positioniert, Wasser-Bewegung.

## 5. Visuelle QA-Kette (in der Sandbox)
Commits `32a2c89`, `5b76272`: **Google Chrome Stable** (H.264/AAC → Videos sichtbar; Bundle-Chromium zeigte MP4 schwarz), **Xvfb**, NSS-CA-Import. Proxy-Fix: Agent-MITM-Proxy resettet Chromes **TLS 1.3** → Start mit `--ssl-version-max=tls1.2` (per Netlog diagnostiziert). `scripts/visual-qa.mjs` (Multi-Auflösung Desktop/Laptop/Tablet/Mobile, Klick-Interaktion, Phasen-Status) und `scripts/browser-session.mjs` (persistentes Profil, Cookie-Accept, Login aus `.env`, `--socks`/`--insecure`). `docs/VISUAL_QA.md`. Claude hat Idle-Video, 9 Kugeln nach Klick, Poly Haven, GIMP-Testbild und Blender-3D-Render selbst betrachtet.

## 6. VPN & Fernzugriff (Tailscale)
Commit `a5785f1`: `tailscaled` userspace + SOCKS5 `localhost:1055`; Sandbox als **`claude-sandbox`** im Tailnet `kikikari.github`. Über den Tailscale-SOCKS-Proxy sauberer Egress (github.com 200, `api.github.com/user` = `login: KikiKari`), umgeht das Repo-Scoping des Agent-Proxys. `scripts/sandbox-vpn.sh` (im SessionStart-Hook) + Tailscale-SSH.
- **Codespace** `curly-funicular` (Repo Onboarding) per GitHub-API über die VPN von `Shutdown` → `Available` gestartet (zweite Schnittstelle; Web-Editor braucht `*.github.dev` in Allowlist + GitHub-Web-Login).
- **Bidirektionale SSH** (ACL `check`→`accept`): `claude-sandbox` → `openclaw-node2` ✅, → `openclaw-node3` ✅ (beide root). Offen: v-Nodes (`…446711`, `…449961`) „operation not permitted" (tailscaled dort nicht root); `lenovo-node7` = Windows (kein Tailscale-SSH-Server). `node3` wurde mit `--ssh` neu hochgefahren.
- Tailnet-Knoten: `claude-sandbox` 100.73.106.108, `lenovo-node7` 100.103.140.35 (Win), `openclaw-node2` 100.109.255.27, `openclaw-node3` 100.73.154.125, `v2202604104722446711` 100.64.80.9, `v2202604104722449961` 100.82.198.122.

## 7. Provider-Zugänge (verifiziert)
Nach Freischaltung „Alle Domains" alle Kern-Provider **gültig**: OpenAI (×2), Anthropic, OpenRouter, NVIDIA NIM (×2), ElevenLabs (+ Voice-ID), WaveSpeed, Vercel, Linear, Notion (×2), Slack, Perplexity, Tavily, Firecrawl, GitHub (×2), Docker Hub. **Vecteezy:** Key gültig, Account jedoch **V2-only** (v1 meldet dies wörtlich); exakter v2-Endpoint öffentlich nicht auffindbar (Doku hinter Cloudflare 403) — offener Punkt.

## 8. Sicherheits-/Secrets-Hinweis ⚠️
Alle Keys in die **gitignorierte `.env`** konsolidiert (chmod 600, Secret-Scan bestanden). Namens-Mapping vereinheitlicht (u. a. BANANA→WAVESPEED, CLAUDE_API→ANTHROPIC, VERCEL_KEY→VERCEL_TOKEN, VECTEEZY_API→VECTEEZY_API_KEY, PASSPHRASE→PERPLEXITY_VAULT_PASSPHRASE, DOCKER_PAT). Aus Folge-Uploads aktualisiert: neuer WaveSpeed-, Linear-, ElevenLabs- und Docker-PAT (per Login verifiziert; ältere zurückgestuft). **Als offengelegt behandeln und rotieren; nichts committen. Keine Schlüsselwerte in diesem Dokument.**

## 9. Ausarbeitbare Stellen / offene Punkte
1. Produkt-QA Pond-Hero (Hitbox, Splash-Szene, 9-Kugel-Position, Wasser).
2. Altlasten entfernen: `pond-hero.tsx` + R3F `components/site/pond/`.
3. Arbeitsbranch `claude/onboarding-persistent-sandbox-vjfmcx` → PR/Merge nach `main`.
4. Vecteezy: exakten v2-Endpoint aus eingeloggtem Dashboard ermitteln.
5. OG-Bild-Fix (`app/layout.tsx` `metadataBase`); Backend→AWS + `NEXT_PUBLIC_API_BASE_URL`.
6. Secrets rotieren; v-Nodes-SSH (tailscaled als root) nachziehen, falls gewünscht.

## 10. Korrekturen & Formalisierungen
- Aktiver Hero = `pond-experience.tsx` (V8), nicht `pond-hero.tsx`.
- Sora-2 = nur Video; Standbilder via gpt-image-2. `var*.png`/`orb-glass-*.png` = Vorlagen/untauglich.
- `docs.codex.io` ≠ OpenAI Codex. Cowork-/Repo-Markdown als UTF-8 (BOM).
- Infrastruktur-Aufwand (VPN/SSH/Codespace) ist Enabler, nicht Produktinhalt.

---
*Quellen: Claude-Code-Session-Log + Session-Links (9.7.2026), v6-Basis. Keine Secrets enthalten.*
