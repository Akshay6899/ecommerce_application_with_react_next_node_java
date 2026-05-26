#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="/tmp/practice-logs"
mkdir -p "$LOG_DIR"

start_if_needed() {
  local port="$1"
  local name="$2"
  local command="$3"
  local logfile="$4"

  if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "✅ $name already running on :$port"
    return
  fi

  echo "▶️  Starting $name on :$port"
  nohup bash -lc "$command" >"$logfile" 2>&1 &
}

echo "🟢 Starting Docker databases"
cd "$ROOT"
docker compose start >/dev/null || docker compose up -d

start_if_needed 3030 "Frontend" "cd '$ROOT/frontend' && npm run dev" "$LOG_DIR/frontend.log"
start_if_needed 4001 "Express auth" "cd '$ROOT/backend/express-service' && npm run dev" "$LOG_DIR/express.log"
start_if_needed 4002 "Fastify catalog" "cd '$ROOT/backend/fastify-service' && npm run dev" "$LOG_DIR/fastify.log"
start_if_needed 4003 "Java payment" "cd '$ROOT/backend/java-service' && mvn spring-boot:run" "$LOG_DIR/java.log"

echo
echo "✅ Start command issued. Logs: $LOG_DIR"
echo "Frontend:      http://localhost:3030"
echo "Express auth:  http://localhost:4001/health"
echo "Fastify api:   http://localhost:4002/health"
echo "Java payment:  http://localhost:4003/actuator/health"