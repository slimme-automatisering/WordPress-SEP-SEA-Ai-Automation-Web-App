# Base stage voor Node.js dependencies
FROM node:20-slim AS base

# Voeg build tools toe voor native modules
RUN apk add --no-cache python3 make g++ git

# Werkdirectory instellen
WORKDIR /app

# NPM configuratie voor betere builds
ENV NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_CACHE=/tmp/.npm \
    NODE_OPTIONS="--max-old-space-size=4096" \
    CI=true

# Package files kopiëren
COPY package*.json .npmrc ./

# Debug informatie tonen
RUN node --version && \
    npm --version && \
    echo "NODE_ENV: $NODE_ENV" && \
    echo "NPM Config:" && \
    npm config list

# Dependencies installeren met npm ci voor exacte versies
RUN --mount=type=cache,target=/tmp/.npm \
    npm ci --only=production --prefer-offline --no-audit && \
    npm cache clean --force

# Build stage
FROM base AS build

# Development dependencies toevoegen voor build
RUN --mount=type=cache,target=/tmp/.npm \
    npm ci --prefer-offline --no-audit

# Source files kopiëren
COPY . .

# Frontend en dashboard bouwen
RUN npm run build

# Production stage voor frontend
FROM node:20-slim AS frontend
COPY --from=build /app/dist/frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]

# Production stage voor dashboard
FROM node:20-slim AS dashboard
COPY --from=build /app/dist/dashboard /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]

# Production stage voor API
FROM node:20-slim AS api

# Voeg security updates en tools toe
RUN apk add --no-cache dumb-init

# Werkdirectory instellen
WORKDIR /app

# Package files en dependencies kopiëren van base
COPY --from=base /app/node_modules ./node_modules
COPY package*.json .npmrc ./

# Source files kopiëren
COPY src ./src

# Logs directory aanmaken en rechten instellen
RUN mkdir -p /app/logs && \
    chown -R node:node /app/logs /app/node_modules && \
    chmod -R 755 /app/node_modules

# Gebruik node user voor betere security
USER node

# Environment variabelen instellen
ENV NODE_ENV=production \
    PORT=3000 \
    LOG_LEVEL=info \
    NODE_PATH=/app/node_modules \
    NODE_OPTIONS="--max-old-space-size=4096 --enable-source-maps" \
    NPM_CONFIG_CACHE=/tmp/.npm \
    CI=true

# Health check toevoegen
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:${PORT}/health || exit 1

# Volume voor logs
VOLUME ["/app/logs"]

# Start command met debug logging en proper process handling
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "--trace-warnings", "src/index.js"]