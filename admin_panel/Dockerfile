# Stage 1: Builder
FROM node:14.21.1-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (with BuildKit cache mount for npm cache)
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy source code
COPY . .

# Build static files (set NUXT_TARGET=static for static generation)
ENV NUXT_TARGET=static
# Increase Node.js memory limit for build process
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm run generate

# Stage 2: Nginx (for serving static files)
FROM nginx:alpine

# Copy static files from builder
COPY --from=builder /app/dist /usr/share/nginx/html/admin

# Create nginx config for admin panel
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html/admin; \
    index index.html; \
    location /admin { \
        alias /usr/share/nginx/html/admin; \
        try_files $uri $uri/ /admin/index.html; \
    } \
}' > /etc/nginx/conf.d/admin.conf

EXPOSE 80

