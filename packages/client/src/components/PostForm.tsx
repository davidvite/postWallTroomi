import React, { useState, useCallback } from 'react';
import { PostFormData, Post } from '@post-wall/shared';
import { useToast } from '../contexts/ToastContext';
import styles from './PostForm.module.scss';

interface PostFormProps {
  onSubmit: (data: PostFormData) => Promise<Post>;
  isSubmitting: boolean;
}

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

export const PostForm: React.FC<PostFormProps> = ({ onSubmit, isSubmitting }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<PostFormData>({
    alias: '',
    avatar: AVATAR_OPTIONS[0] || '🏂',
    content: '',
    editId: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PostFormData, string>>>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof PostFormData, string>> = {};

    if (!formData.alias.trim()) {
      newErrors.alias = 'Alias is required';
    } else if (formData.alias.length > 50) {
      newErrors.alias = 'Alias must be 50 characters or less';
    } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(formData.alias)) {
      newErrors.alias = 'Alias can only contain letters, numbers, spaces, hyphens, and underscores';
    }

    if (!formData.avatar) {
      newErrors.avatar = 'Avatar is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length > 300) {
      newErrors.content = 'Content must be 300 characters or less';
    }

    if (formData.editId && !/^\d{6}$/.test(formData.editId)) {
      newErrors.editId = 'Edit ID must be exactly 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const newPost = await onSubmit(formData);
      
      // Show success toast with Edit ID
      showToast({
        type: 'success',
        message: `🎉 Post created successfully! Keep this Edit ID: ${newPost.editId} (save it to edit later!)`,
        duration: 7000
      });
      
      // Reset form
      setFormData({
        alias: '',
        avatar: AVATAR_OPTIONS[0] || '🏂',
        content: '',
        editId: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Failed to submit post:', error);
      showToast({
        type: 'error',
        message: '❌ Failed to create post. Please try again.',
        duration: 4000
      });
    }
  }, [formData, onSubmit, validateForm, showToast]);

  const handleInputChange = useCallback((field: keyof PostFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const characterCount = formData.content.length;
  const isOverLimit = characterCount > 300;

  return (
    <form className={styles.postForm} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Create New Post</h2>

      <div className={styles.field}>
        <label htmlFor="alias" className={styles.label}>
          Alias *
        </label>
        <input
          id="alias"
          type="text"
          value={formData.alias}
          onChange={(e) => handleInputChange('alias', e.target.value)}
          className={`${styles.input} ${errors.alias ? styles.error : ''}`}
          placeholder="Enter your alias"
          maxLength={50}
          disabled={isSubmitting}
        />
        {errors.alias && (
          <span className={styles.errorMessage}>{errors.alias}</span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Avatar *</label>
        <div className={styles.avatarGrid}>
          {AVATAR_OPTIONS.map((avatar) => (
            <button
              key={avatar}
              type="button"
              className={`${styles.avatarOption} ${formData.avatar === avatar ? styles.selected : ''}`}
              onClick={() => handleInputChange('avatar', avatar)}
              disabled={isSubmitting}
              aria-label={`Select ${avatar} avatar`}
            >
              {avatar}
            </button>
          ))}
        </div>
        {errors.avatar && (
          <span className={styles.errorMessage}>{errors.avatar}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="content" className={styles.label}>
          Content * ({characterCount}/300)
        </label>
        <textarea
          id="content"
          value={formData.content}
          onChange={(e) => handleInputChange('content', e.target.value)}
          className={`${styles.textarea} ${errors.content || isOverLimit ? styles.error : ''}`}
          placeholder="What's on your mind? (max 300 characters)"
          maxLength={300}
          rows={4}
          disabled={isSubmitting}
        />
        <div className={styles.characterCounter}>
          <span className={isOverLimit ? styles.overLimit : ''}>
            {characterCount}/300
          </span>
        </div>
        {errors.content && (
          <span className={styles.errorMessage}>{errors.content}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="editId" className={styles.label}>
          Edit ID (optional)
        </label>
        <input
          id="editId"
          type="text"
          value={formData.editId}
          onChange={(e) => handleInputChange('editId', e.target.value)}
          className={`${styles.input} ${errors.editId ? styles.error : ''}`}
          placeholder="6-digit edit ID (leave blank to generate)"
          maxLength={6}
          disabled={isSubmitting}
        />
        <small className={styles.helpText}>
          If you don't provide an Edit ID, one will be generated for you.
        </small>
        {errors.editId && (
          <span className={styles.errorMessage}>{errors.editId}</span>
        )}
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={isSubmitting || isOverLimit}
      >
        {isSubmitting ? 'Posting...' : 'Post Message'}
      </button>
    </form>
  );
};
