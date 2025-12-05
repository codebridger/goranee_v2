# Docker Setup for Goranee v2

This document explains how to test and run the Docker setup locally.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 14+ (for building admin panel locally if needed)
- Node.js 22+ (for building server and end_user locally if needed)

## Local Testing

### Option 1: Using the Helper Script (Easiest)

We provide a helper script that handles everything:

```bash
# Make sure the script is executable (first time only)
chmod +x scripts/docker-local.sh

# Run the script
./scripts/docker-local.sh
```

This script will:
- Build admin panel static files if needed
- Create necessary directories
- Build and start all Docker services

### Option 2: Manual Build and Run

Use the local docker-compose file that builds all images locally:

```bash
# Build admin panel static files first (required for nginx image)
cd admin_panel
npm install
npm run generate
cd ..

# Build and start all services
docker-compose -f docker-compose.local.yaml up --build

# Or run in detached mode
docker-compose -f docker-compose.local.yaml up --build -d

# View logs
docker-compose -f docker-compose.local.yaml logs -f

# Stop services
docker-compose -f docker-compose.local.yaml down
```

**Note:** The local compose file uses `nginx.Dockerfile.local` which automatically builds the admin panel, so you don't need to build it manually if using the script.

### Option 2: Build Individual Services

You can also build and test individual services:

```bash
# Build server
docker build -t goranee_v2_server:local -f server/Dockerfile ./server

# Build end_user
docker build -t goranee_v2_end_user:local -f end_user/Dockerfile ./end_user

# Build admin panel (requires static files to be built first)
cd admin_panel && npm install && npm run generate && cd ..
docker build -t goranee_v2_nginx:local -f nginx.Dockerfile .

# Then use docker-compose.local.yaml which will use these local images
```

## Environment Variables

Create a `.env` file in the root directory (optional, defaults are provided):

```env
SERVER_ADMIN_EMAIL=admin@mail.com
SERVER_ADMIN_PASSWORD=admin
MONGODB_URL=mongodb://mongo:27017
NUXT_API_BASE_URL=/api/
```

## Services

- **nginx**: Reverse proxy on ports 80/443
  - Routes `/api/*` to server
  - Routes `/admin/*` to static admin files
  - Routes `/*` to end_user SSR

- **server**: API server on port 8081 (internal)
  - Health check: `http://localhost:8081/health`

- **end_user**: Nuxt 4 SSR app on port 8080 (internal)
  - Health check: `http://localhost:8080`

- **mongo**: MongoDB database on port 27017 (internal)

## Accessing Services

- **Main site**: http://localhost (or https://localhost if SSL is configured)
- **Admin panel**: http://localhost/admin
- **API**: http://localhost/api
- **Server health**: http://localhost/api/health

## SSL Setup (Optional for Local)

For local HTTPS testing, you'll need SSL certificates:

```bash
# Create SSL directories
mkdir -p nginx/ssl nginx/certbot

# Generate self-signed certificates (for testing only)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

## Troubleshooting

### Admin panel not loading

Make sure you've built the admin panel static files:
```bash
cd admin_panel
npm install
npm run generate
cd ..
```

### MongoDB connection issues

Check if MongoDB container is running:
```bash
docker-compose -f docker-compose.local.yaml ps mongo
docker-compose -f docker-compose.local.yaml logs mongo
```

### Port conflicts

If ports 80 or 443 are already in use, modify the ports in `docker-compose.local.yaml`:
```yaml
ports:
  - "8080:80"   # Use port 8080 instead of 80
  - "8443:443"  # Use port 8443 instead of 443
```

### Rebuild after code changes

```bash
# Rebuild specific service
docker-compose -f docker-compose.local.yaml build server
docker-compose -f docker-compose.local.yaml up -d server

# Rebuild all services
docker-compose -f docker-compose.local.yaml up --build
```

## Production Deployment

For production, use the main `docker-compose.yaml` file which pulls images from GitHub Container Registry. See the GitHub Actions workflow for automated deployment.

