# Deployment Analysis: Goranee v1 (chord_library)

This document provides a comprehensive analysis of the deployment pipeline for the Goranee v1 application (chord_library project) from GitHub Actions to Docker images and Docker Compose.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [GitHub Actions Workflows](#github-actions-workflows)
4. [Docker Images](#docker-images)
5. [Docker Compose Configuration](#docker-compose-configuration)
6. [Deployment Process Flow](#deployment-process-flow)
7. [Container Registry](#container-registry)
8. [Server Deployment](#server-deployment)
9. [Service Communication](#service-communication)
10. [Environment Configuration](#environment-configuration)

---

## Overview

The Goranee v1 application is deployed using a CI/CD pipeline that:
- Builds Docker images for the application, Nginx, and MongoDB
- Pushes images to GitHub Container Registry (GHCR)
- Deploys to a remote server via SSH
- Uses Docker Compose to orchestrate multiple services

**Key Technologies:**
- GitHub Actions (CI/CD)
- GitHub Container Registry (GHCR) - `ghcr.io`
- Docker & Docker Compose
- Node.js 14.21.1 (Alpine)
- Nuxt.js 2.15.7
- Nginx (Alpine)
- MongoDB 4.4.28
- PM2 (Process Manager)

---

## Architecture

The application consists of three main services:

1. **Website Service** - Nuxt.js frontend + Express.js API proxy
2. **Nginx Service** - Reverse proxy and SSL termination
3. **MongoDB Service** - Database

```
┌─────────────────────────────────────────────────────────┐
│                    Internet Users                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Nginx (Port 80/443)                        │
│  - SSL Termination                                      │
│  - Reverse Proxy                                        │
│  - Static File Serving                                  │
└────────────┬───────────────────────┬────────────────────┘
             │                       │
             │ /api/*                │ /*
             ▼                       ▼
┌─────────────────────────┐  ┌──────────────────────────┐
│   Website Service       │  │   Website Service        │
│   (Port 8080)           │  │   (Port 8080)            │
│                         │  │                          │
│  ┌──────────────────┐   │  │  ┌──────────────────┐   │
│  │  Nuxt.js App     │   │  │  │  Nuxt.js App     │   │
│  │  (Port 8080)     │   │  │  │  (Port 8080)     │   │
│  └────────┬─────────┘   │  │  └────────┬─────────┘   │
│           │              │  │           │              │
│           │ /api/*       │  │           │              │
│           ▼              │  │           │              │
│  ┌──────────────────┐   │  │           │              │
│  │  Express Proxy   │   │  │           │              │
│  │  → localhost:8081│   │  │           │              │
│  └────────┬─────────┘   │  │           │              │
└───────────┼──────────────┘  └───────────┼──────────────┘
            │                              │
            │                              │
            └──────────────┬───────────────┘
                           │
                           ▼
            ┌──────────────────────────┐
            │   Server Service         │
            │   (Port 8081)            │
            │   ModularRest API        │
            └────────────┬─────────────┘
                         │
                         ▼
            ┌──────────────────────────┐
            │   MongoDB                │
            │   (Port 27017)           │
            └──────────────────────────┘
```

---

## GitHub Actions Workflows

### 1. Deploy to SSH Server Workflow

**File:** `.github/workflows/deploy-to-ssh-server.yml`

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch
- Manual workflow dispatch

**Jobs:**

#### Job 1: `check-changes`
- **Purpose:** Determines if Nginx-related files have changed
- **Runs on:** `ubuntu-latest`
- **Steps:**
  - Checks out repository with depth 2 (for change detection)
  - Uses `dorny/paths-filter@v2` to detect changes in:
    - `nginx/**` directory
    - `nginx.Dockerfile`
  - Outputs `nginx: true/false` for conditional builds

#### Job 2: `build-nginx` (Conditional)
- **Runs when:** `check-changes.outputs.nginx == 'true'`
- **Steps:**
  1. Checkout repository
  2. Login to GHCR using `GITHUB_TOKEN`
  3. Build Nginx image: `ghcr.io/navidshad/chord_library_nginx:latest`
  4. Push image to GHCR

#### Job 3: `build`
- **Purpose:** Builds the main application Docker image
- **Steps:**
  1. Checkout repository
  2. Setup Node.js 14
  3. **Build Nuxt.js application:**
     - Creates `.env` file with:
       - `VUE_APP_BASE_URL=/api/`
       - `VUE_APP_BASE_URL_ON_SERVER=http://localhost:8081/`
     - Installs dependencies (`npm install`)
     - Builds production bundle (`npm run build`)
  4. Login to GHCR
  5. Build Docker image: `ghcr.io/navidshad/chord_library:SERVER-{sha}`
     - Uses `app.Dockerfile`
     - Tags with commit SHA for versioning
  6. Push image to GHCR

#### Job 4: `deploy`
- **Runs when:** `build` job succeeds
- **Dependencies:** `build`, `build-nginx`, `check-changes`
- **Steps:**
  1. Checkout repository
  2. **Copy docker-compose.yaml to server:**
     - Uses `appleboy/scp-action@v0.1.7`
     - Requires secrets: `SSH_HOST`, `SSH_USERNAME`, `SSH_KEY`
  3. **SSH into server and deploy:**
     - Uses `appleboy/ssh-action@v1`
     - Environment variables passed:
       - `SERVER_IMAGE_NAME`: `SERVER-{sha}`
       - `SERVER_ADMIN_EMAIL`: From GitHub variables
       - `SERVER_ADMIN_PASSWORD`: From GitHub variables
       - `GITHUB_TOKEN`: For GHCR authentication
     - **Deployment script:**
       ```bash
       # Login to GitHub Container Registry
       echo "$GITHUB_TOKEN" | docker login ghcr.io -u {github.actor} --password-stdin || true
       
       # Remove the previous version of the app, if exists
       docker-compose down
       
       # Remove all stopped images
       docker system prune -a --force
       
       # Up the app
       docker-compose up --remove-orphans -d
       ```

### 2. Push MongoDB Workflow

**File:** `.github/workflows/push-mongodb.yml`

**Triggers:**
- Manual workflow dispatch only

**Purpose:** Publishes MongoDB image to GHCR

**Steps:**
1. Checkout repository
2. Login to GHCR
3. Pull official MongoDB image: `mongo:4.4.28`
4. Tag image: `ghcr.io/navidshad/chord_library_mongodb:4.4.28`
5. Push to GHCR

**Note:** This workflow is run separately and infrequently, as MongoDB image doesn't change often.

---

## Docker Images

### 1. Application Image (`app.Dockerfile`)

**Base Image:** `node:14.21.1-alpine`

**Build Process:**

1. **Install System Dependencies:**
   ```dockerfile
   RUN apk add g++ make py3-pip
   RUN apk add zip
   RUN apk add --upgrade mongodb-tools
   RUN npm install pm2 -g
   ```

2. **Copy Package Files:**
   ```dockerfile
   COPY ["/server/package.json", "/server/package-lock.json", "/server/yarn.lock", "./server/"]
   COPY ["/website/package.json", "/website/package-lock.json", "/website/yarn.lock", "./website/"]
   ```

3. **Install Dependencies:**
   ```dockerfile
   WORKDIR /server
   RUN npm install
   
   WORKDIR /website
   RUN npm install
   ```

4. **Copy Application Code:**
   ```dockerfile
   WORKDIR /server
   COPY /server/backup_tools ./backup_tools/
   COPY /server/src ./src
   COPY /server/app-docker.js ./
   
   WORKDIR /
   COPY website ./website
   COPY .nuxt ./.nuxt
   ```

5. **Define Volumes:**
   ```dockerfile
   VOLUME "/server/uploads"
   VOLUME "/server/backups"
   ```

6. **Expose Port:**
   ```dockerfile
   EXPOSE 8080
   ```

7. **Start Command:**
   ```dockerfile
   COPY ecosystem.config.js ./
   CMD ["pm2-runtime", "ecosystem.config.js"]
   ```

**PM2 Configuration (`ecosystem.config.js`):**
- Runs two processes:
  1. **Server:** `/server/app-docker.js` (ModularRest API on port 8081)
  2. **Nuxt:** `/website/app-docker.js` (Nuxt.js app on port 8080)

**Image Tagging:**
- Format: `ghcr.io/navidshad/chord_library:SERVER-{commit-sha}`
- Example: `ghcr.io/navidshad/chord_library:SERVER-abc123def456`

### 2. Nginx Image (`nginx.Dockerfile`)

**Base Image:** `nginx:alpine`

**Build Process:**

1. **Copy Configuration Files:**
   ```dockerfile
   COPY nginx/nginx.conf /etc/nginx/nginx.conf
   COPY nginx/default.conf /etc/nginx/conf.d/default.conf
   ```

2. **Create SSL Directories:**
   ```dockerfile
   RUN mkdir -p /etc/nginx/ssl /var/www/certbot
   ```

3. **Expose Ports:**
   ```dockerfile
   EXPOSE 80 443
   ```

**Image Tagging:**
- Format: `ghcr.io/navidshad/chord_library_nginx:latest`

### 3. MongoDB Image

**Source:** Official MongoDB image from Docker Hub

**Process:**
- Pulled from `mongo:4.4.28`
- Tagged and pushed to GHCR as `ghcr.io/navidshad/chord_library_mongodb:4.4.28`

**Why Custom Image?**
- Ensures consistent MongoDB version across deployments
- Reduces dependency on Docker Hub availability
- Allows for potential future customizations

---

## Docker Compose Configuration

**File:** `docker-compose.yaml`

### Services

#### 1. Nginx Service

```yaml
nginx:
  image: ghcr.io/navidshad/chord_library_nginx:${NGINX_IMAGE_TAG:-latest}
  restart: always
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx/ssl:/etc/nginx/ssl:ro
    - ./nginx/certbot:/var/www/certbot:ro
  depends_on:
    - website
  networks:
    - default
```

**Configuration:**
- **Image:** Uses environment variable `NGINX_IMAGE_TAG` (defaults to `latest`)
- **Ports:** Exposes HTTP (80) and HTTPS (443)
- **Volumes:**
  - SSL certificates: `./nginx/ssl` → `/etc/nginx/ssl` (read-only)
  - Certbot webroot: `./nginx/certbot` → `/var/www/certbot` (read-only)
- **Dependencies:** Waits for `website` service

#### 2. Website Service

```yaml
website:
  image: ghcr.io/navidshad/chord_library:${SERVER_IMAGE_NAME:-website:latest}
  restart: always
  expose:
    - "8080"
  volumes:
    - ./public_assets:/server/downloads
    - ./backups:/server/backups
  environment:
    - ADMIN_EMAIL=${SERVER_ADMIN_EMAIL:-admin@mail.com}
    - ADMIN_PASSWORD=${SERVER_ADMIN_PASSWORD:-admin}
    - NODE_ENV=production
    - VUE_APP_BASE_URL=/api/
    - MONGODB_URL=mongodb://mongo:27017
    - MONGODB_prefix=mrest_
  depends_on:
    - "mongo"
```

**Configuration:**
- **Image:** Uses environment variable `SERVER_IMAGE_NAME` (set during deployment)
- **Ports:** Exposes 8080 internally (not to host)
- **Volumes:**
  - Public assets: `./public_assets` → `/server/downloads`
  - Backups: `./backups` → `/server/backups`
- **Environment Variables:**
  - `ADMIN_EMAIL`: Admin email (from GitHub variables)
  - `ADMIN_PASSWORD`: Admin password (from GitHub variables)
  - `NODE_ENV`: Set to `production`
  - `VUE_APP_BASE_URL`: API base URL for frontend
  - `MONGODB_URL`: MongoDB connection string
  - `MONGODB_prefix`: Database prefix
- **Dependencies:** Waits for `mongo` service

#### 3. MongoDB Service

```yaml
mongo:
  image: ghcr.io/navidshad/chord_library_mongodb:4.4.28
  volumes:
    - ./database_data:/data/db
  restart: always
```

**Configuration:**
- **Image:** Fixed version `4.4.28`
- **Volumes:**
  - Database data: `./database_data` → `/data/db`
- **Ports:** Not exposed (internal only)

---

## Deployment Process Flow

### Complete Deployment Sequence

```
1. Developer pushes to main branch
   │
   ▼
2. GitHub Actions triggered
   │
   ├─► check-changes job
   │   └─► Detects if nginx files changed
   │
   ├─► build-nginx job (conditional)
   │   ├─► Builds nginx.Dockerfile
   │   └─► Pushes to ghcr.io/navidshad/chord_library_nginx:latest
   │
   ├─► build job
   │   ├─► Installs Node.js 14
   │   ├─► Builds Nuxt.js app (npm run build)
   │   ├─► Builds app.Dockerfile
   │   └─► Pushes to ghcr.io/navidshad/chord_library:SERVER-{sha}
   │
   └─► deploy job
       ├─► Copies docker-compose.yaml to server via SCP
       └─► SSH into server
           ├─► Logs into GHCR
           ├─► docker-compose down
           ├─► docker system prune -a --force
           └─► docker-compose up --remove-orphans -d
```

### Deployment Script Execution

When the `deploy` job runs, it executes the following on the remote server:

```bash
# 1. Authenticate with GHCR
echo "$GITHUB_TOKEN" | docker login ghcr.io -u {github.actor} --password-stdin || true

# 2. Stop and remove existing containers
docker-compose down

# 3. Clean up unused Docker resources
docker system prune -a --force

# 4. Start services with new images
docker-compose up --remove-orphans -d
```

**Environment Variables Set:**
- `SERVER_IMAGE_NAME`: `SERVER-{commit-sha}` (from workflow env)
- `SERVER_ADMIN_EMAIL`: From GitHub repository variables
- `SERVER_ADMIN_PASSWORD`: From GitHub repository variables

---

## Container Registry

### GitHub Container Registry (GHCR)

**Registry URL:** `ghcr.io`

**Images Published:**

1. **Application:**
   - `ghcr.io/navidshad/chord_library:SERVER-{sha}`
   - Tagged with commit SHA for versioning

2. **Nginx:**
   - `ghcr.io/navidshad/chord_library_nginx:latest`
   - Always uses `latest` tag

3. **MongoDB:**
   - `ghcr.io/navidshad/chord_library_mongodb:4.4.28`
   - Fixed version tag

**Authentication:**
- Uses `GITHUB_TOKEN` secret (automatically provided by GitHub Actions)
- On server: Uses `GITHUB_TOKEN` passed as environment variable during deployment

**Access:**
- Images are private by default
- Requires authentication to pull
- Server authenticates during deployment using `GITHUB_TOKEN`

---

## Server Deployment

### SSH Configuration

**Required Secrets:**
- `SSH_HOST`: Server IP address or hostname
- `SSH_USERNAME`: SSH username
- `SSH_KEY`: Private SSH key for authentication

### Deployment Steps on Server

1. **File Transfer:**
   - `docker-compose.yaml` is copied to server root directory

2. **Docker Operations:**
   - Login to GHCR
   - Pull new images
   - Stop existing containers
   - Remove old images (prune)
   - Start new containers

3. **Zero-Downtime:**
   - Uses `docker-compose up --remove-orphans -d`
   - Containers restart automatically if they fail (`restart: always`)

### Server Requirements

- Docker installed
- Docker Compose installed
- SSH access configured
- Network access to `ghcr.io`
- Required directories:
  - `./nginx/ssl` (SSL certificates)
  - `./nginx/certbot` (Let's Encrypt webroot)
  - `./public_assets` (public files)
  - `./backups` (backup files)
  - `./database_data` (MongoDB data)

---

## Service Communication

### Internal Network

All services run on the same Docker network (`default`) and communicate via service names.

### Request Flow

1. **External Request (HTTPS):**
   ```
   User → Nginx:443 → Website:8080
   ```

2. **API Request:**
   ```
   User → Nginx:443 → Website:8080/api/* → Express Proxy → Server:8081
   ```

3. **Database Access:**
   ```
   Server:8081 → MongoDB:27017
   ```

### Port Mapping

| Service | Internal Port | External Port | Access   |
| ------- | ------------- | ------------- | -------- |
| Nginx   | 80, 443       | 80, 443       | Public   |
| Website | 8080          | -             | Internal |
| Server  | 8081          | -             | Internal |
| MongoDB | 27017         | -             | Internal |

### Nginx Configuration

**HTTP (Port 80):**
- Redirects all traffic to HTTPS
- Allows Let's Encrypt challenges at `/.well-known/acme-challenge/`

**HTTPS (Port 443):**
- SSL termination
- Proxies `/api/*` to `http://website:8080`
- Proxies all other routes to `http://website:8080`
- Security headers (HSTS, X-Frame-Options, etc.)

**Proxy Settings:**
- WebSocket support enabled
- Timeouts: 60s (300s for API)
- Buffering disabled for large file uploads/downloads

---

## Environment Configuration

### Build-Time Environment Variables

**Set during GitHub Actions build:**

```bash
VUE_APP_BASE_URL=/api/
VUE_APP_BASE_URL_ON_SERVER=http://localhost:8081/
```

These are written to `.env` file in the `website` directory before building.

### Runtime Environment Variables

**Set in docker-compose.yaml:**

```yaml
environment:
  - ADMIN_EMAIL=${SERVER_ADMIN_EMAIL:-admin@mail.com}
  - ADMIN_PASSWORD=${SERVER_ADMIN_PASSWORD:-admin}
  - NODE_ENV=production
  - VUE_APP_BASE_URL=/api/
  - MONGODB_URL=mongodb://mongo:27017
  - MONGODB_prefix=mrest_
```

**Source:**
- `SERVER_ADMIN_EMAIL`: GitHub repository variable
- `SERVER_ADMIN_PASSWORD`: GitHub repository variable
- Others: Hardcoded in docker-compose.yaml

### Application Configuration

**Server (`app-docker.js`):**
- Port: 8081
- MongoDB: From `MONGODB_URL` environment variable
- Database prefix: `mrest_`
- Upload directory: `/server/uploads`
- Backup directory: `/server/backups`

**Website (`app-docker.js`):**
- Port: 8080
- API proxy target: `http://localhost:8081`
- API path rewrite: `/api` → `` (removed)

**Nuxt Configuration:**
- Base URL (client): `/api/`
- Base URL (server): `http://localhost:8081/`
- Build directory: `../.nuxt` (shared between host and container)

---

## Key Features

### 1. Versioning Strategy

- **Application:** Tagged with commit SHA (`SERVER-{sha}`)
  - Enables rollback to specific versions
  - Tracks which commit is deployed
- **Nginx:** Always uses `latest` tag
  - Simpler for configuration updates
- **MongoDB:** Fixed version (`4.4.28`)
  - Ensures database compatibility

### 2. Conditional Builds

- Nginx image only builds when nginx files change
- Reduces build time and resource usage

### 3. Cleanup Strategy

- `docker system prune -a --force` removes unused images
- Prevents disk space issues on server
- May cause longer pull times on first deployment

### 4. Process Management

- Uses PM2 for process management
- Runs both server and website in same container
- Automatic restarts on failure

### 5. Volume Management

- Persistent volumes for:
  - Database data
  - Uploads
  - Backups
  - Public assets
- Data survives container restarts

---

## Potential Improvements

1. **Health Checks:**
   - Add health check endpoints
   - Configure Docker health checks
   - Implement graceful shutdowns

2. **Rollback Strategy:**
   - Keep previous image tags
   - Add rollback workflow
   - Implement blue-green deployment

3. **Monitoring:**
   - Add logging aggregation
   - Implement metrics collection
   - Set up alerting

4. **Security:**
   - Use Docker secrets for sensitive data
   - Implement image scanning
   - Regular security updates

5. **Optimization:**
   - Multi-stage builds for smaller images
   - Layer caching optimization
   - Build cache usage

6. **Database:**
   - Consider MongoDB replica set for production
   - Implement backup automation
   - Add database migration strategy

---

## Summary

The Goranee v1 deployment pipeline is a well-structured CI/CD system that:

- ✅ Automates builds and deployments
- ✅ Uses versioned Docker images
- ✅ Supports zero-downtime deployments
- ✅ Manages multiple services with Docker Compose
- ✅ Uses GitHub Container Registry for image storage
- ✅ Implements conditional builds for optimization
- ✅ Provides persistent data storage

The system is production-ready but could benefit from enhanced monitoring, security hardening, and more sophisticated deployment strategies for larger scale operations.

