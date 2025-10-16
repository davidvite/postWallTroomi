import { z } from 'zod';

// Avatar validation - emoji or image URL (robust emoji support)
const avatarSchema = z
  .string()
  .min(1, 'Avatar is required')
  .transform((s) => s.trim())
  .refine(
    (val) => {
      // Allow image URLs
      const isUrl = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(val);
      if (isUrl) return true;

      // Allow modern emoji sequences (Extended Pictographic + optional Emoji_Modifier + optional ZWJ chains)
      // Examples: 😀, 🧠, 👩‍💻, 👍🏽
      const emojiPattern = /^(?:\p{Extended_Pictographic}(?:\uFE0F|\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\p{Emoji_Modifier})?)*)$/u;
      return emojiPattern.test(val);
    },
    {
      message:
        'Avatar must be an emoji or a valid image URL (jpg, jpeg, png, gif, webp)'
    }
  );

// Edit ID validation - exactly 6 digits
// Accept blank/undefined from clients (treat "" as undefined) and let server generate one
const editIdSchema = z.preprocess(
  (val) => (val === '' || val === null ? undefined : val),
  z.string().regex(/^[0-9]{6}$/,'Edit ID must be exactly 6 digits').optional()
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

// New post request schema (POST /posts)
export const newPostSchema = z.object({
  alias: aliasSchema,
  avatar: avatarSchema,
  content: contentSchema,
  editId: editIdSchema
});

// Update post request schema (PATCH /posts/:id)
export const patchPostSchema = z.object({
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

// Type exports for use in route handlers
export type NewPostRequest = z.infer<typeof newPostSchema>;
export type PatchPostRequest = z.infer<typeof patchPostSchema>;
export type PostIdParam = z.infer<typeof postIdParamSchema>;
