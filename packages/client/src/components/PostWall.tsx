import React, { useState, useCallback } from 'react';
import { Post, PostFormData } from '../types';
import { usePosts } from '../hooks/usePosts';
import { PostCard } from './PostCard';
import { PostForm } from './PostForm';
import { EditModal } from './EditModal';
import styles from './PostWall.module.scss';

export const PostWall: React.FC = () => {
  const { posts, isLoading, error, createPost, updatePost, refreshPosts } = usePosts();
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user can edit a post based on localStorage
  const canEditPost = useCallback((post: Post): boolean => {
    const editIds = JSON.parse(localStorage.getItem('postEditIds') || '{}');
    return editIds[post.id] === post.editId;
  }, []);

  const handleCreatePost = useCallback(async (data: PostFormData) => {
    setIsSubmitting(true);
    try {
      const newPost = await createPost(data);
      // Success notification is now handled by the PostForm component via toast
      return newPost;
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [createPost]);

  const handleEditPost = useCallback((post: Post) => {
    setEditingPost(post);
  }, []);

  const handleSaveEdit = useCallback(async (
    id: string, 
    editId: string, 
    updates: Partial<Post>
  ) => {
    await updatePost(id, editId, updates);
    setEditingPost(null);
  }, [updatePost]);

  const handleCloseEdit = useCallback(() => {
    setEditingPost(null);
  }, []);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h2>Error Loading Posts</h2>
        <p>{error}</p>
        <button onClick={refreshPosts} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.postWall}>
      <header className={styles.header}>
        <h1 className={styles.title}>Social Posting Wall</h1>
        <p className={styles.subtitle}>
          Share your thoughts with the community! Posts are sorted by newest first.
        </p>
      </header>

      <main className={styles.main}>
        <section className={styles.postFormSection}>
          <PostForm 
            onSubmit={handleCreatePost} 
            isSubmitting={isSubmitting}
          />
        </section>

        <section className={styles.postsSection}>
          <div className={styles.postsHeader}>
            <h2 className={styles.postsTitle}>
              Recent Posts ({posts.length})
            </h2>
            <button 
              onClick={refreshPosts}
              className={styles.refreshButton}
              title="Refresh posts"
            >
              🔄
            </button>
          </div>

          {posts.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No posts yet. Be the first to share something!</p>
            </div>
          ) : (
            <div className={styles.postsList}>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  canEdit={canEditPost(post)}
                  onEdit={handleEditPost}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <EditModal
        post={editingPost}
        isOpen={editingPost !== null}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
      />
    </div>
  );
};
