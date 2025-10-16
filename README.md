Social Posting Wall – Monorepo (React + Express + TypeScript)

Overview
This is a Social Posting Wall application implemented per the Canonical Spec. It is a full-stack TypeScript monorepo using React + Vite + SCSS on the frontend and Node.js + Express on the backend. Persistence is implemented via an interface-driven store with a default in-memory Redis-mock for fast local development. The app provides a “real-time” feel using lightweight polling (~2.5s) plus optimistic updates.

Key Decisions
- Frontend: React + Vite (TypeScript, SCSS modules). No Next.js, no CSS-in-JS, no Tailwind.
- Backend: Express (TypeScript, strict mode). Zod validation for inputs. Centralized errors.
- Persistence: Interface-based store with Redis-mock (Map + id list). Easy swap to real Redis.
- Real-time: Polling every ~2500ms (simple, robust). Optimistic updates for create/edit.

Monorepo Structure
postWallTroomi/
- client/ – React SPA (Vite)
- server/ – Express API (TS)
- shared/ – Shared types, validation, utils
- .cursor/rules/ – Project rules for Cursor

Canonical Spec Summary (Acceptance Criteria)
- SPA displays a wall of posts sorted newest-first.
- Users can create posts: alias, avatar (emoji/URL), content (≤300 chars).
- Posts persist across refreshes via Redis (or mocked equivalent).
- Users can edit a post using a 6‑digit Edit ID.
- API Endpoints:
  - GET /posts – List all posts
  - POST /posts – Create post: { alias, avatar, content, optional editId }
  - PATCH /posts/:id – Update post: requires editId to match stored value
- Validation with Zod; specific status codes: 201, 400, 403, 404.
- Real-time feel: polling 2–3s + optimistic updates.

Data Model
interface Post {
  id: string;
  alias: string;
  avatar: string; // emoji or image URL
  content: string; // max 300 chars
  timestamp: number;
  editId: string; // 6-digit string
}

## ✨ Features

- 🏔️ **Outdoorsy Theme**: Snowsport, water sport, and adventure avatars
- 📝 **Create Posts**: Alias, avatar selection, content (max 300 chars)
- ✏️ **Edit Posts**: 6-digit Edit ID system for secure editing
- 🔔 **Toast Notifications**: Beautiful success/error messages with Edit ID display
- ⚡ **Real-time Feel**: Polling + optimistic updates
- 🎨 **Modern UI**: React + TypeScript + SCSS with responsive design
- 🏂 **Easter Egg**: Default MexicanSnowboarder post
- 🔒 **Type Safety**: Strict TypeScript throughout
- 🚀 **Deployed**: Live on Vercel with serverless functions

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** (recommended)
- **pnpm** package manager: `npm install -g pnpm`

### Installation
```bash
pnpm install
```

### 🏃‍♂️ Running Locally

**Start both server and client together:**
```bash
pnpm dev
```

This single command will:
- ✅ Start the **Express server** on port 4000
- ✅ Start the **React client** on port 5173 (or 5174 if 5173 is busy)
- ✅ Enable **hot reload** for both frontend and backend
- ✅ Create the **default MexicanSnowboarder post** 🏂

**Access your application:**
- 🌐 **Frontend**: http://localhost:5173/ (or 5174)
- 🔗 **API**: http://localhost:4000/api/posts
- ❤️ **Health Check**: http://localhost:4000/health

### 🔧 Alternative: Run Separately

If you prefer to run server and client in separate terminals:

**Terminal 1 - Server:**
```bash
pnpm dev:server
```

**Terminal 2 - Client:**
```bash
pnpm dev:client
```

### 🛠️ Troubleshooting

**Port conflicts?**
```bash
# Kill existing processes
pkill -f "ts-node-dev" || true
pkill -f "vite" || true

# Start fresh
pnpm dev
```

**Server won't start?**
- Check if port 4000 is already in use
- The server will automatically restart when you make changes

**Client won't start?**
- Vite will automatically try the next available port (5174, 5175, etc.)
- Check the terminal output for the actual port being used

## 🌐 Live Demo

**Production URL**: https://post-wall-troomi.vercel.app

