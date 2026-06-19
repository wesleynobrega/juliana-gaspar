#!/bin/sh
set -e

echo "==> Aguardando banco de dados e rodando migrations..."

MAX_RETRIES=15
RETRY=0
until npx prisma migrate deploy 2>/dev/null; do
  RETRY=$((RETRY + 1))
  if [ "$RETRY" -ge "$MAX_RETRIES" ]; then
    echo "==> ERRO: migrations falharam após $MAX_RETRIES tentativas"
    exit 1
  fi
  echo "   tentativa $RETRY/$MAX_RETRIES..."
  sleep 3
done

echo "==> Iniciando aplicação..."
exec "$@"
