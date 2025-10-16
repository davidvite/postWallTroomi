// Standalone types for client deployment
export interface Post {
  id: string;
  alias: string;
  avatar: string;
  content: string;
  timestamp: number;
  editId: string;
}

export interface PostFormData {
  alias: string;
  avatar: string;
  content: string;
  editId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
