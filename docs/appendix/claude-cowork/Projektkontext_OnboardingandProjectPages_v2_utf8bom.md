# Projektkontext — "Onboarding and Project Pages" (v2, konsolidiert)

> Stand: 21. Juni 2026 · Reiner Kontext / Dokumentation · **Keine Eingriffe in die laufende Codex-Entwicklung**
> Quelle: laufende Codex-Sitzung `codex://threads/019ee96c-cf44-7560-8c8a-867ebe243765`
> Arbeitsverzeichnis (lokal, read-only): `C:\Users\silve\Documents\Codex\Claude Design`
> Diese v2 ersetzt die erste Fassung und arbeitet zusätzlich den vollständigen Codex-Chatverlauf ein.

---

## 1. Projektüberblick

**Onboarding and Project Pages** — eigenständige, responsive Full-Stack-Landingpage, entstanden in einer laufenden Codex-Sitzung. Sie präsentiert die neun Projekte aus dem GitHub-Repo nach dem Branch-pro-Projekt-Modell. Cowork unterstützt hier ausschließlich **lesend/dokumentierend** — keine umzusetzenden Aufgaben aus dem Projektinhalt.

**Tech-Stack**

- Frontend: Next.js (App Router) + TypeScript
- Styling: Tailwind, token-basiertes Design-System (CSS-Variablen/Theme-Tokens, keine hartcodierten Werte)
- Animation: Framer Motion (Scroll-Reveals, Hover-States, rotierende Headline, Globe/Kugelblitz-Sequenz)
- Backend: FastAPI (`GET /health`, `POST /api/contact` — Name/E-Mail/Nachricht, ohne Persistenz)
- Infrastruktur: je ein Dockerfile (Frontend/Backend) + `docker-compose.yml`; getrennte Deploy-Vorbereitung Vercel (Frontend) und AWS ECS/App Runner (Backend) — vorbereitet, nicht deployt

## 2. Kanonische Designquelle

- Lokale Vorlage `design-reference/Produkt Landingpage.dc.html` ist die verbindliche technische Designquelle (Tokens, Komponentennamen).
- Tokens (Auszug): `--bg #FAF8F4`, `--surface #FFFFFF`, `--surface-2 #F1EEE7`, `--ink #1B1A17`, `--muted #6E6A61`, `--line #E5E1D8`, Akzente (anpassbar / Teal / Amber). Fonts: Newsreader (Display), Hanken Grotesk (Sans), JetBrains Mono (Mono). Spacing 4px-Basis. Radien sm/md/lg/pill.
- Komponenten: `Header`, `Hero`, `GlassOrb`, `FeatureGrid`, `FeatureSpotlight`, `StepGrid`, `CTASection`, `Footer`; UI-Primitives unter `components/ui/` (`Button`, `Card`, `Section`, `Container`, `Badge`, `Hero`).

## 3. Seitenstruktur

- `/` — Landingpage nach der `.dc.html`-Vorlage
- `/projects/[slug]` — neun datengetriebene Project Pages
- `/demos/vision-check` — isolierte, bereinigte Demo (Kamera/Upload, lokale Erkennung)
- `/labs/periodensystem` — React-Port des interaktiven Periodensystems
- Inhalte datengetrieben in `content.ts`

## 4. Verbundene Ressourcen / Ökosystem

| Ressource | Details |
|---|---|
| **Claude Design** | `claude.ai/design` — Ausgangs-Design; lokale `.dc.html` als kanonische Quelle |
| **GitHub** | `KikiKari/Projects` — Branch-pro-Projekt, `main` = Index. MIT-Lizenz (Karim Kiki, 2026) |
| **Canva** | "Produkt Landingpage", ID `DAHNMLUWb7w`, Typ "Code" — per API **nicht** inhaltlich editierbar, nur visuelle Referenz |
| **Vercel** | https://produkt-landingpage-3bb41d0a.vercel.app/ |
| **WaveSpeed.ai** | Nano Banana 2 (Edit), 7 finale 4K-Assets; nur lokale Asset-Produktion, nicht zur Laufzeit |
| **ElevenLabs** | Deutsche Kurz-Narration als statisches MP3; Start nur nach Nutzeraktion, kein Key im Browser |
| **sherpa-onnx (lokal)** | TTS-Runtime, Piper-VITS-Modell `de_DE-kerstin-low` — Offline-Sprachsynthese-Option |

### GitHub-Branches (9 Projekte + `main`)

| Branch | Plattform | Kurzbeschreibung |
|---|---|---|
| `abstractions` | Claude | Multi-Node Abstraction Manager, portiert OpenClaw-Scripts per Cron in 10 Zielsprachen |
| `clawhub` | Claude | Bidirektionaler Sync-/Publish-Agent zwischen ClawHub und Git |
| `python-hardener` | Claude | Skill + Eval-Suite zum automatischen Absichern von Python-Scripts |
| `secret-vault-public` | Claude | Client-seitiges Browser-Artefakt für verschlüsselten Secret-Container (WebCrypto, AES-256-GCM) |
| `tagesstatus-live-public` | Claude | Umgebungs-unabhängige Live-Status-Seite mehrerer Dienste |
| `tiktok-monitor` | Claude | TikTok-LIVE-Monitor (`tt-live`), Live-Status + m3u8 + Events |
| `Program-Derivation` | Perplexity | Skill für formale Programmableitung + Code-Metriken |
| `Vision-Check` | Perplexity | Browser-App zur KI-Objekterkennung (TensorFlow.js / COCO-SSD) |
| `Weather-Check` | Perplexity | Lokaler Regen-Check als PWA (DWD-Radar, Open-Meteo u. a.) |

