# Backend MVP - Social Posting Wall

## Implementation Summary

The backend MVP has been implemented exactly per the Canonical Spec with a Redis-mock behind an interface.

### File Structure

```
packages/server/src/
├── store/
│   ├── redisClient.ts      # Interface + sort helper
│   └── redisMock.ts        # In-memory impl using Map + postIds
├── routes/
│   └── posts.ts            # GET/POST/PATCH exactly as spec
├── util/
│   ├── id.ts               # ID generators (postId, editId)
│   └── validation.ts       # Zod schemas for NewPost and PatchPost
├── middleware/
│   └── error.ts            # Minimal JSON error handler
├── app.ts                  # Express app, CORS, JSON
└── server.ts               # Server startup
```

### Key Features

✅ **Store Interface**: `list()`, `get(id)`, `set(post)`, `update(id, post)`  
✅ **Redis Mock**: Map-based with `postIds` array for newest-first ordering  
✅ **Zod Validation**: Request body validation with proper error messages  
✅ **Status Codes**: 201 (create), 400 (bad request), 403 (editId mismatch), 404 (not found)  
✅ **CORS**: Configured for client origin  
✅ **Error Handling**: Minimal JSON error responses  
✅ **Logging**: Request logger with timing  

## cURL Examples

### 1. GET /posts - Retrieve all posts (newest first)

```bash
curl -s http://localhost:4000/api/posts
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "0dnbojiumkwn",
      "alias": "AnotherUser",
      "avatar": "🚀",
      "content": "Updated content with correct editId!",
      "timestamp": 1760589131957,
      "editId": "123456"
    },
    {
      "id": "d4jj99b15ap",
      "alias": "TestUser",
      "avatar": "😀",
      "content": "Hello, world! This is my first post.",
      "timestamp": 1760589116530,
      "editId": "967889"
    }
  ]
}
```

### 2. POST /posts - Create new post (without editId)

```bash
curl -X POST http://localhost:4000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"alias": "TestUser", "avatar": "😀", "content": "Hello, world! This is my first post."}'
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "d4jj99b15ap",
    "alias": "TestUser",
    "avatar": "😀",
    "content": "Hello, world! This is my first post.",
    "timestamp": 1760589116530,
    "editId": "967889"
  }
}
```

### 3. POST /posts - Create new post (with custom editId)

```bash
curl -X POST http://localhost:4000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"alias": "AnotherUser", "avatar": "🚀", "content": "Second post with custom editId!", "editId": "123456"}'
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "0dnbojiumkwn",
    "alias": "AnotherUser",
    "avatar": "🚀",
    "content": "Second post with custom editId!",
    "timestamp": 1760589131957,
    "editId": "123456"
  }
}
```

### 4. PATCH /posts/:id - Update post (with matching editId)

```bash
curl -X PATCH http://localhost:4000/api/posts/0dnbojiumkwn \
  -H "Content-Type: application/json" \
  -d '{"editId": "123456", "updates": {"content": "Updated content with correct editId!"}}'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "0dnbojiumkwn",
    "alias": "AnotherUser",
    "avatar": "🚀",
    "content": "Updated content with correct editId!",
    "timestamp": 1760589131957,
    "editId": "123456"
  }
}
```

### 5. PATCH /posts/:id - Update post (with mismatching editId)

```bash
curl -X PATCH http://localhost:4000/api/posts/0dnbojiumkwn \
  -H "Content-Type: application/json" \
  -d '{"editId": "999999", "updates": {"content": "This should fail!"}}'
```

**Response (403 Forbidden):**
```json
{
  "success": false,
  "error": "Invalid edit ID"
}
```

### 6. PATCH /posts/:id - Update non-existent post

```bash
curl -X PATCH http://localhost:4000/api/posts/nonexistent \
  -H "Content-Type: application/json" \
  -d '{"editId": "123456", "updates": {"content": "This should fail!"}}'
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Post not found"
}
```

## Implementation Checklist

- [x] Stores post object keyed by `post:{id}`
- [x] Adds id to list `postIds`
- [x] 6-digit editId generated when absent
- [x] 403 Unauthorized on mismatched editId
- [x] Newest-first list ordering
- [x] Zod validation for all request bodies
- [x] Proper HTTP status codes
- [x] CORS configured for client origin
- [x] Error handling with JSON responses
- [x] Request logging with timing

## Data Persistence

The implementation uses an in-memory Redis mock that:
- Stores posts in a `Map<string, string>` with keys like `post:{id}`
- Maintains a `postIds` array for ordering (newest first)
- Implements the full Redis client interface for easy swapping
- Persists data across requests within the same server session

## Next Steps

1. Implement frontend components to consume these APIs
2. Add real Redis client for production
3. Add rate limiting and additional security measures
4. Implement delete functionality
5. Add pagination for large post lists
