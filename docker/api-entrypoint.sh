#!/bin/sh
set -e

echo "==> Aguardando banco de dados e rodando migrations..."

MAX_RETRIES=15
RETRY=0
until npx prisma migrate deploy 2>&1; do
  RETRY=$((RETRY + 1))
  if [ "$RETRY" -ge "$MAX_RETRIES" ]; then
    echo "==> ERRO: migrations falharam após $MAX_RETRIES tentativas"
    echo "==> Último erro acima. Verifique se o banco está acessível."
    exit 1
  fi
  echo "   tentativa $RETRY/$MAX_RETRIES — aguardando..."
  sleep 3
done

# O Docker define HOSTNAME como o ID do container (ex: 817db4a360c7).
# O Next.js lê HOSTNAME e escuta apenas nesse IP, não em localhost.
# Sobrescrevemos para 0.0.0.0 antes de iniciar o supervisor.
export HOSTNAME=0.0.0.0

echo "==> Iniciando aplicação..."
exec "$@"
