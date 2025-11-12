#!/usr/bin/env bash
set -euo pipefail

echo "==> Starting PostgreSQL with Docker Compose"
docker compose up -d

echo "==> Installing & preparing API"
pushd server >/dev/null
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
popd >/dev/null

echo "==> Installing web app deps"
pushd web >/dev/null
npm install
popd >/dev/null

echo ""
echo "✔ Setup complete."
echo "Next: run ./start.sh"
