import React from 'react';
import { Post } from '@post-wall/shared';
import { formatRelativeTime } from '../utils/relativeTime';
import styles from './PostCard.module.scss';

interface PostCardProps {
  post: Post;
  canEdit: boolean;
  onEdit: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, canEdit, onEdit }) => {
  const handleEditClick = () => {
    onEdit(post);
  };

  return (
    <article className={styles.postCard}>
      <header className={styles.postHeader}>
        <div className={styles.avatar}>
          {post.avatar}
        </div>
        <div className={styles.postInfo}>
          <h3 className={styles.alias}>{post.alias}</h3>
          <time className={styles.timestamp} dateTime={new Date(post.timestamp).toISOString()}>
            {formatRelativeTime(post.timestamp)}
          </time>
        </div>
        {canEdit && (
          <button
            className={styles.editButton}
            onClick={handleEditClick}
            aria-label={`Edit post by ${post.alias}`}
          >
            Edit
          </button>
        )}
      </header>
      <div className={styles.content}>
        {post.content}
      </div>
    </article>
  );
};
