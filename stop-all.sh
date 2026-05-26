#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "🛑 Stopping app servers for this project"
lsof -nP -iTCP:3030 -sTCP:LISTEN -t 2>/dev/null | xargs -r kill -9
lsof -nP -iTCP:4001 -sTCP:LISTEN -t 2>/dev/null | xargs -r kill -9
lsof -nP -iTCP:4002 -sTCP:LISTEN -t 2>/dev/null | xargs -r kill -9
lsof -nP -iTCP:4003 -sTCP:LISTEN -t 2>/dev/null | xargs -r kill -9

echo "🛑 Stopping Docker databases"
cd "$ROOT"
docker compose stop

echo "✅ Project stopped"