#!/bin/sh
# Git-Credential-Helper fuer den direkten GitHub-Push aus der Sandbox.
# Der Session-Git-Proxy (origin-Fetch) ist read-only; Pushes laufen direkt zu
# github.com mit dem Nutzer-PAT. Diese Datei enthaelt KEIN Secret — sie liest
# GH_ACCESS_TOKEN aus der Prozess-Umgebung oder der lokalen .env (gitignored).
tok="${GH_ACCESS_TOKEN:-}"
if [ -z "$tok" ]; then
  envfile="$(dirname "$0")/../.env"
  [ -f "$envfile" ] && tok=$(sed -n 's/^GH_ACCESS_TOKEN="\(.*\)"/\1/p' "$envfile")
fi
echo "username=x-access-token"
echo "password=$tok"
