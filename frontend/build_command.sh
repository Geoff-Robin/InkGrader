#!/usr/bin/env bash
# Migrate (drizzle push) -> seed dev user -> build frontend, all against one env file.
# Usage: ./build_command.sh [env-file]   (default: .env.dev)
set -euo pipefail

cd "$(dirname "$0")"

ENV_FILE="${1:-.env.dev}"

if [ ! -f "$ENV_FILE" ]; then
  echo "env file not found: $ENV_FILE" >&2
  exit 1
fi

echo "== Using env file: $ENV_FILE =="

echo "== drizzle push =="
npx --node-options="--env-file=$ENV_FILE" drizzle-kit push

echo "== seed dev user =="
npx tsx --env-file="$ENV_FILE" scripts/seed-user.ts

echo "== next build =="
node --env-file="$ENV_FILE" node_modules/.bin/next build

echo "== done =="
