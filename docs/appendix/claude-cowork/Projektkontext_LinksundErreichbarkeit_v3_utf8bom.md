# Projektkontext — Links & Erreichbarkeit (v3, finalisiert)
Status-Legende: OK = öffentlich erreichbar · auth = konto-/login-gebunden · API = API-Endpunkt (Auth nötig) · lokal = nur lokal · temporär = signierte URL

v3 = v2 + neu dazugekommene Einträge aus dem finalen Codex-Stand (Compose-Service-URLs `localhost`, neue Projektdoku-Dateien, Projekt-Archive). Spalte **API/Webhook-URL** wie in v2 beibehalten. **Keine Tokens/Keys/Secrets** in dieser Datei.

Spaltenformat je Eintrag: `URL | Typ | Beschreibung | Status | API/Webhook-URL`

## 1. Projekt / Design
- https://produkt-landingpage-3bb41d0a.vercel.app/ | Deploy | Vercel-Deploy der Landingpage | OK | Vercel REST: `POST https://api.vercel.com/v13/deployments` (Header `Authorization: Bearer <TOKEN>`); Deploy-Hook (kein Auth, POST): `https://api.vercel.com/v1/integrations/deploy/<prj_id>/<hook_id>`
- https://codex-full-stack.my.canva.site/ | Veröffentlichte Site | Canva-veröffentlichte Site | OK | Canva Connect: Basis `https://api.canva.com/rest/v1/` (OAuth 2.0, `Authorization: Bearer <TOKEN>`)
- https://canva.link/mmgazbg6i0ml4b2 | Design-Sharelink | Canva-Sharelink (Design "Produkt Landingpage", Typ Code) | OK (öffnet Editor) | Canva Connect: `GET https://api.canva.com/rest/v1/designs/{designId}` (OAuth Bearer)
- https://www.canva.com/design/DAHNMLUWb7w/.../edit | Design (Editor) | Canva-Editor-Link | auth | Canva Connect: `GET/POST https://api.canva.com/rest/v1/designs` · Export: `POST https://api.canva.com/rest/v1/exports` (OAuth Bearer)
- https://www.canva.com/d/… | Design (Kurzlink) | Canva-Kurzlinks | auth | Canva Connect: `https://api.canva.com/rest/v1/designs/{designId}` (OAuth Bearer)
- https://claude.ai/design/p/a5ce197a-…?file=Produkt+Landingpage.dc.html&via=share | Claude Design | Ausgangs-Design (Sharelink) | auth | keine öffentliche API
- https://www.canva.dev/docs/ | Doku | Canva-Entwicklerdoku | OK | keine öffentliche API (Doku-Seite); beschriebene API: Canva Connect `https://api.canva.com/rest/v1/`
- https://www.canva.com/help/get-in-touch/troubleshooting/ | Hilfe | Canva-Troubleshooting | OK | keine öffentliche API

## 2. GitHub
- https://github.com/KikiKari/Projects | Repo | Haupt-Repo (Branch-pro-Projekt) | OK | REST: `https://api.github.com/repos/KikiKari/Projects` (Header `Authorization: Bearer <TOKEN>`, `Accept: application/vnd.github+json`); Webhooks: Payload-URL für Repo-Events (`/repos/KikiKari/Projects/hooks`)
- https://github.com/KikiKari/Projects/branches/all | Repo | Branch-Übersicht (9+main) | OK | REST: `GET https://api.github.com/repos/KikiKari/Projects/branches`
- https://github.com/KikiKari/Projects/tree/<branch> | Repo | Projekt-Branches (abstractions, clawhub, python-hardener, secret-vault-public, tagesstatus-live-public, tiktok-monitor, Program-Derivation, Vision-Check, Weather-Check) | OK | REST: `GET https://api.github.com/repos/KikiKari/Projects/git/trees/{branch}?recursive=1` · Inhalte: `GET /repos/KikiKari/Projects/contents/{path}?ref={branch}`
- https://github.com/KikiKari/Projects/blob/main/LICENSE · ?tab=MIT-1-ov-file | Lizenz | MIT (Karim Kiki, 2026) | OK | REST: `GET https://api.github.com/repos/KikiKari/Projects/license`
- https://github.com/KikiKari/OpenClaw | Repo | OpenClaw-Repo | OK | REST: `https://api.github.com/repos/KikiKari/OpenClaw` (Bearer)
- https://github.com/KikiKari/OpenClaw/actions · /tree/gh-pages | Repo | Actions + Pages-Branch | OK | REST: `GET https://api.github.com/repos/KikiKari/OpenClaw/actions/runs` · Pages: `GET /repos/KikiKari/OpenClaw/pages`
- https://github.com/KikiKari/OpenClaw/blob/main/assets/gen_mcp_flow.py · gen_mcp_flow_gif.py | Quellcode | Generator-Scripts | OK | REST: `GET https://api.github.com/repos/KikiKari/OpenClaw/contents/assets/gen_mcp_flow.py` (Roh via `raw.githubusercontent.com`)
- https://kikikari.github.io/OpenClaw/index.html · /mcp-flow.html | GitHub Pages | Veröffentlichte OpenClaw-Seiten | OK | keine öffentliche API (statisches Pages-Hosting); Build-Status via `GET https://api.github.com/repos/KikiKari/OpenClaw/pages/builds`

