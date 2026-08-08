FROM node:24-bookworm-slim AS base
RUN apt-get update && apt-get install -y git curl sqlite3 python3 make g++ && rm -rf /var/lib/apt/lists/*

# Stage 1: Builder
FROM base AS builder
WORKDIR /app
ARG UID=1000
ARG GID=1000
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
ARG AUTH_SECRET
ENV AUTH_SECRET=$AUTH_SECRET

# Setup User www-data agar sinkron dengan Host
RUN userdel -r node && \
    usermod -u ${UID} www-data && \
    groupmod -g ${GID} www-data && \
    mkdir -p /var/www /app/node_modules /app/.next && \
    chown -R www-data:www-data /var/www /app

# BERIKAN KOMENTAR (#) PADA BARIS INI DULU KETIKA INSTALL AWAL
COPY --chown=www-data:www-data package.json package-lock.json* ./

USER www-data

# Jalankan install hanya jika file package.json sudah ada
RUN if [ -f package.json ]; then npm install; else echo "Package.json not found, skipping install..."; fi

COPY --chown=www-data:www-data . .

# Jalankan build hanya jika file proyek sudah lengkap
RUN if [ -f package.json ]; then \
      if grep -q '"prisma"' package.json 2>/dev/null; then npx prisma generate; fi && \
      npm run build; \
    else echo "Project not initialized yet..."; fi

# Stage 2: Runner (Untuk Produksi)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ARG UID=1000
ARG GID=1000

RUN userdel -r node && \
    usermod -u ${UID} www-data && \
    groupmod -g ${GID} www-data && \
    chown -R www-data:www-data /app

# Standalone mode dari Next.js (hasil build)
COPY --from=builder --chown=www-data:www-data /app/public ./public
COPY --from=builder --chown=www-data:www-data /app/.next/standalone ./
COPY --from=builder --chown=www-data:www-data /app/.next/static ./.next/static

RUN --mount=from=builder,source=/app/prisma,target=/tmp/prisma-src \
    if [ -d /tmp/prisma-src ] && [ -n "$(ls -A /tmp/prisma-src 2>/dev/null)" ]; then \
      cp -r /tmp/prisma-src ./prisma; \
    fi

RUN --mount=from=builder,source=/app/prisma.config.ts,target=/tmp/prisma.config.ts \
    if [ -f /tmp/prisma.config.ts ]; then \
      cp /tmp/prisma.config.ts ./prisma.config.ts; \
    fi

RUN --mount=from=builder,source=/app/package.json,target=/tmp/pkg.json \
    if [ -f /tmp/pkg.json ]; then \
      cp /tmp/pkg.json ./package.json; \
    fi && chown -R www-data:www-data /app

USER www-data
ENV npm_config_cache=/tmp/npm-cache
RUN if grep -q '"prisma"' package.json 2>/dev/null; then npm install prisma; fi
EXPOSE 3000
CMD ["node", "server.js"]