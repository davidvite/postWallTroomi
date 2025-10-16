import { z } from 'zod';

// Avatar validation - emoji or image URL
const avatarSchema = z.string().min(1, 'Avatar is required').refine(
  (val) => {
    // Check if it's an emoji (single character) or valid URL
    const isEmoji = /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]$/u.test(val);
    const isUrl = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(val);
    return isEmoji || isUrl;
  },
  {
    message: 'Avatar must be an emoji or a valid image URL (jpg, jpeg, png, gif, webp)'
  }
);

// Edit ID validation - exactly 6 digits
const editIdSchema = z.string().regex(
  /^\d{6}$/,
  'Edit ID must be exactly 6 digits'
);

// Post content validation
const contentSchema = z.string()
  .min(1, 'Content is required')
  .max(300, 'Content must be 300 characters or less')
  .trim();

// Alias validation
const aliasSchema = z.string()
  .min(1, 'Alias is required')
  .max(50, 'Alias must be 50 characters or less')
  .trim()
  .regex(
    /^[a-zA-Z0-9\s\-_]+$/,
    'Alias can only contain letters, numbers, spaces, hyphens, and underscores'
  );

// Post ID validation
const postIdSchema = z.string()
  .min(1, 'Post ID is required')
  .regex(
    /^[a-zA-Z0-9]+$/,
    'Post ID must contain only alphanumeric characters'
  );

// Create post request schema
export const createPostSchema = z.object({
  alias: aliasSchema,
  avatar: avatarSchema,
  content: contentSchema,
  editId: editIdSchema.optional()
});

// Update post request schema
export const updatePostSchema = z.object({
  editId: editIdSchema,
  updates: z.object({
    alias: aliasSchema.optional(),
    avatar: avatarSchema.optional(),
    content: contentSchema.optional()
  }).refine(
    (data) => Object.keys(data).length > 0,
    'At least one field must be provided for update'
  )
});

// Post ID parameter schema
export const postIdParamSchema = z.object({
  id: postIdSchema
});