## 3. Provider / Docs
- https://wavespeed.ai/ · /docs · /docs/api-authentication | Provider/Doku | WaveSpeed (Nano Banana 2) | OK | REST v3: `POST https://api.wavespeed.ai/api/v3/{model_id}` (Task), Ergebnis `GET https://api.wavespeed.ai/api/v3/predictions/{id}/result`; Header `Authorization: Bearer <API_KEY>`; Webhook-Callback per `webhook`-Feld
- https://api.wavespeed.ai/api/v3/balance | API | WaveSpeed-API | API | `GET https://api.wavespeed.ai/api/v3/balance` (Bearer)
- https://elevenlabs.io/docs/overview/intro · /eleven-api/quickstart · /docs/api-reference/text-to-speech/convert | Provider/Doku | ElevenLabs TTS-Doku | OK | REST: `POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}` (Header `xi-api-key`); Webhooks im Dashboard
- https://api.elevenlabs.io/… | API | ElevenLabs-API | API | Basis `https://api.elevenlabs.io/v1/...` — `/v1/voices`, `/v1/user/subscription`, `/v1/text-to-speech/{voice_id}/stream`; Header `xi-api-key`
- https://developers.openai.com/codex | Doku | Offizielle Codex-Doku | OK | keine klassische REST-API; via Codex CLI/SDK (non-interactive) bzw. MCP
- https://developers.openai.com/api/docs | Doku | OpenAI API-Doku | OK | Basis `https://api.openai.com/v1/...` (Bearer); z. B. `/v1/responses`, `/v1/chat/completions`
- https://docs.codex.io/ | Fremdprodukt | NICHT OpenAI Codex — DeFi/Blockchain-GraphQL | OK, falsches Produkt | GraphQL `https://graph.codex.io/graphql` (WS `wss://graph.codex.io/graphql`); ⚠ NICHT OpenAI Codex
- https://ai.google.dev/gemini-api/terms | Recht/Doku | Gemini-API-Bedingungen | OK | Basis `https://generativelanguage.googleapis.com/v1beta/...` — `POST /v1beta/models/{model}:generateContent`; Auth `x-goog-api-key`
- https://www.perplexity.ai/products/computer | Provider | Perplexity Computer | OK | keine eigene API für Produktseite; Dev-API `https://api.perplexity.ai/...`
- https://docs.perplexity.ai/docs/getting-started/overview | Doku | Perplexity-API-Doku | OK | `POST https://api.perplexity.ai/chat/completions` (Bearer); OpenAI-kompatibel
- https://api.perplexity.ai/… | API | Perplexity-API | API | `https://api.perplexity.ai/...` — `/chat/completions`, `/search`, `/async/chat/completions`; Bearer

## 4. sherpa-onnx / TTS
- https://github.com/k2-fsa/sherpa-onnx (+ /releases) | Repo/Releases | sherpa-onnx Runtime/Binaries | OK | keine öffentliche API (lokale Runtime); Releases via `GET https://api.github.com/repos/k2-fsa/sherpa-onnx/releases`
- https://k2-fsa.github.io/sherpa/onnx/index.html · /tts/index.html · /tts/pretrained_models/index.html | Doku | sherpa-onnx + TTS-Doku | OK | keine öffentliche API (statische Doku)
- https://huggingface.co/csukuangfj/vits-piper-de_DE-kerstin-low/blob/main/vits-piper-de_DE.sh | Modell | Piper-VITS „de_DE-kerstin-low" | OK | Hub-API `GET https://huggingface.co/api/models/csukuangfj/vits-piper-de_DE-kerstin-low`; Resolve `https://huggingface.co/.../resolve/main/{datei}`; opt. `Authorization: Bearer <HF_TOKEN>`
- https://sourceforge.net/projects/piper-tts.mirror/files/v0.0.2/voice-de-kerstin-low.tar.gz/download | Modell-Download | Kerstin-Stimme (SF-Mirror) | OK | keine öffentliche API (Datei-Download)
- https://github.com/CodeBySonu95/VoxSherpa-TTS/releases | Releases | VoxSherpa-TTS | OK | keine öffentliche API; Releases via `GET https://api.github.com/repos/CodeBySonu95/VoxSherpa-TTS/releases`
- https://open-vsx.org/extension/analytics-in-motion/wake-word | Extension | Wake-Word (Open VSX) | OK | Open-VSX-API (öffentlich, lesend): `GET https://open-vsx.org/api/analytics-in-motion/wake-word`
- https://hub.docker.com/r/yaming116/sherpa-onnx-docker | Docker-Image | Community-Image | OK | Hub-API `GET https://hub.docker.com/v2/repositories/yaming116/sherpa-onnx-docker`; Pull via `registry-1.docker.io`

