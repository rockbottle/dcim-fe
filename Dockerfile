# --- STAGE 1: Install Dependencies ---
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./

# Clean install of all dependencies (including devDeps for linting/testing)
RUN npm ci

# --- STAGE 2: Quality Gate (Lint & Test) ---
FROM deps AS tester
WORKDIR /app
COPY . .

# CRITICAL: We use an absolute URL here so the Vitest/Node.js URL parser 
# doesn't throw "TypeError: Invalid URL" during component tests.
ENV NEXT_PUBLIC_API_BASE_URL="http://localhost:3000"

# Run Linting and Unit Tests. If these fail, the build stops here.
RUN npm run lint && npx vitest run --pool=forks

# --- STAGE 3: Build the Application ---
FROM node:22-alpine AS builder
WORKDIR /app

# Inherit the clean node_modules and the code that passed the Quality Gate
COPY --from=deps /app/node_modules ./node_modules
COPY --from=tester /app ./

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# CRITICAL: Re-set the variable to the relative path for the production build.
# This ensures the browser calls the Next.js server, which then proxies to the backend.
ENV NEXT_PUBLIC_API_BASE_URL="/api"

# Build the optimized standalone Next.js application
RUN npm run build

# --- STAGE 4: Production Runner ---
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Security & OS Cleanup
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    rm -rf /var/cache/apk/*

# Standalone mode requires these specific files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

# The server.js is created automatically by Next.js in standalone mode
CMD ["node", "server.js"]