# =============================================================================
# Dockerfile combinado — API + Web + nginx
#
# Usado quando a plataforma suporta apenas 1 app por repositório.
# O nginx faz proxy reverso: /api/* → NestJS, /* → Next.js.
# NEXT_PUBLIC_API_URL é /api (relativo) — sem problema de build-time.
# =============================================================================

FROM node:20-alpine AS pnpm-base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# ──────────────── Stage 1: Build API ────────────────
FROM pnpm-base AS api-builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages ./packages
COPY apps/api ./apps/api

RUN pnpm install --frozen-lockfile
RUN pnpm turbo build --filter=@juliana-gaspar/api
RUN pnpm --filter=@juliana-gaspar/api deploy --prod /deploy-api

# Copy Prisma client
RUN SRC_PRISMA=$(find /app -path "*/node_modules/.prisma/client" -type d -print -quit 2>/dev/null); \
    if [ -z "$SRC_PRISMA" ]; then \
      echo "FATAL: .prisma client not found after turbo build"; exit 1; \
    fi; \
    PRISMA_CLIENT_DIR=$(find /deploy-api -path "*/node_modules/@prisma/client" -type d -print -quit 2>/dev/null); \
    if [ -z "$PRISMA_CLIENT_DIR" ]; then \
      echo "FATAL: @prisma/client not found in deploy"; exit 1; \
    fi; \
    PRISMA_NM=$(dirname "$(dirname "$PRISMA_CLIENT_DIR")"); \
    DEST_PRISMA="$PRISMA_NM/.prisma"; \
    rm -rf "$DEST_PRISMA" && cp -r "$(dirname "$SRC_PRISMA")" "$DEST_PRISMA" && \
    echo "OK: prisma client copied to deploy-api"

# Copy Prisma schema for runtime migrations (runs from /app/api)
RUN mkdir -p /deploy-api/prisma && cp /app/packages/database/prisma/schema.prisma /deploy-api/prisma/

# ──────────────── Stage 2: Build Web ────────────────
FROM pnpm-base AS web-builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile

# NEXT_PUBLIC_API_URL=/api é relativo ao mesmo domínio (nginx faz o proxy)
ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm turbo build --filter=@juliana-gaspar/web

# ──────────────── Stage 3: Runtime ────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# --- nginx + supervisor + prisma CLI ---
RUN apk add --no-cache nginx supervisor curl libcap
RUN npm install --no-save prisma@6 2>&1 | tail -1

# Config do nginx
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Config do supervisord
RUN mkdir -p /var/log/supervisor
COPY <<'SUPERVISOR' /etc/supervisord.conf
[supervisord]
nodaemon=true
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid

[program:nginx]
command=nginx -g "daemon off;"
autostart=true
autorestart=true
stdout_logfile=/var/log/supervisor/nginx.log
stderr_logfile=/var/log/supervisor/nginx.log

[program:web]
command=/bin/sh -c 'echo ">>> HOSTNAME=$HOSTNAME" >&2 ; exec node /app/web/apps/web/server.js'
directory=/app/web
autostart=true
autorestart=true
stdout_logfile=/var/log/supervisor/web.log
stderr_logfile=/var/log/supervisor/web.log
environment=PORT=3002,HOSTNAME=0.0.0.0,NODE_ENV=production
startsecs=5

[program:api]
command=node /app/api/dist/main.js
directory=/app/api
autostart=true
autorestart=true
stdout_logfile=/var/log/supervisor/api.log
stderr_logfile=/var/log/supervisor/api.log
environment=API_PORT=3001,NODE_ENV=production
SUPERVISOR

# --- Entrypoint de migration ---
COPY docker/api-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# --- Copia artefatos dos builders ---
COPY --from=api-builder /deploy-api /app/api

# Prisma schema para migrations (acessível do WORKDIR /app)
RUN mkdir -p /app/prisma && cp /app/api/prisma/schema.prisma /app/prisma/schema.prisma
COPY --from=web-builder /app/apps/web/.next/standalone /app/web
COPY --from=web-builder /app/apps/web/.next/static /app/web/apps/web/.next/static
COPY --from=web-builder /app/apps/web/public /app/web/apps/web/public

# Non-root user
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001 -G appgroup
RUN chown -R appuser:appgroup /app /var/log /var/lib/nginx /run /entrypoint.sh

# Permite nginx bindar na porta 80 mesmo sem root
RUN setcap cap_net_bind_service=+ep /usr/sbin/nginx

# HEALTHCHECK desativado temporariamente para debug do Next.js bind
# HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
#   CMD curl -sf http://localhost:80/health || exit 1

EXPOSE 80
USER appuser
ENTRYPOINT ["/entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
