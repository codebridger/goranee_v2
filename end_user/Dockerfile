# Stage 1: Builder
FROM node:22.17.1-alpine AS builder

WORKDIR /app

# Build argument for API base URL
ARG NUXT_API_BASE_URL=/api/
ENV NUXT_API_BASE_URL=$NUXT_API_BASE_URL

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (with BuildKit cache mount for npm cache)
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy source code
COPY . .

# Build Nuxt 4 SSR
RUN npm run build

# Stage 2: Runtime
FROM node:22.17.1-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies (with BuildKit cache mount for npm cache)
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production

# Copy built output from builder
COPY --from=builder /app/.output ./.output

# Expose port
EXPOSE 8080

# Set PORT environment variable for Nitro (must be set before CMD)
ENV PORT=8080
ENV NITRO_PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start Nuxt 4 SSR server
# PORT is set via ENV above, but we also pass it explicitly to ensure it's used
CMD ["sh", "-c", "PORT=8080 node .output/server/index.mjs"]

