#!/usr/bin/env bash
# Bringt die Sandbox reproduzierbar in das Tailscale-Tailnet des Nutzers —
# als Brücke am Agent-MITM-Proxy vorbei (sauberer Egress via SOCKS5) und mit
# Tailscale-SSH, damit die eigenen Geräte des Nutzers in die Sandbox kommen.
#
# Nutzt den WIEDERVERWENDBAREN Auth-Key aus der .env (nichts committet).
# userspace-networking: verändert NICHT die Host-Routen/den Agent-Proxy dieser
# Session; stellt einen SOCKS5-Proxy auf localhost:1055 bereit.
#
# Aufruf: scripts/sandbox-vpn.sh   (idempotent; No-op ohne Auth-Key/tailscale)
set -uo pipefail
cd "$(dirname "$0")/.."
log() { printf '[sandbox-vpn] %s\n' "$*"; }

# Auth-Key aus .env lesen (ohne die gesamte .env zu sourcen)
KEY=""
[[ -f .env ]] && KEY=$(sed -n 's/^TAILSCALE_AUTH_KEY="\(.*\)"/\1/p' .env | head -1)
if [[ -z "$KEY" ]]; then log "kein TAILSCALE_AUTH_KEY in .env — überspringe VPN"; exit 0; fi

# Tailscale installieren, falls nicht vorhanden
if ! command -v tailscale >/dev/null 2>&1; then
  log "installiere Tailscale …"
  curl -fsSL https://tailscale.com/install.sh | sh >/dev/null 2>&1 || { log "WARNUNG: Tailscale-Install fehlgeschlagen"; exit 0; }
fi

# tailscaled im userspace-Modus starten (SOCKS5 + HTTP-Proxy für Tailnet-Egress)
if ! tailscale status >/dev/null 2>&1; then
  log "starte tailscaled (userspace, SOCKS5 localhost:1055) …"
  mkdir -p /var/lib/tailscale
  nohup tailscaled --tun=userspace-networking \
    --socks5-server=localhost:1055 \
    --outbound-http-proxy-listen=localhost:1056 \
    --statedir=/var/lib/tailscale >/tmp/tailscaled.log 2>&1 &
  sleep 4
fi

# Ins Tailnet, mit Tailscale-SSH aktiviert
if ! tailscale status 2>/dev/null | grep -q claude-sandbox; then
  log "tailscale up (hostname=claude-sandbox, --ssh) …"
  tailscale up --authkey="$KEY" --hostname=claude-sandbox --ssh --accept-routes >/dev/null 2>&1 \
    || log "WARNUNG: tailscale up fehlgeschlagen"
else
  tailscale set --ssh >/dev/null 2>&1 || true
fi

if tailscale status >/dev/null 2>&1; then
  IP=$(tailscale ip -4 2>/dev/null | head -1)
  log "im Tailnet: claude-sandbox ${IP:-?} · SSH aktiv · SOCKS5 localhost:1055"
fi
exit 0
