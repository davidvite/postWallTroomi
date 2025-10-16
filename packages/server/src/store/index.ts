import { PostStore } from './redisClient';
import { MockPostStore, RedisMock } from './redisMock';

// Create a singleton store instance that can be shared across the application
const redisMock = new RedisMock();
export const postStore: PostStore = new MockPostStore(redisMock);
