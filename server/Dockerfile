# Stage 1: Builder
FROM node:22.17.1-alpine AS builder

# Install build tools for native dependencies
RUN apk add --no-cache g++ make py3-pip

WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile || npm install

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Stage 2: Runtime
FROM node:22.17.1-alpine

# Install runtime tools (for backup functionality)
RUN apk add --no-cache zip mongodb-tools

WORKDIR /server

# Copy package files
COPY package.json yarn.lock* ./

# Install only production dependencies
RUN yarn install --frozen-lockfile --production || npm install --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Create directories for uploads and backups
RUN mkdir -p uploads backups

# Expose port
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8081/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server
CMD ["node", "dist/index.js"]

