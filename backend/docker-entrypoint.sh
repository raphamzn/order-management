#!/bin/sh
set -e

echo "Aplicando migrations..."
pnpm prisma migrate deploy

echo "Semeando dados de exemplo (idempotente)..."
node dist/seed.js

echo "Iniciando API..."
exec node dist/main.js
