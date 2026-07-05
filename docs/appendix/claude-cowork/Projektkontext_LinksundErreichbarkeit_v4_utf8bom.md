# Projektkontext — Links & Erreichbarkeit (v4)
Status: OK = öffentlich erreichbar · auth = login-/kontogebunden · API = API-Endpunkt (Auth nötig) · lokal = nur lokal · temporär = signierte/generierte URL
Spalten: `URL | Typ | Beschreibung | Status | API/Webhook-URL`. **Keine Tokens/Secrets in dieser Datei.**
v4 = v3 (Kern unten kompakt) **+** neue Abschnitte 8–11 aus dem zweiten Designlauf und dem Perplexity-Übergang.

## 1–7 · Kernstand aus v3 (kompakt)
- https://github.com/KikiKari/Onboarding | Repo | App + docs, MIT, Release v1.0.0 | OK | `api.github.com/repos/KikiKari/Onboarding` (Bearer) + Repo-Webhooks
- https://produkt-landingpage-3bb41d0a.vercel.app/ | Deploy | Vercel-Prod, Git-verbunden | OK | `api.vercel.com/v13/deployments` (Bearer) · Deploy-Hook
- https://codex-full-stack.my.canva.site/ | Site | veröffentlichte Canva-Site | OK | Canva Connect `api.canva.com/rest/v1/` (OAuth)
- https://canva.link/mmgazbg6i0ml4b2 | Design | „Produkt Landingpage" (Code-Design) | OK | `api.canva.com/rest/v1/designs/{id}` (OAuth, nur Metadaten)
- https://linear.app/0penclaw/project/onboarding-and-project-pages-77bce25304c7 | Projekt | Linear, Completed | auth | `api.linear.app/graphql` (Bearer)
- https://app.notion.com/p/3878d8ad3db98116a5d4f68d8c8ad717 | Doku | Notion-Hauptseite + 5 Unterseiten | auth | `api.notion.com/v1` (Bearer, Notion-Version)
- GitHub `KikiKari/Projects` + `KikiKari/OpenClaw`, `kikikari.github.io/OpenClaw/*` | Repo/Pages | Ökosystem | OK | `api.github.com/...`
- sherpa-onnx (github.com/k2-fsa/sherpa-onnx, k2-fsa.github.io/sherpa/onnx) | TTS | lokale Runtime | OK | keine öffentl. API
- developers.openai.com/codex, /api/docs | Doku | offiziell | OK | OpenAI `api.openai.com/v1` (Bearer)
- ⚠ docs.codex.io | Fremdprodukt (DeFi-GraphQL, NICHT OpenAI Codex) | OK | `graph.codex.io/graphql`
- lokal: http://localhost:3000 / :8000/health / 127.0.0.1:4173 | lokal | Compose/Dev | lokal | —

## 8 · Bild-/Stock-Quellen (v4 Designlauf)
- https://unsplash.com/s/photos/water-lily · /license | Stock | Seerosen-Fotos, freie Lizenz | OK | `api.unsplash.com` (Client-ID/OAuth)
- https://pixabay.com/de/images/search/seerosen/ | Stock | freie Bilder | OK | `pixabay.com/api/` (API-Key)
- https://de.vecteezy.com/ (+ /api-docs, /api/v3/resources/…/download) | Stock | Fotos/Vektoren | OK | `vecteezy.com/api` (`VECTEEZY_API_KEY`) — Swagger: `vecteezy.com/api-docs/api/v2/swagger.json`
- https://www.istockphoto.com/ (diverse Seerosen-/water-lily-Treffer) | Stock | kostenpflichtig | OK | keine offene API (Getty Images API separat)
- https://de.freepik.com/search?query=seerosen | Stock | Fotos/Vektoren | OK | Freepik Partner-API (Key)
- https://stock.adobe.com/free | Stock | Adobe Stock | OK | Adobe Stock API (Key)
- https://www.rawpixel.com/public-domain · https://www.nasa.gov/nasa-brand-center/images-and-media/ | Stock/PD | Public Domain | OK | NASA: `images-api.nasa.gov`; rawpixel: keine offene API
- https://elements.envato.com/ · https://de.videezy.com · https://de.brusheezy.com · https://www.signatureedits.com/free-raw-photos/ | Stock | Assets/Brushes/RAW | OK | keine offene API (Abo)
- https://www.shutterstock.com/pricing · https://www.magnific.com/pricing · https://www.freepik.com/pricing · https://www.canva.com/photos/free/ · /pro/ | Stock/Tool | Preis-/Lizenzseiten | OK | (Shutterstock hat API mit Key)

## 9 · 3D-Modelle & 3D-/Design-Tools (v4)
- https://sketchfab.com/3d-models/water-lily-collection-73390addebb34fa3ababe6e677eb670d | 3D-Modell | Seerosen-Kollektion | OK | Sketchfab Data API `api.sketchfab.com/v3` (Token)
- https://wavespeed.ai/3d-generator · /models/tripo3d/h3.1/image-to-3d · /multiview-to-3d | 3D-Gen | Bild→3D (Tripo3D H3.1) | OK | `api.wavespeed.ai/api/v3/{model_id}` (Bearer), Webhook-Feld
- https://www.blender.org/download/ · https://www.blender.org/ | Tool | 3D-Modellierung/Rendering | OK | keine öffentl. API (lokal)
- https://www.gimp.org / /downloads/ | Tool | Bildbearbeitung (lokal 3.2.4) | OK | keine öffentl. API
- https://www.blendkit.com/plans/pricing/ (BlenderKit) | Assets | Blender-Modelle/Materialien/HDRIs | OK | BlenderKit-API (Key)

## 10 · KI-/Compute-APIs (v4)
- https://integrate.api.nvidia.com/v1/chat/completions | API | NVIDIA NIM (u. a. `nvidia/usdcode`, Kimi-K2.6) — USD/3D-Code | API | Header `Authorization: Bearer nvapi-…` (`NVIDIA_CODEX`)
- https://www.perplexity.ai/computer/tasks/0a748f67-db03-4a2a-a942-6b05e4612915?view=thread | Prozess | Perplexity Computer + Claude Fable 5 (laufende Umsetzung) | auth | Perplexity-API `api.perplexity.ai` (Bearer, separat)

## 11 · WaveSpeed-Ökosystem & generierte Outputs (v4)
- https://wavespeed.ai/ · /docs · /blog · /docs/data-retention-policy | Provider/Doku | Bild-/3D-Gen | OK | `api.wavespeed.ai/api/v3/...` (Bearer)
- https://status.wavespeed.ai/ | Status | Systemstatus | OK | Status-JSON (statuspage)
- https://github.com/WaveSpeedAI · https://x.com/wavespeed_ai · https://discord.com/invite/7WQTe7jMmY | Community | Repo/Social | OK | —
- https://d2p7pge43lyniu.cloudfront.net/output/*.png | Output | generierte Bild-Outputs (WaveSpeed/Perplexity Computer) | temporär | keine API (CDN, nicht dauerhaft)

---
Hinweise: iStock-/Pixabay-Affiliate-Varianten sind zu einem Eintrag zusammengefasst. Werbe-/Tracking-Links (doubleclick/o2), Cloudflare-Challenge-URLs und signierte Download-Hashes sind bewusst **nicht** aufgenommen. `VECTEEZY_API_KEY` und `NVIDIA_CODEX` liegen lokal in der gitignorierten `.env` — als offengelegt behandeln und rotieren.
