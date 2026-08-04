#!/usr/bin/env bash
set -e

echo "Starting AlgoApp Pro v2 Single-User Development Environment..."
if [ ! -f .env ]; then
  echo "No .env file found. Copying .env.example..."
  cp .env.example .env
fi

npm run dev
