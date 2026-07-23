# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────────────────────
# etapa 1: deps — instala solo dependencias de producción
# se aísla en su propia capa para aprovechar el cache: mientras
# package*.json no cambie, npm ci no se vuelve a ejecutar.
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ─────────────────────────────────────────────────────────────
# etapa 2: runtime — imagen final mínima
# copia node_modules ya resueltos + el código fuente.
# corre como usuario sin privilegios (node) por seguridad.
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    OPEN_BROWSER=false \
    PORT=8080

# dependencias de producción desde la etapa anterior
COPY --from=deps /app/node_modules ./node_modules

# código de la aplicación (respetando .dockerignore)
COPY package.json ./
COPY server.js ./
COPY src ./src

# usuario no-root ya incluido en la imagen oficial de node
USER node

EXPOSE 8080

# healthcheck simple contra el endpoint público de productos
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "fetch('http://localhost:'+ (process.env.PORT||8080) +'/api/products').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
