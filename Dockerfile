# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app

# --- Instala todas as dependencias (inclui dev) para o build ---
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# --- Compila o TypeScript para dist/ ---
FROM deps AS build
COPY . .
RUN npm run build

# --- Imagem final apenas com dependencias de producao ---
FROM base AS runtime
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
