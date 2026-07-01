#!/bin/sh
set -e

echo "==> Aguardando banco de dados e rodando migrations..."

MAX_RETRIES=15
RETRY=0
until npx prisma migrate deploy --schema=/app/prisma/schema.prisma 2>&1; do
  RETRY=$((RETRY + 1))
  if [ "$RETRY" -ge "$MAX_RETRIES" ]; then
    echo "==> ERRO: migrations falharam após $MAX_RETRIES tentativas"
    echo "==> Último erro acima. Verifique se o banco está acessível."
    exit 1
  fi
  echo "   tentativa $RETRY/$MAX_RETRIES — aguardando..."
  sleep 3
done

echo "==> Iniciando aplicação..."
exec "$@"
