#!/bin/bash
set -e

echo "🛠️  Juliana Gaspar — Setup"
echo "=========================="

# Check requirements
command -v node >/dev/null 2>&1 || { echo "❌ Node.js not found. Install Node 20+."; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm not found. Install with: npm i -g pnpm@9"; exit 1; }

# Copy .env if not exists
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "✅ .env created from .env.example"
  else
    echo "⚠️  .env.example not found — skipping"
  fi
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Start database
echo "🐘 Starting PostgreSQL..."
pnpm docker:up

# Wait for database
echo "⏳ Waiting for database..."
sleep 3

# Run migrations
echo "🔄 Running migrations..."
cd packages/database
npx prisma migrate dev --name init
cd ../..

# Seed database
echo "🌱 Seeding database..."
cd packages/database
npx tsx prisma/seed.ts
cd ../..

echo ""
echo "✅ Setup complete!"
echo "   Frontend: http://localhost:3050"
echo "   API:      http://localhost:3051"
echo "   Admin:    http://localhost:3050/login"
echo "   Email:    admin@julianagaspar.com.br"
echo "   Password: admin123"
