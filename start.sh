#!/usr/bin/env bash
set -euo pipefail
# Start API and Web together (requires npx to fetch 'concurrently' if not installed)
npx concurrently -k -n API,WEB -c auto "cd server && npm run dev" "cd web && npm run dev"
