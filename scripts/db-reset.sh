#!/bin/bash
set -e

echo "🗑️  Resetting database..."
cd packages/database
npx prisma migrate reset --force
npx tsx prisma/seed.ts
cd ../..
echo "✅ Database reset and seeded."
