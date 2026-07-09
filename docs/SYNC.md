# Lokaler Diff-Sync — Anleitung

> Topologie: Claude Code arbeitet in einer eigenen Remote-Sandbox und pusht auf den
> Arbeitsbranch. Deine lokale Maschine zieht nur die Diffs und zeigt den Stand auf
> `localhost:3000` / `localhost:8000` — ohne Voll-Rebuild pro Änderung.

## Einmalige Umstellung (ersetzt den bisherigen Prod-Stack lokal)

```powershell
# im Repo-Verzeichnis (PowerShell, Docker Desktop läuft)
docker compose down                                 # alten Prod-Stack stoppen
docker compose -f docker-compose.dev.yml up -d      # Dev-Stack mit Hot-Reload starten
```

Der erste Start installiert die Node-Dependencies einmalig in ein Docker-Volume
(dauert ein paar Minuten). Danach ist `localhost:3000` der Next-Dev-Server und
`localhost:8000` uvicorn mit `--reload`.

## Sync starten

```powershell
pwsh -File scripts/sync-local.ps1
```

Das Script (Standard: Branch `claude/onboarding-persistent-sandbox-vjfmcx`, alle 20 s):

| Änderung im Diff | Aktion lokal |
|---|---|
| Quellcode, Styles, Assets, Doku | nichts — Hot-Reload zeigt es sofort |
| `package.json` / `package-lock.json` | Frontend-Container-Neustart; `npm install` läuft nur bei geändertem Lockfile-Hash |
| `backend/Dockerfile`, `backend/requirements*.txt` | gezielter Rebuild **nur** des Backend-Images |
| `docker-compose.dev.yml` | Dev-Stack wird neu erzeugt |

Optionen: `-Once` (ein Durchlauf), `-Branch main` (nur freigegebene Stände),
`-IntervalSeconds 60`. Unter Linux/macOS: `scripts/sync-local.sh` mit `--once`,
`--branch`, `--interval`.

Weicht der lokale Stand vom Remote ab (eigene lokale Commits), merged das Script
nichts automatisch, sondern meldet es — Konflikte bitte manuell auflösen.

## Zurück zum Prod-Stack

```powershell
docker compose -f docker-compose.dev.yml down
docker compose up -d --build
```

## Hinweise

- `docker-compose.yml` (Prod-Build) bleibt unverändert und weiterhin gültig —
  Vercel/CI sind nicht betroffen.
- Die Volumes `frontend_node_modules` / `frontend_next_cache` gehören zum Dev-Stack;
  `docker compose -f docker-compose.dev.yml down -v` setzt sie zurück (erzwingt
  frisches `npm install`).
- Hot-Reload über Windows-Bind-Mounts läuft per Datei-Polling
  (`WATCHPACK_POLLING`) — liegt das Repo stattdessen im WSL-Dateisystem, ist der
  Reload noch schneller.
