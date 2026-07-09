#!/usr/bin/env bash
# Provisioniert die Claude-Code-Sandbox (Remote-Umgebung) reproduzierbar:
#   - Node-Dependencies (Frontend, npm)
#   - Python-Dependencies (Backend inkl. pytest)
#   - Medien-Tools: ffmpeg, ImageMagick, GIMP, Blender headless (apt) —
#     Fehlschlag blockiert die Session nicht; --skip-heavy laesst GIMP/Blender aus
# Idempotent: bereits Vorhandenes wird uebersprungen; der Container-Cache der
# Umgebung macht die apt-Installation zum Einmal-Aufwand.
set -uo pipefail

SKIP_HEAVY=0
[[ "${1:-}" == "--skip-heavy" ]] && SKIP_HEAVY=1

cd "$(dirname "$0")/.."
log() { printf '[sandbox-setup] %s\n' "$*"; }

log "Node-Dependencies (npm install) …"
npm install --no-audit --no-fund || { log "FEHLER: npm install fehlgeschlagen"; exit 1; }

log "Python-Dependencies (backend/requirements-dev.txt) …"
pip3 install --quiet -r backend/requirements-dev.txt || { log "FEHLER: pip install fehlgeschlagen"; exit 1; }

apt_install() {
  local pkg="$1" bin="$2"
  if command -v "$bin" >/dev/null 2>&1; then
    log "$pkg bereits vorhanden ($($bin -version 2>&1 | head -1 || true))"
    return 0
  fi
  log "Installiere $pkg …"
  if [[ ${APT_UPDATED:-0} -eq 0 ]]; then
    DEBIAN_FRONTEND=noninteractive apt-get update -qq && APT_UPDATED=1
  fi
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq "$pkg" >/dev/null \
    || log "WARNUNG: $pkg konnte nicht installiert werden (Netzwerk-Policy?) — Medien-Schritte ggf. eingeschraenkt"
}

apt_install ffmpeg ffmpeg
apt_install imagemagick convert
if [[ $SKIP_HEAVY -eq 0 ]]; then
  apt_install gimp gimp
  apt_install blender blender
fi

# Git-Push-Weg: Der Session-Git-Proxy (origin) ist read-only. Pushes laufen
# direkt zu github.com mit dem Nutzer-PAT (GH_ACCESS_TOKEN aus Umgebungs-Env
# oder .env, geliefert vom Credential-Helper — kein Secret in der Git-Config).
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git config credential."https://x-access-token@github.com".helper "!$(pwd)/.claude/git-credential-pat.sh"
  git remote set-url --push origin "https://x-access-token@github.com/KikiKari/Onboarding.git"
  log "Git-Push-Route: direkt zu github.com (PAT via Credential-Helper)"
fi

# Docker-Daemon fuer Dev-Compose-Verifikation in der Sandbox.
# Docker-Hub-Blobs (cloudfront.docker.com) sind von der Netz-Policy blockiert —
# mirror.gcr.io liefert die Library-Images. Container brauchen zusaetzlich die
# Proxy-CA (siehe docker-compose.sandbox.yml).
if command -v dockerd >/dev/null 2>&1 && ! docker info >/dev/null 2>&1; then
  log "Starte Docker-Daemon (Registry-Mirror: mirror.gcr.io) …"
  mkdir -p /etc/docker
  [[ -f /etc/docker/daemon.json ]] || echo '{"registry-mirrors":["https://mirror.gcr.io"]}' > /etc/docker/daemon.json
  (dockerd >/tmp/dockerd.log 2>&1 &)
  for _ in $(seq 1 15); do docker info >/dev/null 2>&1 && break; sleep 1; done
  docker info >/dev/null 2>&1 && log "Docker-Daemon laeuft" || log "WARNUNG: Docker-Daemon nicht gestartet"
fi

log "Fertig. Versionen:"
node --version | sed 's/^/[sandbox-setup]   node /'
python3 --version | sed 's/^/[sandbox-setup]   /'
command -v ffmpeg  >/dev/null && ffmpeg -version 2>/dev/null | head -1 | sed 's/^/[sandbox-setup]   /'
command -v convert >/dev/null && convert -version 2>/dev/null | head -1 | sed 's/^/[sandbox-setup]   /'
command -v gimp    >/dev/null && gimp --version 2>/dev/null | head -1 | sed 's/^/[sandbox-setup]   /'
command -v blender >/dev/null && blender --version 2>/dev/null | head -1 | sed 's/^/[sandbox-setup]   /'
exit 0