## 5. Tools / Infrastruktur
- https://www.gimp.org/downloads/ · docs.gimp.org · gimp.org/docs/ | Tool/Doku | GIMP | OK | keine öffentliche API
- https://linear.app/0penclaw/projects/all | Projektmgmt | Linear (privat) | auth | GraphQL `POST https://api.linear.app/graphql` (Header `Authorization` / OAuth Bearer); Webhooks im Workspace
- https://app.notion.com/kikikari/ | Wissensbasis | Notion (privat) | auth | Basis `https://api.notion.com/v1/...` (Bearer, `Notion-Version: <YYYY-MM-DD>`)
- https://vercel.com/openclaw-vercel-project | Deploy-Dashboard | Vercel-Projekt (privat) | auth | REST `GET https://api.vercel.com/v9/projects/{idOrName}` (Bearer); Deploy-Hook-URL pro Branch

## 6. Generische CDN / GitHub-Infra
- https://github.com · docs.github.com · githubstatus.com | Infra | Allg. GitHub | OK | REST `https://api.github.com/` (Bearer); Status (kein Auth): `GET https://www.githubstatus.com/api/v2/status.json`
- https://unpkg.com/react@18.3.1/… · react-dom@18.3.1/… | CDN | React-UMD | OK | keine REST-API; Schema `https://unpkg.com/:package@:version/:file`
- https://fonts.googleapis.com · fonts.gstatic.com | CDN | Google Fonts | OK | CDN ohne API; Metadaten `GET https://www.googleapis.com/webfonts/v1/webfonts?key=<API_KEY>`
- https://developers.google.com/identity/gsi/… | Doku | Google Identity/FedCM | OK | keine REST-Daten-API; OAuth `https://accounts.google.com/o/oauth2/v2/auth` + `https://oauth2.googleapis.com/token`
- https://nextjs.org/docs/messages/missing-data-scroll-behavior | Doku | Next.js-Hinweis | OK | keine öffentliche API
- https://static.canva.com/… | CDN | Canva-Editor-Asset | OK | keine öffentliche API
- https://design-manipulation-download.canva.com/… (X-Amz-…) | temporär | Signierte Canva-Downloads | temporär (nicht geprüft) | keine öffentliche API; regulär: Canva Connect Export `POST https://api.canva.com/rest/v1/exports`

## 7. Lokal (Compose / Dev-Server) — nicht extern prüfbar
- http://localhost:3000  (≙ http://127.0.0.1:3000 / :3001) | lokal | Frontend (Compose, NEU in v3) | lokal | lokaler Next.js-Dienst; keine öffentliche API
- http://localhost:8000  (≙ http://127.0.0.1:8000) | lokal | Backend (Compose, NEU in v3) | lokal | FastAPI: `GET http://localhost:8000/health` (lokal); `POST /api/contact`
- http://127.0.0.1:4173/… | lokal | Lokaler Vorschau-Server (Design-Vorlage) | lokal | keine öffentliche API (Vite-Preview)
- Startbefehl Compose: `docker compose up --build` | lokal | Frontend healthy :3000, Backend healthy :8000 | lokal | —

## 8. Lokale Artefakte (keine URLs) — NEU in v3
- `C:\Users\silve\Documents\Codex\Claude Design\` | Pfad | Codex-Arbeitsverzeichnis | lokal | —
- `C:\Users\silve\Documents\Claude\cowork\Claude Design.zip` · `… .tar` | Archiv | Projekt-Archive | lokal | —
- `…/Onboarding and Project Pages/docs/PROJECT_CONTEXT_CLAUDE_COWORK.md` · `PROVIDERS.md` · `SECRETS_AND_MONITORING.md` · `SHERPA_ONNX_TTS.md` · `SOURCES.md` · `appendix/claude-cowork/README.md` · `appendix/wavespeed-4k/README.md` · `reference-library/README.md` · `hero-screenshot.png` | Doku | Im Codex-Projekt angelegte Dokumentation | lokal | —
- `codex://threads/019ee96c-cf44-7560-8c8a-867ebe243765` | Deeplink | Codex-Session-Referenz | lokal | —

---
Quellen (offizielle Docs): WaveSpeed wavespeed.ai/docs · ElevenLabs elevenlabs.io/docs · OpenAI developers.openai.com/api/docs · Perplexity docs.perplexity.ai · GitHub docs.github.com/rest · docs.github.com/webhooks · Canva canva.dev/docs/connect · Vercel vercel.com/docs/rest-api · /deploy-hooks · /webhooks · Gemini ai.google.dev · Hugging Face huggingface.co/docs/hub/api · Docker Hub docs.docker.com/reference/api/hub/latest · Linear developers.linear.app · Notion developers.notion.com · Open VSX open-vsx.org · Codex.io (Fremdprodukt) graph.codex.io
