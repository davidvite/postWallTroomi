import { useState, useEffect, useCallback, useRef } from 'react';
import { Post, PostFormData } from '../types';
import { apiClient } from '../services/api';

interface UsePostsReturn {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  createPost: (data: PostFormData) => Promise<Post>;
  updatePost: (id: string, editId: string, updates: Partial<Post>) => Promise<Post>;
  refreshPosts: () => Promise<void>;
}

export function usePosts(): UsePostsReturn {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch posts from API
  const fetchPosts = useCallback(async (): Promise<void> => {
    try {
      const fetchedPosts = await apiClient.getPosts();
      setPosts(fetchedPosts);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch posts';
      setError(errorMessage);
      console.error('Failed to fetch posts:', err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    const initialFetch = async () => {
      setIsLoading(true);
      await fetchPosts();
      setIsLoading(false);
    };
    
    initialFetch();
  }, [fetchPosts]);

  // Polling setup
  useEffect(() => {
    // Start polling after initial load
    const startPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = setInterval(async () => {
        await fetchPosts();
      }, 2500); // Poll every 2.5 seconds
    };

    // Start polling after initial load completes
    if (!isLoading) {
      startPolling();
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isLoading, fetchPosts]);

  // Create post with optimistic update
  const createPost = useCallback(async (data: PostFormData): Promise<Post> => {
    try {
      // Optimistic update - create temporary post
      const tempPost: Post = {
        id: `temp-${Date.now()}`,
        alias: data.alias,
        avatar: data.avatar,
        content: data.content,
        timestamp: Date.now(),
        editId: data.editId || 'temp-edit-id'
      };

      // Add to beginning of list (newest first)
      setPosts(prevPosts => [tempPost, ...prevPosts]);

      // Make API call
      const newPost = await apiClient.createPost(data);
      
      // Replace temporary post with real post
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === tempPost.id ? newPost : post
        )
      );

      // Save editId to localStorage for edit button visibility
      if (newPost.editId) {
        const editIds = JSON.parse(localStorage.getItem('postEditIds') || '{}');
        editIds[newPost.id] = newPost.editId;
        localStorage.setItem('postEditIds', JSON.stringify(editIds));
      }

      return newPost;
    } catch (err) {
      // Remove optimistic update on error
      setPosts(prevPosts => prevPosts.filter(post => !post.id.startsWith('temp-')));
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to create post';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Update post with optimistic update
  const updatePost = useCallback(async (
    id: string, 
    editId: string, 
    updates: Partial<Post>
  ): Promise<Post> => {
    try {
      // Find the post to update
      const originalPost = posts.find(post => post.id === id);
      if (!originalPost) {
        throw new Error('Post not found');
      }

      // Optimistic update
      const optimisticPost: Post = {
        ...originalPost,
        ...updates,
        id: originalPost.id, // Never change ID
        timestamp: originalPost.timestamp, // Never change timestamp
        editId: originalPost.editId // Never change editId
      };

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === id ? optimisticPost : post
        )
      );

      // Make API call
      const updatedPost = await apiClient.updatePost(id, editId, updates);
      
      // Replace optimistic update with real response
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === id ? updatedPost : post
        )
      );

      return updatedPost;
    } catch (err) {
      // Revert optimistic update on error
      await fetchPosts();
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to update post';
      setError(errorMessage);
      throw err;
    }
  }, [posts, fetchPosts]);

  // Manual refresh
  const refreshPosts = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    await fetchPosts();
    setIsLoading(false);
  }, [fetchPosts]);

  return {
    posts,
    isLoading,
    error,
    createPost,
    updatePost,
    refreshPosts
  };
}
