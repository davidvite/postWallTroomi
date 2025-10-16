import { Post } from '@post-wall/shared';
import { RedisClient, PostStore, sortPostsNewestFirst, RedisKeys } from './redisClient';

// In-memory Redis mock implementation
export class RedisMock implements RedisClient {
  private data: Map<string, string> = new Map();
  private postIds: string[] = [];

  async get(key: string): Promise<string | null> {
    return this.data.get(key) || null;
  }

  async set(key: string, value: string): Promise<void> {
    this.data.set(key, value);
  }

  async del(key: string): Promise<void> {
    this.data.delete(key);
  }

  async lpush(key: string, ...values: string[]): Promise<number> {
    if (key === RedisKeys.postIds) {
      this.postIds.unshift(...values); // Add to beginning for newest first
      return this.postIds.length;
    }
    return 0;
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    if (key === RedisKeys.postIds) {
      return this.postIds.slice(start, stop === -1 ? undefined : stop + 1);
    }
    return [];
  }

  async lrem(key: string, count: number, value: string): Promise<number> {
    if (key === RedisKeys.postIds) {
      const index = this.postIds.indexOf(value);
      if (index > -1) {
        this.postIds.splice(index, 1);
        return 1;
      }
    }
    return 0;
  }

  async exists(key: string): Promise<number> {
    return this.data.has(key) ? 1 : 0;
  }
}

// Post store implementation using Redis mock
export class MockPostStore implements PostStore {
  constructor(private redis: RedisClient) {}

  async list(): Promise<Post[]> {
    try {
      const postIds = await this.redis.lrange(RedisKeys.postIds, 0, -1);
      if (postIds.length === 0) return [];

      const posts: Post[] = [];
      for (const id of postIds) {
        const postData = await this.redis.get(RedisKeys.post(id));
        if (postData) {
          try {
            const post = JSON.parse(postData) as Post;
            posts.push(post);
          } catch (error) {
            console.error(`Failed to parse post ${id}:`, error);
          }
        }
      }

      return sortPostsNewestFirst(posts);
    } catch (error) {
      console.error('Failed to list posts:', error);
      throw new Error('Failed to retrieve posts');
    }
  }

  async get(id: string): Promise<Post | null> {
    try {
      const postData = await this.redis.get(RedisKeys.post(id));
      if (!postData) return null;

      return JSON.parse(postData) as Post;
    } catch (error) {
      console.error(`Failed to get post ${id}:`, error);
      return null;
    }
  }

  async set(post: Post): Promise<Post> {
    try {
      const isNew = await this.redis.exists(RedisKeys.post(post.id)) === 0;
      
      // Store the post data
      await this.redis.set(RedisKeys.post(post.id), JSON.stringify(post));
      
      // Add to post IDs list if new
      if (isNew) {
        await this.redis.lpush(RedisKeys.postIds, post.id);
      }
      
      return post;
    } catch (error) {
      console.error(`Failed to set post ${post.id}:`, error);
      throw new Error('Failed to save post');
    }
  }

  async update(id: string, post: Post): Promise<Post> {
    try {
      // Store the updated post data
      await this.redis.set(RedisKeys.post(id), JSON.stringify(post));
      return post;
    } catch (error) {
      console.error(`Failed to update post ${id}:`, error);
      throw new Error('Failed to update post');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const post = await this.get(id);
      if (!post) return false;

      // Remove post data
      await this.redis.del(RedisKeys.post(id));
      
      // Remove from post IDs list
      await this.redis.lrem(RedisKeys.postIds, 1, id);
      
      return true;
    } catch (error) {
      console.error(`Failed to delete post ${id}:`, error);
      return false;
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      return await this.redis.exists(RedisKeys.post(id)) === 1;
    } catch (error) {
      console.error(`Failed to check existence of post ${id}:`, error);
      return false;
    }
  }
}
