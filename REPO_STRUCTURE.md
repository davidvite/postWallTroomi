# Social Posting Wall - Repository Structure

```
postWallTroomi/
├── .cursor/rules/                    # Cursor rules (existing)
├── packages/
│   ├── shared/                       # Shared types and utilities
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── Post.ts          # Post interface and related types
│   │   │   │   ├── ApiResponse.ts   # API response types
│   │   │   │   └── index.ts         # Re-exports
│   │   │   ├── validation/
│   │   │   │   ├── postSchemas.ts   # Zod validation schemas
│   │   │   │   └── index.ts
│   │   │   ├── utils/
│   │   │   │   ├── dateUtils.ts     # Timestamp formatting
│   │   │   │   └── index.ts
│   │   │   └── index.ts             # Main exports
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── server/                       # Express backend
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   └── posts.ts         # Post API routes
│   │   │   ├── controllers/
│   │   │   │   └── PostController.ts
│   │   │   ├── services/
│   │   │   │   └── PostService.ts
│   │   │   ├── repositories/
│   │   │   │   ├── PostRepository.ts
│   │   │   │   ├── RedisPostRepository.ts
│   │   │   │   └── MockPostRepository.ts
│   │   │   ├── middleware/
│   │   │   │   ├── errorHandler.ts
│   │   │   │   ├── requestLogger.ts
│   │   │   │   └── validation.ts
│   │   │   ├── config/
│   │   │   │   ├── environment.ts
│   │   │   │   └── redis.ts
│   │   │   ├── errors/
│   │   │   │   └── CustomErrors.ts
│   │   │   ├── app.ts               # Express app setup
│   │   │   └── server.ts            # Server startup
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env.example
│   │
│   └── client/                       # Vite React frontend
│       ├── src/
│       │   ├── components/
│       │   │   ├── PostWall.tsx
│       │   │   ├── PostList.tsx
│       │   │   ├── PostCard.tsx
│       │   │   ├── PostForm.tsx
│       │   │   ├── EditModal.tsx
│       │   │   └── AvatarSelector.tsx
│       │   ├── hooks/
│       │   │   ├── usePosts.ts
│       │   │   ├── useLocalStorage.ts
│       │   │   └── useValidation.ts
│       │   ├── services/
│       │   │   └── api.ts           # API client
│       │   ├── styles/
│       │   │   ├── _variables.scss
│       │   │   ├── _mixins.scss
│       │   │   ├── _base.scss
│       │   │   ├── _components.scss
│       │   │   ├── _layout.scss
│       │   │   └── main.scss
│       │   ├── utils/
│       │   │   └── dateUtils.ts
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── vite-env.d.ts
│       ├── public/
│       │   └── index.html
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── .env.example
│
├── package.json                      # Root workspace config
├── pnpm-workspace.yaml              # pnpm workspace config
├── tsconfig.json                    # Root TypeScript config
├── .env.example                     # Root environment example
├── .gitignore
└── README.md
```
