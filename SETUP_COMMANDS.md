# Setup Commands - Social Posting Wall

## 1. Initialize Repository Structure

```bash
# Create directory structure
mkdir -p packages/{shared,server,client}/src
mkdir -p packages/shared/src/{types,validation,utils}
mkdir -p packages/server/src/{routes,controllers,services,repositories,middleware,config,errors}
mkdir -p packages/client/src/{components,hooks,services,styles,utils}
mkdir -p packages/client/public

# Create shared types structure
mkdir -p packages/shared/src/types
mkdir -p packages/shared/src/validation
mkdir -p packages/shared/src/utils

# Create server structure
mkdir -p packages/server/src/{routes,controllers,services,repositories,middleware,config,errors}

# Create client structure
mkdir -p packages/client/src/{components,hooks,services,styles,utils}
mkdir -p packages/client/public
```

## 2. Install Dependencies

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install all dependencies
pnpm install
```

## 3. Build Shared Package

```bash
# Build shared types first (required for other packages)
pnpm build:shared
```

## 4. Setup Environment Files

```bash
# Copy environment examples
cp env.example .env
cp packages/server/env.example packages/server/.env
cp packages/client/env.example packages/client/.env
```

## 5. Start Development Servers

```bash
# Start both server and client in development mode
pnpm dev

# Or start individually:
# Server only (port 4000)
pnpm dev:server

# Client only (port 5173)
pnpm dev:client
```

## 6. Verify Setup

```bash
# Check TypeScript compilation
pnpm type-check

# Check if shared types are working
pnpm --filter shared type-check
pnpm --filter server type-check
pnpm --filter client type-check
```

## 7. Optional: Lint and Format

```bash
# Format code (if prettier is configured)
pnpm format

# Lint code (if eslint is configured)
pnpm lint
```

## Quick Start Summary

```bash
# Complete setup in one go
mkdir -p packages/{shared,server,client}/src packages/shared/src/{types,validation,utils} packages/server/src/{routes,controllers,services,repositories,middleware,config,errors} packages/client/src/{components,hooks,services,styles,utils} packages/client/public
pnpm install
pnpm build:shared
cp env.example .env && cp packages/server/env.example packages/server/.env && cp packages/client/env.example packages/client/.env
pnpm dev
```

## Development Workflow

1. **Start development**: `pnpm dev`
2. **Server runs on**: http://localhost:4000
3. **Client runs on**: http://localhost:5173
4. **API endpoints**: http://localhost:4000/api/posts
5. **Health check**: http://localhost:4000/health
