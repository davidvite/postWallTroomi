// Core Post interface matching the canonical spec
export interface Post {
  id: string;
  alias: string;
  avatar: string; // emoji or image URL
  content: string; // max 300 characters
  timestamp: number; // Unix timestamp
  editId: string; // 6-digit string
}

export interface PostFormData {
  alias: string;
  avatar: string;
  content: string;
  editId?: string; // optional for new posts
}

export interface EditPostRequest {
  id: string;
  editId: string;
  updates: Partial<Pick<Post, 'alias' | 'avatar' | 'content'>>;
}
