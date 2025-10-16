import { Post } from '@post-wall/shared';

// Redis client interface for easy swapping between real Redis and mock
export interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  del(key: string): Promise<void>;
  lpush(key: string, ...values: string[]): Promise<number>;
  lrange(key: string, start: number, stop: number): Promise<string[]>;
  lrem(key: string, count: number, value: string): Promise<number>;
  exists(key: string): Promise<number>;
}

// Store interface for post operations
export interface PostStore {
  list(): Promise<Post[]>;
  get(id: string): Promise<Post | null>;
  set(post: Post): Promise<Post>;
  update(id: string, post: Post): Promise<Post>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}

// Helper function to sort posts by timestamp (newest first)
export function sortPostsNewestFirst(posts: Post[]): Post[] {
  return posts.sort((a, b) => b.timestamp - a.timestamp);
}

// Helper function to generate Redis keys
export const RedisKeys = {
  post: (id: string) => `post:${id}`,
  postIds: 'postIds'
} as const;
