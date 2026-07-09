#!/usr/bin/env bash
# Bash-Äquivalent zu sync-local.ps1 — inkrementeller Git-Sync für den Dev-Stack.
# Nutzung: scripts/sync-local.sh [--branch <name>] [--interval <s>] [--once]
set -euo pipefail

BRANCH="claude/onboarding-persistent-sandbox-vjfmcx"
INTERVAL=20
COMPOSE_FILE="docker-compose.dev.yml"
ONCE=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch)   BRANCH="$2"; shift 2 ;;
    --interval) INTERVAL="$2"; shift 2 ;;
    --once)     ONCE=1; shift ;;
    *) echo "Unbekannte Option: $1" >&2; exit 1 ;;
  esac
done

cd "$(dirname "$0")/.."
log() { printf '[%s] %s\n' "$(date +%H:%M:%S)" "$*"; }
compose() { docker compose -f "$COMPOSE_FILE" "$@" || log "WARNUNG: docker compose $* fehlgeschlagen"; }

current=$(git rev-parse --abbrev-ref HEAD)
if [[ "$current" != "$BRANCH" ]]; then
  log "Wechsle von '$current' auf '$BRANCH' …"
  git fetch origin "$BRANCH"
  git switch "$BRANCH" 2>/dev/null || git switch -c "$BRANCH" --track "origin/$BRANCH"
fi

log "Sync aktiv: origin/$BRANCH -> $PWD (Intervall ${INTERVAL}s, Compose: $COMPOSE_FILE)"

while true; do
  if ! git fetch origin "$BRANCH" --quiet; then
    log "Fetch fehlgeschlagen (Netzwerk?) — nächster Versuch in ${INTERVAL}s"
  else
    local_rev=$(git rev-parse HEAD)
    remote_rev=$(git rev-parse "origin/$BRANCH")
    if [[ "$local_rev" != "$remote_rev" ]]; then
      if ! git merge-base --is-ancestor "$local_rev" "$remote_rev"; then
        log "ACHTUNG: Lokaler Stand von origin/$BRANCH abgewichen — kein automatischer Merge, bitte manuell auflösen."
      else
        changed=$(git diff --name-only "$local_rev..$remote_rev")
        git merge --ff-only "$remote_rev" --quiet
        log "Aktualisiert ${local_rev:0:7} -> ${remote_rev:0:7} ($(wc -l <<<"$changed") Datei(en))"

        needs_none=1
        if grep -qx "$COMPOSE_FILE" <<<"$changed"; then
          log "Compose-Datei geändert — erzeuge Dev-Stack neu …"
          compose up -d; needs_none=0
        fi
        if grep -qE '^backend/(Dockerfile|requirements.*\.txt)$' <<<"$changed"; then
          log "Backend-Dependencies/Dockerfile geändert — baue nur das Backend neu …"
          compose up -d --build backend; needs_none=0
        fi
        if grep -qE '^(package\.json|package-lock\.json)$' <<<"$changed"; then
          log "Frontend-Dependencies geändert — starte Frontend neu (npm install läuft im Container) …"
          compose restart frontend; needs_none=0
        fi
        [[ $needs_none -eq 1 ]] && log "Nur Quellcode/Assets — Hot-Reload übernimmt, kein Build nötig."
      fi
    fi
  fi
  [[ $ONCE -eq 1 ]] && break
  sleep "$INTERVAL"
done