The application is deployed on Vercel with:
- ✅ **Frontend**: React SPA with Vite
- ✅ **Backend**: Vercel Serverless Functions
- ✅ **Features**: Create posts, edit with 6-digit IDs, outdoorsy avatars, toast notifications
- ✅ **Default Post**: MexicanSnowboarder with 🏂 avatar

## 🏗️ Production Build

**Build all packages:**
```bash
pnpm build
```

**Build individual packages:**
```bash
# Build shared types
pnpm build:shared

# Build server
pnpm build:server

# Build client
pnpm build:client
```

**Start production server:**
```bash
pnpm start
```

Environment Variables
- Root env.example files exist in server/ and client/ with sensible defaults.
- Typical variables:
  - SERVER_PORT (default 4000)
  - CLIENT_PORT (default 5173)
  - ALLOWED_ORIGIN (default http://localhost:5173)
  - STORE_IMPLEMENTATION (mock | redis) – controls persistence backend

API Reference
Base URL: http://localhost:4000/api

GET /posts
Response 200
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "alias": "HappyHacker",
      "avatar": "🧠",
      "content": "Building cool stuff!",
      "timestamp": 1714659101241,
      "editId": "627491"
    }
  ]
}

POST /posts
Request
{
  "alias": "TestUser",
  "avatar": "🚀",
  "content": "Hello world!",
  "editId": "123456" // optional; if omitted, server generates one
}

Responses
- 201 Created
{
  "success": true,
  "data": {
    "id": "v53yuh0xgws",
    "alias": "TestUser",
    "avatar": "🚀",
    "content": "Hello world!",
    "timestamp": 1714659101241,
    "editId": "811144"
  }
}

- 400 Bad Request
{
  "success": false,
  "error": {
    "message": "Validation error",
    "field": "content"
  }
}

PATCH /posts/:id
Request
{
  "alias": "NewAlias",
  "content": "Updated content",
  "editId": "811144"
}

Responses
- 200 OK
{
  "success": true,
  "data": { /* updated Post */ }
}

- 403 Forbidden (editId mismatch)
{
  "success": false,
  "error": { "message": "Unauthorized" }
}

- 404 Not Found
{
  "success": false,
  "error": { "message": "Not Found" }
}

Error Shape (Server)
{
  "success": false,
  "error": {
    "message": string,
    "field"?: string
  }
}

Frontend Behavior
- Components: PostWall, PostCard, PostForm, EditModal.
- Polling: ~2500ms refresh of /posts.
- Optimistic updates for create/edit with rollback on error.
- Edit flow: enter Edit ID in modal; if matches, fields become editable.
- Local storage: remembers a map of { [postId]: editId } to auto-enable the Edit button for owned posts.
- Accessibility: modal focus handling, ESC to close.

Real-time Strategy
- Simple setInterval polling (~2.5s) plus optimistic UI updates. No websockets needed for MVP; easier to host and reason about.

Swapping to Real Redis
The server programs to a PostStore interface. The default is an in-memory Redis-mock (Map + postIds list). To swap to real Redis:
1) Install a Redis client, e.g. ioredis
pnpm -C server add ioredis
2) Implement a Redis-backed PostStore under server/src/store/ (mirror the interface used by redisMock.ts).
3) Set env STORE_IMPLEMENTATION=redis and configure Redis connection variables (e.g., REDIS_URL).
4) Restart the server. All routes and logic remain unchanged.

Testing Notes
- TypeScript strict mode enforced across packages.
- Manual testing via cURL and the running SPA.
- Add your preferred test runner (e.g., Vitest/Jest) as needed.

AI Assistance Log (Template)
Prompts Used
- Summarize Canonical Spec
- Scaffold monorepo (pnpm workspaces, TS configs)
- Implement backend MVP (Express + Zod + Redis-mock)
- Implement frontend SPA (React + SCSS)
- Start project, troubleshoot ports and Vite config

Delegated vs Self-built
- Delegated: Project scaffolding, boilerplate generation, initial API and components, config files.
- Self-built: Iterative fixes, environment setup, content and UX adjustments, README curation.

Notes for Review
- The repository follows the Canonical Spec constraints (React SPA, Express TS, SCSS-only, Redis/mock, polling + optimistic updates).
- Strict typing and clear separation (routes, middleware, services, validation, components, hooks, utils).


