import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Post } from '@post-wall/shared';
import { useToast } from '../contexts/ToastContext';
import styles from './EditModal.module.scss';

const AVATAR_OPTIONS = [
  // Snowsports & Winter Activities
  '⛷️', // skier
  '🏂', // snowboarder
  '🛷', // sled
  '🥌', // curling stone
  '⛸️', // ice skate
  '🎿', // skis
  '🏔️', // snow-capped mountain
  '❄️', // snowflake
  '🌨️', // snow cloud
  '🧊', // ice cube
  
  // Water Sports
  '🏄‍♀️', // woman surfing
  '🏄‍♂️', // man surfing
  '🏊‍♀️', // woman swimming
  '🏊‍♂️', // man swimming
  '🚣‍♀️', // woman rowing boat
  '🚣‍♂️', // man rowing boat
  '🛶', // canoe
  '🏄', // surfer
  '🏊', // swimmer
  '🚣', // rowboat
  
  // Adventure & Outdoor
  '🧗‍♀️', // woman climbing
  '🧗‍♂️', // man climbing
  '🚵‍♀️', // woman mountain biking
  '🚵‍♂️', // man mountain biking
  '🚴‍♀️', // woman biking
  '🚴‍♂️', // man biking
  '🏃‍♀️', // woman running
  '🏃‍♂️', // man running
  '🥾', // hiking boot
  '🏕️', // camping
  
  // Equipment & Tools
  '🧭', // compass
  '🗺️', // map
  '⛺', // tent
  '🏹', // bow and arrow (archery)
  '🥋', // martial arts uniform
  '🧘‍♀️', // woman in lotus position
  '🧘‍♂️' // man in lotus position
];

interface EditModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, editId: string, updates: Partial<Post>) => Promise<void>;
}

export const EditModal: React.FC<EditModalProps> = ({ post, isOpen, onClose, onSave }) => {
  const { showToast } = useToast();
  const [editId, setEditId] = useState('');
  const [updates, setUpdates] = useState<Partial<Post>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens/closes or post changes
  useEffect(() => {
    if (isOpen && post) {
      setEditId('');
      setUpdates({
        alias: post.alias,
        avatar: post.avatar,
        content: post.content
      });
      setError(null);
    }
  }, [isOpen, post]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Focus first input after modal opens
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle click outside modal
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!post) return;

    if (!editId.trim()) {
      setError('Edit ID is required');
      return;
    }

    if (!/^\d{6}$/.test(editId)) {
      setError('Edit ID must be exactly 6 digits');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSave(post.id, editId, updates);
      
      // Show success toast
      showToast({
        type: 'success',
        message: '✨ Post updated successfully!',
        duration: 3000
      });
      
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update post';
      setError(errorMessage);
      
      // Show error toast
      showToast({
        type: 'error',
        message: `❌ ${errorMessage}`,
        duration: 4000
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [post, editId, updates, onSave, onClose, showToast]);

  const handleInputChange = useCallback((field: keyof Post, value: string) => {
    setUpdates(prev => ({ ...prev, [field]: value }));
    setError(null);
  }, []);

  const characterCount = updates.content?.length || 0;
  const isOverLimit = characterCount > 300;

  if (!isOpen || !post) {
    return null;
  }

  return (
    <div className={styles.modal} onClick={handleBackdropClick}>
      <div className={styles.modalContent} ref={modalRef}>
        <header className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Edit Post</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit} className={styles.editForm}>
          <div className={styles.field}>
            <label htmlFor="editId" className={styles.label}>
              Edit ID *
            </label>
            <input
              ref={firstInputRef}
              id="editId"
              type="text"
              value={editId}
              onChange={(e) => setEditId(e.target.value)}
              className={`${styles.input} ${error ? styles.error : ''}`}
              placeholder="Enter your 6-digit Edit ID"
              maxLength={6}
              disabled={isSubmitting}
            />
            <small className={styles.helpText}>
              You need the Edit ID to modify this post.
            </small>
          </div>

          <div className={styles.field}>
            <label htmlFor="editAlias" className={styles.label}>
              Alias
            </label>
            <input
              id="editAlias"
              type="text"
              value={updates.alias || ''}
              onChange={(e) => handleInputChange('alias', e.target.value)}
              className={styles.input}
              placeholder="Enter your alias"
              maxLength={50}
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Avatar</label>
            <div className={styles.avatarGrid}>
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  className={`${styles.avatarOption} ${updates.avatar === avatar ? styles.selected : ''}`}
                  onClick={() => handleInputChange('avatar', avatar)}
                  disabled={isSubmitting}
                  aria-label={`Select ${avatar} avatar`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="editContent" className={styles.label}>
              Content ({characterCount}/300)
            </label>
            <textarea
              id="editContent"
              value={updates.content || ''}
              onChange={(e) => handleInputChange('content', e.target.value)}
              className={`${styles.textarea} ${isOverLimit ? styles.error : ''}`}
              placeholder="What's on your mind?"
              maxLength={300}
              rows={4}
              disabled={isSubmitting}
            />
            <div className={styles.characterCounter}>
              <span className={isOverLimit ? styles.overLimit : ''}>
                {characterCount}/300
              </span>
            </div>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isSubmitting || isOverLimit}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
