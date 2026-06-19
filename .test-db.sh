#!/bin/bash
set -e
cd /home/wesley/Projetos/Juliana\ Gaspar
export DATABASE_URL="postgresql://postgres:WGsn_764952@db.rjybipokowavwqalaxfk.supabase.co:5432/postgres"
echo "==> Testando conexao com Supabase..."
npx prisma db push --schema=packages/database/prisma/schema.prisma --skip-generate 2>&1