## 5. Entwicklungs- und Medienverlauf (aus dem Codex-Chat eingearbeitet)

- **Hero-Animation:** rotierende Headline plus performante Pseudo-3D-Sequenz — ein Kugelblitz lädt sich auf, setzt mehrere Glaskugeln frei, die auf Tiefenbahnen fliegen, auf der Wiese abfedern und in Endpositionen rollen. Steuerung über Framer Motion (Perspektive, Skalierung, Rotation, Schatten, Tiefenstaffelung); bei `prefers-reduced-motion` ruhige Endposition. Keine schwere 3D-Lib.
- **WaveSpeed-Assets:** sieben finale 4K-PNGs (Hero-Wiese, Glaskugel, Feature-Spotlight, Claude-Projektfamilie, Perplexity-Projektfamilie, CTA-Hintergrund, Open-Graph-Motiv), anschließend WebP/AVIF-Derivate. Erzeugung über lokales, manuell gestartetes Script mit Provenienz-Protokoll.
- **Kostenstand (laut Kostenprotokoll):** tatsächliche WaveSpeed-Produktionskosten ~0,98 USD; 50-USD-Aufladung am 21.06.2026 erfolgt, ausgewiesenes Guthaben ~54,87 USD. ElevenLabs-Narration mit ~93 Credits, 0,00 USD Zusatzkosten; **Free-Tarif enthält keine kommerzielle Lizenz** — für kommerzielle Veröffentlichung Audio nach Tarif-Upgrade neu erzeugen/lizenzieren.
- **Asset-Bibliothek:** zusätzliche 4K-Beispiele und Globus-Frames katalogisiert (u. a. `docs/appendix/wavespeed-4k/`, `docs/reference-library/`); kreative Bildquellen von operativen Screenshots (Zahlungsbelege, Dashboards, Key-Ansichten) getrennt — Letztere bleiben außerhalb des Webprojekts.
- **Docker:** beide Images lokal erfolgreich gebaut; **kein** Hub-Login/Push (für die Abnahme ohne Mehrwert, daher bewusst nicht ausgeführt).
- **QA:** TypeScript/ESLint/Build/Unit/Pytest/Secret-Scan weitgehend grün; offene Punkte: 4K-Anhang/Provider-Doku abschließen, Browser-/Docker-Abnahme (`docker compose up --build`).
- **Optionale Werkzeuge (im Verlauf erwähnt):** sherpa-onnx (lokale TTS), GIMP, OpenClaw/Three.js, Perplexity — dokumentiert ohne Schlüsselwerte.

## 6. Codex-Setup (Kontext)

- Aktivierte Codex-Plugins für dieses Projekt: **Documents, PDF, Spreadsheets, Browser, Computer, Build Web Apps**.
- Offizielle Quellen: `developers.openai.com/codex` und `developers.openai.com/api/docs`. **Achtung:** `docs.codex.io` ist ein anderes Produkt (DeFi-/Blockchain-GraphQL-API), NICHT OpenAI Codex.

## 7. Sicherheits-/Secrets-Hinweis ⚠️

Im Projektmaterial (`design-reference/uploads/missing.md`) und in Chat-Verläufen lagen **echte API-Keys/Tokens im Klartext** — u. a. WaveSpeed, ein weiterer Token sowie ein Docker-PAT (`docker login -u kikikari …`). Codex hat diese als kompromittiert/offengelegt markiert.

**In diesem Dokument sind bewusst KEINE Schlüsselwerte enthalten.**

Empfehlung:

1. Alle betroffenen Keys/Token **rotieren / neu erstellen**: WaveSpeed, ElevenLabs, der Docker-PAT und alle weiteren in `missing.md`.
2. Klartext-Vorkommen entfernen bzw. sicher verwahren (verschlüsselter Vault).
3. `.env*`, `design-reference/uploads/` und ZIP-Dateien aus Repo/Build/Docker-Kontext ausschließen (im Projekt per `.gitignore`/Secret-Scan vorgesehen).

## 8. Ablage / Konsolidierung (Ordner `Documents\Claude\cowork\`)

Aktueller Stand des Ordners (4 Dateien):

| Datei | Status / Empfehlung |
|---|---|
| `Chat Verlauf.md` (284 KB) | Codex-Verlauf, Markdown — **behalten** als Referenz |
| `Chat Verlauf.txt` (284 KB) | inhaltlich identisch zur `.md` — **redundant, kann gelöscht werden** (eine Fassung genügt) |
| `Projektkontext_OnboardingandProjectPages.md` (6 KB) | erste Fassung **ohne BOM** → verursacht Mojibake beim Lesen via PowerShell — **durch diese v2 ersetzen** |
| `Projektkontext_OnboardingandProjectPages_utf8bom.md` (6 KB) | BOM-Variante der v1 — durch diese v2 ersetzen |

Empfohlene Ziel-Ablage: **diese Datei** (`…_v2.md`, UTF-8 mit BOM) als kanonische Kontext-Doku + **eine** Chatverlauf-Datei. Encoding-Hinweis: beim Einlesen via PowerShell `Get-Content … -Encoding UTF8` verwenden, dann gibt es kein Mojibake.

---

*Dieses Dokument fasst ausschließlich Kontext zusammen. Die Entwicklung läuft in Codex; am Projektordner wurden keine Änderungen vorgenommen.*
