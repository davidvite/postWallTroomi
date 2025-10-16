import { Post, PostFormData, ApiResponse } from '../types';

// Determine API base URL based on environment
const getApiBaseUrl = (): string => {
  // Debug logging
  console.log('🔧 Environment Detection:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    PROD: import.meta.env.PROD,
    MODE: import.meta.env.MODE,
    NODE_ENV: import.meta.env.NODE_ENV,
    location: typeof window !== 'undefined' ? window.location.hostname : 'server'
  });

  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    console.log('✅ Using VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Check if we're on Vercel (production) by hostname - this is the most reliable method
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('vercel.app') || hostname.includes('vercel.com')) {
      console.log('✅ Detected Vercel deployment, using /api');
      return '/api';
    }
  }
  
  // In production mode, use relative path to API
  if (import.meta.env.PROD || import.meta.env.MODE === 'production') {
    console.log('✅ Production mode detected, using /api');
    return '/api';
  }
  
  // In development, use localhost
  console.log('✅ Development mode, using localhost:4000');
  return 'http://localhost:4000/api';
};

const API_BASE_URL = getApiBaseUrl();
console.log('🚀 Final API_BASE_URL:', API_BASE_URL);

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
