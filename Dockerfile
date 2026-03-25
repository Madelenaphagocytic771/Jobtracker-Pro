# ---- Base ----
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# ---- Deps ----
FROM base AS deps
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npm ci --legacy-peer-deps
# Rebuild native modules for the container's architecture
RUN npx prisma generate

# ---- Runner (dev mode with volume mount) ----
FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

# The actual source code is mounted at runtime via volume,
# so we only need node_modules and prisma baked in.
EXPOSE 3000
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0

CMD ["npm", "run", "dev"]
