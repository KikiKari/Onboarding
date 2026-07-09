#!/usr/bin/env bash
# Provisioniert die Claude-Code-Sandbox (Remote-Umgebung) reproduzierbar:
#   - Node-Dependencies (Frontend, npm)
#   - Python-Dependencies (Backend inkl. pytest)
#   - Medien-Tools: ffmpeg, ImageMagick (apt) — Fehlschlag blockiert die Session nicht
#   - optional: --with-blender fuer Headless-Renders (grosser Download, nur bei Bedarf)
# Idempotent: bereits Vorhandenes wird uebersprungen.
set -uo pipefail

WITH_BLENDER=0
[[ "${1:-}" == "--with-blender" ]] && WITH_BLENDER=1

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
[[ $WITH_BLENDER -eq 1 ]] && apt_install blender blender

log "Fertig. Versionen:"
node --version | sed 's/^/[sandbox-setup]   node /'
python3 --version | sed 's/^/[sandbox-setup]   /'
command -v ffmpeg  >/dev/null && ffmpeg -version 2>/dev/null | head -1 | sed 's/^/[sandbox-setup]   /'
command -v convert >/dev/null && convert -version 2>/dev/null | head -1 | sed 's/^/[sandbox-setup]   /'
command -v blender >/dev/null && blender --version 2>/dev/null | head -1 | sed 's/^/[sandbox-setup]   /'
exit 0
