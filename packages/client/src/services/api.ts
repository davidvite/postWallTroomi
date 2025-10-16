import { Post, PostFormData, ApiResponse } from '@post-wall/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// API client for post operations
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // GET /posts - Retrieve all posts
  async getPosts(): Promise<Post[]> {
    const response = await this.request<Post[]>('/posts');
    return response.data || [];
  }

  // POST /posts - Create new post
  async createPost(data: PostFormData): Promise<Post> {
    const response = await this.request<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (!response.data) {
      throw new Error('Failed to create post');
    }
    
    return response.data;
  }

  // PATCH /posts/:id - Update post
  async updatePost(id: string, editId: string, updates: Partial<Post>): Promise<Post> {
    const response = await this.request<Post>(`/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        editId,
        updates,
      }),
    });
    
    if (!response.data) {
      throw new Error('Failed to update post');
    }
    
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
