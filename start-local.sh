#!/bin/sh
set -eu
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Install Node.js 22+ and npm first."
  exit 1
fi
if [ ! -d node_modules ]; then
  echo "Run npm ci first."
  exit 1
fi
exec npm run dev:web
