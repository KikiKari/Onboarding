#!/usr/bin/env bash
# Provisioniert den GitHub-Codespace so, dass er dieselbe Dev-/Visual-QA-Kette
# wie die Claude-Sandbox bietet: Node-/Python-Deps + ffmpeg, ImageMagick, GIMP,
# Blender (headless), Xvfb, Google Chrome (H.264 → Videos sichtbar) + Playwright.
#
# Läuft automatisch bei Codespace-Erstellung (postCreateCommand). Idempotent.
# Anders als die Sandbox hat der Codespace normalen Internet-Egress — kein
# MITM-Proxy, keine CA-Importe, kein TLS-1.2-Zwang nötig.
set -uo pipefail
cd "$(dirname "$0")/.."
log() { printf '[codespace-setup] %s\n' "$*"; }
SUDO=""; [ "$(id -u)" -ne 0 ] && SUDO="sudo"

log "Node-Dependencies (npm install) …"
npm install --no-audit --no-fund || log "WARNUNG: npm install fehlgeschlagen"

log "Python-Dependencies (backend/requirements-dev.txt) …"
pip3 install --quiet -r backend/requirements-dev.txt || log "WARNUNG: pip install fehlgeschlagen"

log "System-Tools (ffmpeg, ImageMagick, GIMP, Blender, Xvfb) …"
$SUDO apt-get update -qq || true
$SUDO DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
  ffmpeg imagemagick gimp blender xvfb x11-utils fonts-liberation >/dev/null 2>&1 \
  || log "WARNUNG: apt-Tools teilweise nicht installiert"

if ! command -v google-chrome-stable >/dev/null 2>&1; then
  log "Google Chrome Stable …"
  TMPDEB=$(mktemp --suffix=.deb)
  if curl -fsSL -o "$TMPDEB" https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb; then
    $SUDO DEBIAN_FRONTEND=noninteractive apt-get install -y -qq "$TMPDEB" >/dev/null 2>&1 \
      && log "Chrome: $(google-chrome-stable --version 2>/dev/null)" || log "WARNUNG: Chrome-Install fehlgeschlagen"
  fi
  rm -f "$TMPDEB"
fi

log "Playwright (Node) …"
npm install --no-audit --no-fund --no-save playwright >/dev/null 2>&1 || log "WARNUNG: Playwright-Install fehlgeschlagen"

log "Fertig. Versionen:"
node --version | sed 's/^/[codespace-setup]   node /'
python3 --version | sed 's/^/[codespace-setup]   /'
command -v ffmpeg  >/dev/null && ffmpeg -version 2>/dev/null | head -1 | sed 's/^/[codespace-setup]   /'
command -v blender >/dev/null && blender --version 2>/dev/null | head -1 | sed 's/^/[codespace-setup]   /'
command -v google-chrome-stable >/dev/null && google-chrome-stable --version 2>/dev/null | sed 's/^/[codespace-setup]   /'

cat <<'NOTE'
[codespace-setup] Bereit. Nächste Schritte im Codespace-Terminal:
  Dev-Stack:   docker compose -f docker-compose.dev.yml up -d
  Frontend:    npm run dev            (Port 3000 wird weitergeleitet)
  Visual QA:   xvfb-run -a node scripts/visual-qa.mjs http://localhost:3000
NOTE
