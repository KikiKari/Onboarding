#!/bin/bash
# SessionStart-Hook: provisioniert die Remote-Sandbox (Claude Code on the web),
# damit Tests, Linter und Medien-Tooling sofort laufen. Lokal ist er ein No-op.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

"$CLAUDE_PROJECT_DIR/scripts/sandbox-setup.sh"

# VPN-Brücke (Tailscale) reproduzierbar herstellen — No-op ohne Auth-Key in .env.
"$CLAUDE_PROJECT_DIR/scripts/sandbox-vpn.sh" || true
