#!/usr/bin/env bash
set -e

echo "Starting QuantEdge AI Single-User Development Environment..."
if [ ! -f .env ]; then
  echo "No .env file found. Copying .env.example..."
  cp .env.example .env
fi

npm run dev
