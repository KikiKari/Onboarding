# Projektkontext — "Onboarding and Project Pages" (v3, finalisiert)

> Stand: 22. Juni 2026 · Finalisierte Fassung · **Keine Eingriffe in die Codex-Entwicklung**
> Quelle: Codex-Session `codex://threads/019ee96c-cf44-7560-8c8a-867ebe243765`
> Arbeitsverzeichnis (lokal): `C:\Users\silve\Documents\Codex\Claude Design`
> Projekt-Archive: `C:\Users\silve\Documents\Claude\cowork\Claude Design.zip` und `… .tar`
> v3 ersetzt v1/v2 als aktueller Stand. v2 bleibt im Codex-Projekt als unveränderter Quellenanhang (mit SHA-256) erhalten; sie zeigte noch einen älteren Zwischenstand (offene Browser-/Docker-Abnahme), der hier korrigiert ist.

---

## 1. Projektüberblick

**Onboarding and Project Pages** — eigenständige, responsive Full-Stack-Landingpage aus der Codex-Session, die die neun Projekte aus dem GitHub-Repo (Branch-pro-Projekt) präsentiert. Cowork unterstützt ausschließlich **lesend/dokumentierend**.

**Tech-Stack**

- Frontend: Next.js (App Router) + TypeScript
- Styling: Tailwind, token-basiertes Design-System (CSS-Variablen/Theme-Tokens)
- Animation: Framer Motion (Scroll-Reveals, Hover-States, rotierende Headline, Kugelblitz-/Globe-Sequenz; `globe-hero.tsx`)
- Backend: FastAPI (`GET /health`, `POST /api/contact` — ohne Persistenz)
- Infrastruktur: Dockerfiles (Frontend/Backend) + `docker-compose.yml`; Deploy-Vorbereitung Vercel + AWS ECS/App Runner

## 2. Kanonische Designquelle

- Lokale Vorlage `design-reference/Produkt Landingpage.dc.html` ist die verbindliche technische Designquelle.
- Tokens (Auszug): `--bg #FAF8F4`, `--surface #FFFFFF`, `--surface-2 #F1EEE7`, `--ink #1B1A17`, `--muted #6E6A61`, `--line #E5E1D8`, Akzente (anpassbar / Teal / Amber). Fonts: Newsreader / Hanken Grotesk / JetBrains Mono. Spacing 4px, Radien sm/md/lg/pill.
- Komponenten: `Header`, `Hero`, `GlassOrb`, `FeatureGrid`, `FeatureSpotlight`, `StepGrid`, `CTASection`, `Footer`; UI-Primitives unter `components/ui/`.

## 3. Seitenstruktur

- `/` — Landingpage nach der `.dc.html`-Vorlage
- `/projects/[slug]` — neun datengetriebene Project Pages
- `/demos/vision-check` — bereinigte Demo (Kamera/Upload, lokale Erkennung)
- `/labs/periodensystem` — React-Port des interaktiven Periodensystems
- Inhalte datengetrieben in `content.ts`

## 4. Verbundene Ressourcen / Ökosystem

| Ressource | Details |
|---|---|
| **Claude Design** | `claude.ai/design` — Ausgangs-Design; lokale `.dc.html` als kanonische Quelle |
| **GitHub** | `KikiKari/Projects` — Branch-pro-Projekt, `main` = Index. MIT-Lizenz (Karim Kiki, 2026) |
| **Canva** | "Produkt Landingpage", ID `DAHNMLUWb7w`, Typ "Code" — per API nicht inhaltlich editierbar; veröffentlicht unter `codex-full-stack.my.canva.site` |
| **Vercel** | https://produkt-landingpage-3bb41d0a.vercel.app/ |
| **WaveSpeed.ai** | Nano Banana 2, 7 finale 4K-Assets; nur lokale Produktion |
| **ElevenLabs** | Deutsche Kurz-Narration als statisches MP3; Start nur nach Nutzeraktion |
| **sherpa-onnx (lokal)** | Piper-VITS-Modell `de_DE-kerstin-low` lokal vorhanden (Archiv ~55,56 MiB + ONNX, per Hash dokumentiert). Ausführbare Runtime separat — Quellen dokumentiert; Community-Docker-Image nur mit Versions-Pinning + Digest-Prüfung |

### GitHub-Branches (9 Projekte + `main`)

