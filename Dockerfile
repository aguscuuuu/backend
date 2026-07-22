# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────────────────────
# Etapa 1: deps — instala SOLO dependencias de producción
# Se aísla en su propia capa para aprovechar el cache: mientras
# package*.json no cambie, npm ci no se vuelve a ejecutar.
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ─────────────────────────────────────────────────────────────
# Etapa 2: runtime — imagen final mínima
# Copia node_modules ya resueltos + el código fuente.
# Corre como usuario sin privilegios (node) por seguridad.
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    OPEN_BROWSER=false \
    PORT=8080

# Dependencias de producción desde la etapa anterior
COPY --from=deps /app/node_modules ./node_modules

# Código de la aplicación (respetando .dockerignore)
COPY package.json ./
COPY server.js ./
COPY src ./src

# Usuario no-root ya incluido en la imagen oficial de node
USER node

EXPOSE 8080

# Healthcheck simple contra el endpoint público de productos
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "fetch('http://localhost:'+ (process.env.PORT||8080) +'/api/products').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
