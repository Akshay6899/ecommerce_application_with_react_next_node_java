#!/usr/bin/env bash
# ----------------------------------------------------------------------------
# init.sh — one-shot bootstrap for the e-commerce monorepo
# ----------------------------------------------------------------------------
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "🟢 [1/6] Copying .env.example → .env (if missing)"
[ -f .env ] || cp .env.example .env
[ -f frontend/.env.local ] || cp .env.example frontend/.env.local

echo "🟢 [2/6] Starting Postgres + MongoDB via docker compose"
docker compose up -d

echo "🟢 [3/6] Installing root + workspace JS deps"
npm install

echo "🟢 [4/6] Running Prisma migrations (Postgres)"
( cd backend/express-service && npx prisma generate && npx prisma migrate dev --name init || true )

echo "🟢 [5/6] Pre-building Java payment service"
if [ -d backend/java-service ]; then
  ( cd backend/java-service && mvn -q -DskipTests package || echo "⚠️  Maven not found — install Java 17 + Maven to run the Java service" )
fi

echo "🟢 [6/6] Done!"
cat <<EOF

✅ Bootstrap complete. Start everything with:

  ./start-all.sh

Or, if you prefer separate terminals:

  npm run dev:express
  npm run dev:fastify
  npm run dev:java
  npm run dev:frontend

Then open  →  http://localhost:3000
EOF
