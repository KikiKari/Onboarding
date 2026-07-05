# Onboarding and Project Pages

Full-Stack-Landingpage mit interaktivem 3D-Teich-Hero, neun Projektseiten, Demos und token-basiertem Designsystem. Präsentation von neun eigenständigen Werkzeugen (GitHub-Branches) über eine kinematische Wasserfläche mit transparenten Glaskugeln.

## Vision

Der Nutzer landet auf einer ruhigen Teichszene bei goldenem Licht. Eine Master-Glaskugel ruht auf einem Seerosenblatt. Beim Klick rollt sie ins Wasser, ein Splash bedeckt kurz die Sicht — und aus dem Splash tauchen neun kleine Glaskugeln auf, jede eine der neun Projektseiten. Kein Bildschnitt, ein durchgehendes Video als Bühne.

## Ziel

Neun technische Projekte als sinnlich erfahrbare Perlen präsentieren. Ohne Ablenkung durch generische Marketing-Sprache. Ohne KI-Slop-Ästhetik. Jede Interaktion ist ein einzelner klarer Moment.

## Techniken & Methoden

### Frontend
- **Next.js 15** App Router + **React 19** + **TypeScript**
- **Tailwind CSS 3** mit CSS-Variablen als Design-Tokens
- **Framer Motion** für Story-State-Maschine (idle → hover → rolling → splash → distributed → hover-project → click-splash)
- **Wouter-artiges Hash-Routing** in Iframe-Sandbox-Kompatibilität

### Design-System
- **Farb-Tokens:** Sand-Beige `#FAF8F4`, dunkle Tinte `#1B1A17`, Kupfer `#A8542F`, Teal `#2E7D7B`
- **Fonts:** Newsreader (Display, serif), Hanken Grotesk (Body, sans), JetBrains Mono
- **Motion-Prinzip:** ruhige Konstanz + kurze dramatische Momente

### Media-Pipeline
- **OpenAI Sora-2** und **Sora-2-Pro** direkt via `POST /v1/videos` — 720p, 12-20s Clips, mit `input_reference` für Konsistenz
- **Video-Extensions** bis 120s Gesamtlänge für nahtlosen Story-Flow ohne Cuts
- **Nano Banana Pro** (WaveSpeed) für 9 transparente Glaskugeln mit dezenten Farbkernen
- **Blender 4.5.3 LTS** headless mit Cycles + Principled BSDF (Transmission 1.0, IOR 1.45) für 3D-Referenz-Renderings
- **ffmpeg** mit libx264 CRF 23-26 für Web-Optimierung

### Backend
- **FastAPI** (Python 3.13) mit Health-Endpoint und Kontakt-Endpoint
- **Docker Compose** für lokales Zusammenspiel
- **AWS ECS/App Runner** vorbereitet

### Deployment
- **Vercel** für Produktion des Next.js-Frontends
- **GitHub Actions** für CI/CD (typecheck, lint, vitest, pytest, secret-scan)
- **Docker Multi-Stage Build** ohne bind-mount → `--no-cache` build nach jedem Push

## Story-Sequenz (Pond Experience V4)

```
1. idle           Master-Orb ruht auf linkem Blatt (konstanter BG)
2. hover-master   Preview-Card blendet daneben ein
3. rolling        Master-Sprite rollt weg (800ms Animation)
4. splashing      Vollbild-Splash als Overlay, langes Fade-Out (1.2s)
5. distributed    9 Glaskugeln erscheinen auf rechtem Blatt
6. hover-project  Preview-Card mit Projekt-Titel + Summary
7. click-splash   Vollbild-Splash → GitHub-Branch öffnet
```

## Neun Projekt-Kugeln (GitHub-Branches)

| Slug | Platform | Zweck |
|---|---|---|
| abstractions | Claude | Multi-Node Abstraction Manager |
| clawhub | Claude | Bidirektionaler Skill-Sync |
| python-hardener | Claude | Python-Code-Hardening |
| secret-vault-public | Claude | Secret-Vault-Prototyp |
| tagesstatus-live-public | Claude | Tagesstatus-Live-Dashboard |
| tiktok-monitor | Claude | TikTok-Content-Monitor |
| Program-Derivation | Perplexity | Programmleitung + Vorlagen |
| Vision-Check | Perplexity | Bild-Analyse-PWA |
| Weather-Check | Perplexity | Lokaler Regen-Check-PWA |

## Lokal starten

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Health: http://localhost:8000/health

## Entwicklung

```bash
npm install
npm run dev
```

```bash
cd backend
python -m venv .venv
.venv/Scripts/pip install -r requirements-dev.txt
.venv/Scripts/pytest
```

## Media-Produktion

Alle Assets werden zur Build-Zeit über die Video-APIs generiert. Keine Runtime-Aufrufe im Produktions-Bundle. Provider-Schlüssel werden ausschließlich als lokale Umgebungsvariablen geladen.

```bash
npm run media:wavespeed    # Bild-Assets
npm run media:elevenlabs   # Audio (optional)
npm run media:optimize     # Kompression
```

Für neue Sora-Videos direkt via OpenAI-API (nicht mehr Wrapper) — siehe Skill `onboarding-pond-hero`.

## Sicherheit

- Keine Provider-Schlüssel im Browser-Bundle
- `.env`-Dateien nicht versioniert (nur `.env.example`)
- Codespace-Secrets über GitHub Repo- und Codespaces-Secrets bereitgestellt
- `pnpm secret:scan` läuft in CI

## Projektkontext (v5)

Die konsolidierte Projektdokumentation liegt unter [`docs/context/`](docs/context/) im Repo:

- [`Projektkontext_v5.md`](docs/context/Projektkontext_v5.md) — aktueller Umsetzungsstand Pond-Hero, offene QA-Punkte, Integrationen, Sicherheit
- [`Links_und_Erreichbarkeit_v5.md`](docs/context/Links_und_Erreichbarkeit_v5.md) — alle URLs kuratiert in 12 thematischen Sektionen

Beide Dokumente sind die verbindliche Referenz für die weitere Entwicklung mit Perplexity Computer + Claude Fable 5.

## Verwandte Ressourcen

- **Notion:** [Onboarding and Project Pages](https://app.notion.com/p/3878d8ad3db98116a5d4f68d8c8ad717)
- **Linear:** [0penclaw/onboarding-and-project-pages](https://linear.app/0penclaw/project/onboarding-and-project-pages-77bce25304c7/overview)
- **Canva:** [Produkt Landingpage](https://canva.link/mmgazbg6i0ml4b2)
- **Vercel:** [produkt-landingpage-3bb41d0a.vercel.app](https://produkt-landingpage-3bb41d0a.vercel.app/)

Provider- und Modellhinweise: [docs/PROVIDERS.md](docs/PROVIDERS.md)
