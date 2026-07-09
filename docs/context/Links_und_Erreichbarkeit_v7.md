# Projektkontext — Links & Erreichbarkeit (v7)
Stand: 9. Juli 2026 · konsolidiert aus v6 + Claude-Code-Session „Persistente Sandbox + Diff-Sync + VPN + Visual-QA" (Fable 5).
Format: `URL/Kanonisch — Beschreibung — Doc/API`. Status: OK · auth · API · lokal · temporär · blockiert.
**Keine Tokens/Secrets.** Historische 355-URL-Liste bleibt in `docs/context/` (v6).

## 1 · Repository, Branch, Codespace & Deploy
- https://github.com/KikiKari/Onboarding — Repo; `main` + Arbeitsbranch `claude/onboarding-persistent-sandbox-vjfmcx` (Basis `main@25a0828`) — API: `api.github.com/repos/KikiKari/Onboarding`
- https://api.github.com/user · /user/codespaces — GitHub-Identität/Codespaces (Start `…/{name}/start`) — API (fine-grained PAT; github.com-Egress nur über VPN-SOCKS)
- https://github.com/codespaces/curly-funicular-69jx7wv6w7j4fxvj6 (`?editor=web`) — Codespace `curly-funicular` (Repo Onboarding), von Shutdown→Available — auth
- https://curly-funicular-69jx7wv6w7j4fxvj6.github.dev — Codespace-Web-Editor-Host — auth/blockiert (Allowlist: `*.github.dev`)
- https://github.com/settings/installations — GitHub-App-Rechte (Contents: Read & write nötig) — auth
- https://produkt-landingpage-3bb41d0a.vercel.app/ — Vercel-Produktion — OK — API: `api.vercel.com/v2/user`, `/v9/projects`

## 2 · KI-/Media-Provider (in dieser Session verifiziert = gültig)
- https://api.openai.com/v1/models — OpenAI (Haupt- + Embedding-Key), Sora/gpt-image — API (Bearer) — Doc: `developers.openai.com/api/docs`
- https://api.anthropic.com/v1/models — Anthropic Claude (Fable 5) — API (x-api-key)
- https://openrouter.ai/api/v1/key — OpenRouter — API (Bearer)
- https://integrate.api.nvidia.com/v1/models — NVIDIA NIM (Haupt- + Codex-Key) — API (Bearer) — Doc: `docs.api.nvidia.com/nim/`
- https://api.elevenlabs.io/v1/user · /v1/voices/{id} — ElevenLabs (+ Voice-ID) — API (xi-api-key) — Doc: `elevenlabs.io/docs`
- https://api.wavespeed.ai/api/v3/balance · `/{model_id}` · `/predictions/{id}/result` — WaveSpeed (Nano-Banana/3D/Video) — API (Bearer, Webhook) — Doc: `wavespeed.ai/docs`
- https://api.linear.app/graphql — Linear — API (Authorization)
- https://api.notion.com/v1/users/me — Notion (PAT + Token) — API (Bearer, Notion-Version)
- https://slack.com/api/auth.test — Slack Bot-Token — API (Bearer)
- https://api.perplexity.ai/search · /v1/responses · /v1/embeddings — Perplexity — API (Bearer) — Doc: `docs.perplexity.ai`
- https://api.tavily.com/search — Tavily Research — API (Bearer)
- https://api.firecrawl.dev/v1/team/credit-usage — Firecrawl — API (Bearer)
- https://hub.docker.com/v2/users/login — Docker Hub (PAT-Verifikation) — API

## 3 · Stock / 3D / Assets
- https://polyhaven.com/de — Poly Haven (CC0 3D/HDRI/Texturen) — OK — API: `api.polyhaven.com/assets`
- https://unsplash.com/de — Unsplash — OK — API: `api.unsplash.com` (Access Key)
- https://www.vecteezy.com/developers · /api-docs — Vecteezy Developer-Portal — auth (Cloudflare 403 aus Sandbox); API `api.vecteezy.com/v2/…` — Account **V2-only**, exakter v2-Endpoint aus eingeloggtem Dashboard nötig; `developers.vecteezy.com` nicht mehr auflösbar
- Sketchfab, AmbientCG, Shutterstock/iStock/Freepik/Pixabay u. a. (aus v6) — Stock/3D — je API mit Key
- `<model-viewer>` CDN `ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/…` — 3D im Browser

## 4 · Infrastruktur, Netzwerk & Tooling
- https://tailscale.com/install.sh — Tailscale-Installer — OK; Admin `login.tailscale.com` — auth; Doc `tailscale.com/kb/1223/tailscale-funnel/`
- socks5://localhost:1055 — Tailscale-Userspace-SOCKS5 (sauberer Egress) — lokal
- http://127.0.0.1:35241 (`$HTTPS_PROXY`) + `/__agentproxy/status` — Agent-MITM-Proxy (CA `/root/.ccr/ca-bundle.crt`) — lokal
- https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb — Chrome Stable (H.264/AAC für Visual-QA) — OK
- `mirror.gcr.io/library/{node,python}` · `public.ecr.aws/docker/library/node` — Image-Mirror (Docker-Hub-Blob-CDN blockiert) — OK
- https://nextjs.org/docs/messages/no-img-element · /telemetry — Next.js Build-Hinweise — Doc
- Tailnet `kikikari.github`: `claude-sandbox` 100.73.106.108 (SSH), `openclaw-node2` 100.109.255.27 (SSH✅), `openclaw-node3` 100.73.154.125 (SSH), `lenovo-node7` 100.103.140.35 (Win), `v…446711` 100.64.80.9, `v…449961` 100.82.198.122 — auth/lokal

## 5 · Claude Code / Umgebung
- https://claude.ai/code — Umgebungs-Einstellungen (Netzwerk-Policy, Env, Domain-Allowlist) — auth
- https://code.claude.com/docs/en/claude-code-on-the-web — Doku Remote-Umgebung/Netzwerk-Policy — OK
- https://docs.anthropic.com/en/docs/claude-code/github-actions — vom Agent-Proxy bei Repo-Scope-Sperre referenziert — OK
- http://localhost:3000 · http://localhost:8000(/health) — Frontend (Next dev) / Backend (FastAPI) — lokal

## 6 · Nutzer-gesendet (Referenz, auth)
- https://www.perplexity.ai/spaces/project-landingpage-IXGOy7qTTHC5QwOkAX.lhA — Perplexity-Space — auth (403 aus Sandbox)
- https://www.perplexity.ai/computer/tasks/0a748f67-db03-4a2a-a942-6b05e4612915?view=thread — Perplexity-Computer-Task — auth (403)

---
Konsolidierung: v6-Kern + Sandbox-Session. Tracking-/Challenge-, signierte Download- und generierte Codespace-Port-URLs ausgelassen; Provider je einmal kanonisch. Secrets ausschließlich in gitignorierter `.env` — rotieren.
