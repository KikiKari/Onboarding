# Projektkontext — Links & Erreichbarkeit (v5)
Stand: 5. Juli 2026 · konsolidiert aus v4 + Pond-Hero-Session (261 kuratierte URLs).
Format je Eintrag: `URL/Kanonisch — Beschreibung — Doc/API (falls relevant)`. Status: OK öffentlich · auth login-gebunden · API Auth nötig · lokal · temporär.
**Keine Tokens/Secrets in dieser Datei.** Einzelne Stock-Vorschaubilder, Cloudfront-Thumbnails und Tracking-Links sind zu Provider-Einträgen zusammengefasst.

## 1 · Live-Projekt & Deploys
- https://produkt-landingpage-3bb41d0a.vercel.app/ — Vercel-Produktion der Landingpage — OK
- https://weather-check.pplx.app — Perplexity-Deploy Weather-Check (Schwesterprojekt) — OK
- lokal: http://localhost:3000 · :8000/health · 127.0.0.1:4173 — Compose/Dev — lokal

## 2 · Repository & Deployment
- https://github.com/KikiKari/Onboarding (`/tree/main`, `/tree/main/components/site/pond`, Commit `404a863`, Branch `pond-hero`) — Haupt-Repo + Pond-Hero-Code — API: `api.github.com/repos/KikiKari/Onboarding` (Bearer)
- Vercel-Projekt `produkt-landingpage-3bb41d0a` (Team `openclaw-vercel-project`) — API: `api.vercel.com/v9/projects?teamId=…` (Bearer) · Doc: `vercel.com/docs/package-managers`, `/docs/deployments/configure-a-build#corepack`, `/docs/functions/runtimes/node-js`
- pnpm/Lockfile-Referenzen (community.vercel.com/*, pnpm.io/cli/install, docs.npmjs.com) — Build-Troubleshooting (pnpm v10/corepack) — OK

## 3 · Notion (Projekt-Doku)
- https://app.notion.com/p/3878d8ad3db98116a5d4f68d8c8ad717 — Hauptseite „Onboarding and Project Pages" (+ 5 Unterseiten: Architektur, Design/Medien, Deployment, Doku/Quellen, Sicherheit) — auth — API: `api.notion.com/v1` (Bearer, Notion-Version)
- https://app.notion.com/p/kikikari/Development-Ops-37d8d8ad3db980e191ceca98e7d5b74d — neue „Development & Ops"-Seite — auth

## 4 · Linear (Aufgaben)
- https://linear.app/0penclaw/project/onboarding-and-project-pages-77bce25304c7 — Hauptprojekt — auth — API: `api.linear.app/graphql` (Bearer)
- .../project/development-ops-78509b425da6 · /vision-check-c9501da64334 · /weather-check-c8f3e3285648 — weitere Projekte
- Issues 0PE-37 (Klick löst keine Aktion), 0PE-38 (Kugelpositionen aufs Idle-Video), 0PE-39 (Idle+Splash in einem Take), 0PE-40 (Docker-Build vereinfachen)
- Dokumente: github-repository-d74a3fe566a7, projektabschluss-and-integrationen-96f62f4c3646

## 5 · Canva (Design)
- http://codex-full-stack.my.canva.site — veröffentlichte Site — OK
- https://canva.link/mmgazbg6i0ml4b2 — „Produkt Landingpage" (Code-Design) — OK — API: `api.canva.com/rest/v1/` (OAuth, nur Metadaten)
- https://design.canva.ai/5bKpr40zJLw6Mdf · https://www.canva.com/d/PS9SC7zOnRUKTs- — neue Designs — auth

## 6 · KI-Video/-Bild-APIs
- https://api.openai.com/v1/videos — **OpenAI Sora 2 / Sora-2-Pro** (Video-Gen; `/models`, `/videos/{id}`, `/videos/{id}/content`) — API (Bearer) — Doc: `developers.openai.com/api/docs/guides/video-generation`
- OpenAI gpt-image-2 — Bild (image-to-image von `master.png`) — API: `api.openai.com/v1` (Bearer)
- https://api.anthropic.com/v1 (+ `/models`) — Anthropic Claude (Fable 5) — API (x-api-key)
- https://openrouter.ai/api/v1 — OpenRouter (Modell-Routing) — API (Bearer)
- https://www.perplexity.ai (Computer-Task-Threads, /settings) — Perplexity Computer + Claude Fable 5 — auth — API: `api.perplexity.ai` (Bearer)

## 7 · WaveSpeed (Bild/Video/3D)
- https://api.wavespeed.ai/api/v3/{model_id} — Task erstellen; Ergebnis `/predictions/{id}/result`; Upload `/media/upload/binary`; Stream `/{model_id}/stream` — API (Bearer), Webhook-Param — Doc: `wavespeed.ai/docs`, `/docs/docs-api`, `/docs/how-to-use-webhooks`, `/docs/upload-files-api`, `/docs/docs-python-sdk`
- Modelle (3D): `tripo3d/v2.5/image-to-3d` & `/multiview-to-3d`, `tripo3d/h3.1/*`, `wavespeed-ai/hunyuan3d-v3/image-to-3d`, `hunyuan3d/v2-base`, `hunyuan3d-2-multi-view` — Doc: `wavespeed.ai/models?category=3d`
- Modelle (Video/Bild/Audio): `kwaivgi/kling-video-o3-pro/video-edit`, `wavespeed-ai/wan-2.2/i2v-720p` & `/animate`, `wan/v2.5/generations`, `flux-dev`(-lora), `hunyuan-image-3-instruct/edit`, `infinitetalk`, `ace-step/audio-to-audio`, `mureka-ai/*`
- CLI/SDK/Blog: `wavespeed.ai/cli`, `/docs/docs-python-sdk`, `/blog/*` (Tripo3D, Hunyuan3D, WAN-Quickstarts)

## 8 · NVIDIA (NIM + Edify 3D)
- https://integrate.api.nvidia.com/v1/chat/completions (+ `/models`) — NVIDIA NIM (`nvidia/usdcode`, Kimi-K2.6) — API: Header `Authorization: Bearer nvapi-…` — Doc: `docs.api.nvidia.com/nim/`, `developer.nvidia.com/nim/`
- https://ai.api.nvidia.com/v1/ · build.nvidia.com/models — NIM-Katalog (Vista3D, Trellis, GenAI-3D) — API/Doc
- Edify 3D (Recherche): research.nvidia.com/labs/cosmos-lab/edify-3d/, blogs.nvidia.com/…edify-3d…, heise/3dnews-Artikel — Referenz — OK

## 9 · 3D-Assets, HDRI & Texturen
- https://sketchfab.com/3d-models/water-lily-collection-73390addebb34fa3ababe6e677eb670d — Seerosen-3D-Kollektion — OK — API: `api.sketchfab.com/v3` (Token)
- https://api.polyhaven.com/assets?t=models|textures|hdris — Poly Haven (CC0 Modelle/Texturen/HDRIs) — API (offen) — `api.polyhaven.com/files/{asset}`
- https://ambientcg.com/api/v2/full_json?type=PhotoTexturePBR&q=water — AmbientCG (CC0 PBR-Texturen) — API (offen)
- BlenderKit — Blender-Assets — `blendkit.com/plans/pricing/` (API mit Key)
- ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js — `<model-viewer>` Web-Component (3D im Browser) — CDN

## 10 · Stock-Bilder (Wasser/Seerosen/Ripples)
- Vecteezy — https://www.vecteezy.com — Fotos/Vektoren — API: `api.vecteezy.com/v2/resources?query=…` (`VECTEEZY_API_KEY`) — Doc: `developers.vecteezy.com`, Swagger `vecteezy.com/api-docs/api/v2/swagger.json`
- Pixabay — https://pixabay.com — freie Bilder — API: `pixabay.com/api/` (Key)
- Freepik — https://www.freepik.com — Fotos/Vektoren — API (Partner-Key)
- Shutterstock — https://www.shutterstock.com — kommerziell + „Ethical Generative 3D API" — API (Key); Suchen: lily-pad/water-ripples top-view
- iStock / Getty — https://www.istockphoto.com — kommerziell — Getty API separat
- Alamy, Dreamstime, Adobe Stock, Magnific — weitere Stockquellen (Wasser-Ripples, Lily-Pads) — meist API mit Key
- NASA (`images-api.nasa.gov`), rawpixel Public Domain — freie/PD-Bilder — OK
- Hinweis: die vielen einzelnen `…260nw….jpg` / `media.istockphoto…` / `static.vecteezy…`-Vorschaubilder sind hier je Provider zusammengefasst, nicht einzeln gelistet.

## 11 · Tools & Doku
- https://www.blender.org/download/ — Blender (3D) — lokal, keine API
- https://www.gimp.org — GIMP 3.2.4 (lokal) — keine API
- pnpm.io/cli/install, docs.npmjs.com — Paketmanager-Doku — OK
- developers.openai.com/api/docs, docs.api.nvidia.com — Anbieter-Doku — OK

## 12 · Temporär / generiert (nicht dauerhaft)
- `d2p7pge43lyniu.cloudfront.net/output/*.png` — WaveSpeed/Perplexity-Bild-Outputs — temporär
- OpenAI `…/videos/{id}/content` — generierte Sora-Videos (nach Job-ID) — API/temporär
- Static-Vorschau-Assets (static.vecteezy, shutterstock 260nw, media.istockphoto, thumbs.dreamstime) — Vorschau, nicht lizenzfrei einbetten

---
Konsolidierung: v4-Kern + Pond-Hero-Session zusammengeführt, dedupliziert und gruppiert. Werbe-/Tracking- (doubleclick/o2), Cloudflare-Challenge- und signierte Download-Hash-URLs bewusst ausgelassen. Secrets (OpenAI/Anthropic/OpenRouter/WaveSpeed/NVIDIA/Vecteezy) nur lokal/Env — rotieren.
