# Stage 1: Builder
FROM node:22.17.1-alpine AS builder

WORKDIR /app

# Enable corepack and use Yarn 1.x (classic) to match existing lockfile format
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

# Build arguments for API base URLs
ARG NUXT_API_BASE_URL=/api/
ARG NUXT_SSR_API_BASE_URL
ENV NUXT_API_BASE_URL=$NUXT_API_BASE_URL
ENV NUXT_SSR_API_BASE_URL=$NUXT_SSR_API_BASE_URL

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies (with BuildKit cache mount for yarn cache)
# Cache mount speeds up builds by reusing downloaded packages between builds
# Works in GitHub Actions when BuildKit is enabled (default in newer versions)
RUN --mount=type=cache,target=/root/.yarn-cache \
    YARN_CACHE_FOLDER=/root/.yarn-cache yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build Nuxt 4 SSR
RUN yarn build

# Stage 2: Runtime
FROM node:22.17.1-alpine

WORKDIR /app

# Copy built output from builder
# Nuxt 4's .output folder is self-contained and includes all necessary dependencies
# No need to install node_modules in runtime stage
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