| Branch | Plattform | Kurzbeschreibung |
|---|---|---|
| `abstractions` | Claude | Multi-Node Abstraction Manager, portiert OpenClaw-Scripts per Cron in 10 Zielsprachen |
| `clawhub` | Claude | Bidirektionaler Sync-/Publish-Agent zwischen ClawHub und Git |
| `python-hardener` | Claude | Skill + Eval-Suite zum Absichern von Python-Scripts |
| `secret-vault-public` | Claude | Client-seitiges Browser-Artefakt für verschlüsselten Secret-Container (WebCrypto, AES-256-GCM) |
| `tagesstatus-live-public` | Claude | Umgebungs-unabhängige Live-Status-Seite mehrerer Dienste |
| `tiktok-monitor` | Claude | TikTok-LIVE-Monitor (`tt-live`), Live-Status + m3u8 + Events |
| `Program-Derivation` | Perplexity | Skill für formale Programmableitung + Code-Metriken |
| `Vision-Check` | Perplexity | Browser-App zur KI-Objekterkennung (TensorFlow.js / COCO-SSD) |
| `Weather-Check` | Perplexity | Lokaler Regen-Check als PWA (DWD-Radar, Open-Meteo u. a.) |

## 5. Entwicklungs- und Medienverlauf

- **Hero-Animation:** rotierende Headline + Pseudo-3D-Sequenz (Kugelblitz lädt sich auf, setzt Glaskugeln frei, die auf Tiefenbahnen fliegen, auf der Wiese abfedern und ausrollen); Framer Motion, `prefers-reduced-motion`-Fallback. Keine schwere 3D-Lib.
- **WaveSpeed-Assets:** 7 finale 4K-PNGs + WebP/AVIF-Derivate, mit Provenienz-Protokoll.
- **Kostenstand:** WaveSpeed-Produktion ~0,98 USD; 50-USD-Aufladung erfolgt, Guthaben ~54,87 USD. ElevenLabs ~93 Credits, 0,00 USD Zusatzkosten; **Free-Tarif ohne kommerzielle Lizenz** — für kommerzielle Veröffentlichung Audio nach Tarif-Upgrade neu erzeugen/lizenzieren.
- **Asset-Bibliothek:** 4K-Beispiele + Globus-Frames katalogisiert (`docs/appendix/wavespeed-4k/`, `docs/reference-library/`); kreative Quellen von operativen Screenshots getrennt.
- **Docker:** beide Images lokal gebaut; kein Hub-Push (für Abnahme ohne Mehrwert).

## 6. Endstand & Abnahme (ABGESCHLOSSEN)

- **Implementierung und Abnahme abgeschlossen.**
- Compose-Dienste laufen: **Frontend** `http://localhost:3000`, **Backend** `http://localhost:8000` (Status **healthy**).
- Startbefehl: `docker compose up --build`.
- **Secret-Scan bestanden.** QA (TypeScript/ESLint/Build/Unit/Pytest) grün.
- Änderungsumfang zuletzt: 65 Dateien (+2.369 / −29).
- Hinweis: Die in v2 noch als „offen" geführte Browser-/Docker-Abnahme ist hiermit erledigt; v2 spiegelte einen älteren Zwischenstand.

## 7. Projektdokumentation (im Codex-Projekt angelegt)

`docs/PROJECT_CONTEXT_CLAUDE_COWORK.md` (Codex-Abgleich), `docs/PROVIDERS.md`, `docs/SECRETS_AND_MONITORING.md`, `docs/SHERPA_ONNX_TTS.md`, `docs/SOURCES.md`, `docs/appendix/claude-cowork/README.md` (Cowork-v2 unverändert + SHA-256), `docs/appendix/wavespeed-4k/README.md`, `docs/reference-library/README.md`, `docs/hero-screenshot.png` (finaler Hero-Screenshot).

## 8. Codex-Setup (Kontext)

- Aktivierte Codex-Plugins: **Documents, PDF, Spreadsheets, Browser, Computer, Build Web Apps**.
- Sandbox auf „Vollzugriff" gestellt — kein Windows-Neustart nötig; für die Übernahme Codex Desktop einmal vollständig schließen/neu öffnen (laufende Sitzung behält Start-Berechtigungen).
- Offizielle Quellen: `developers.openai.com/codex`, `developers.openai.com/api/docs`. **`docs.codex.io` ist ein Fremdprodukt** (DeFi/Blockchain), NICHT OpenAI Codex.

## 9. Sicherheits-/Secrets-Hinweis ⚠️

Im Material (`design-reference/uploads/missing.md`) und in Chat-Verläufen lagen **echte API-Keys/Tokens im Klartext** — WaveSpeed, ein weiterer Token sowie ein Docker-PAT. **In dieser Datei stehen KEINE Schlüsselwerte.**

Empfehlung: alle betroffenen Keys/Token **rotieren/neu erstellen** (WaveSpeed, ElevenLabs, Docker-PAT, weitere aus `missing.md`); Klartext-Vorkommen entfernen/sicher verwahren; `.env*`, `design-reference/uploads/`, ZIPs aus Repo/Build/Docker ausschließen (per `.gitignore`/Secret-Scan vorgesehen). Details: `docs/SECRETS_AND_MONITORING.md`.

---

*Reine Dokumentation. Die Entwicklung läuft in Codex; am Projektordner wurden keine Änderungen vorgenommen.*
