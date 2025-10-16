// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  field?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
