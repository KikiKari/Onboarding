# Onboarding and Project Pages

Eigenständige Full-Stack-Plattform mit Next.js-Frontend, FastAPI-Backend,
neun Projektseiten, Vision-Check-Demo und Periodensystem-Lab.

## Lokal starten

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Health: http://localhost:8000/health

## Entwicklung

```bash
pnpm install
pnpm dev
```

```bash
cd backend
python -m venv .venv
.venv/Scripts/pip install -r requirements-dev.txt
.venv/Scripts/pytest
```

## Medienproduktion

Provider-Schlüssel werden ausschließlich als lokale Umgebungsvariablen geladen.
Sie werden weder in Browser-Bundles noch in Produktionsprotokolle geschrieben.

```bash
pnpm media:wavespeed
pnpm media:elevenlabs
pnpm media:optimize
```

WaveSpeed-Jobs, Prediction-IDs, Zielpfade und Kosten werden unter
`media-production/` protokolliert. Der aktuelle Ausführungsstand steht in
`media-production/cost-report.json`.

Der dokumentierte 4K-Anhang liegt unter
`docs/appendix/wavespeed-4k/`. Weitere lokale und im Chat bereitgestellte
Designquellen liegen getrennt unter `docs/reference-library/`.

Provider- und Modellhinweise: [docs/PROVIDERS.md](docs/PROVIDERS.md)

Zusätzlicher, aus Claude Cowork übernommener und auf den geprüften Codex-Stand
aktualisierter Projektkontext:
[docs/PROJECT_CONTEXT_CLAUDE_COWORK.md](docs/PROJECT_CONTEXT_CLAUDE_COWORK.md)

Unveränderte Cowork-v2/v3-Quellen und der Canva-HTML-Block mit Codex-Abgleich:
[docs/appendix/claude-cowork/README.md](docs/appendix/claude-cowork/README.md)

Konsolidierte externe und lokale Quellen:
[docs/SOURCES.md](docs/SOURCES.md)

Vollständige Link- und Erreichbarkeitsmatrix:
[docs/LINKS_AND_REACHABILITY.md](docs/LINKS_AND_REACHABILITY.md)

Synchronisationsstatus für Vercel, Notion, Linear und Canva:
[docs/INTEGRATION_STATUS.md](docs/INTEGRATION_STATUS.md)

Verbindliche Regeln für zentrale Umgebungsvariablen, Maskierung und Monitoring:
[docs/SECRETS_AND_MONITORING.md](docs/SECRETS_AND_MONITORING.md)

Optionale lokale Offline-TTS:
[docs/SHERPA_ONNX_TTS.md](docs/SHERPA_ONNX_TTS.md)

## Deployment

- Frontend: Vercel erkennt das Next.js-Projekt über `vercel.json`.
  Produktion: https://produkt-landingpage-3bb41d0a.vercel.app/
  `NEXT_PUBLIC_API_BASE_URL` wird erst mit einer öffentlichen Backend-URL
  gesetzt; ohne diese zeigt das Formular einen eindeutigen Demo-Hinweis.
- Backend: Docker-Image nach ECR pushen und über
  `deploy/aws/ecs-task-definition.json` oder App Runner ausrollen.
- Das Frontend wurde am 22. Juni 2026 manuell über die Vercel CLI aktualisiert.

## Lizenz

MIT. Projektbeschreibungen basieren auf
[KikiKari/Projects](https://github.com/KikiKari/Projects).
