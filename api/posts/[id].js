// Vercel serverless function for individual post operations

// In-memory store for posts (in production, you'd use a database)
let posts = [];
let postIds = [];

// Initialize with default post if empty
if (posts.length === 0) {
  const defaultPost = {
    id: 'default-' + Math.random().toString(36).substr(2, 9),
    alias: 'MexicanSnowboarder',
    avatar: '🏂',
    content: 'Just hit the slopes! Fresh powder today! 🏔️',
    timestamp: Date.now(),
    editId: Math.floor(100000 + Math.random() * 900000).toString()
  };
  posts.push(defaultPost);
  postIds.push(defaultPost.id);
}

// Helper function to generate 6-digit edit ID
function generateEditId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Validation functions
function validateAlias(alias) {
  if (!alias || typeof alias !== 'string' || alias.trim().length === 0) {
    return { valid: false, error: 'Alias is required' };
  }
  if (alias.length > 50) {
    return { valid: false, error: 'Alias must be 50 characters or less' };
  }
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(alias)) {
    return { valid: false, error: 'Alias can only contain letters, numbers, spaces, hyphens, and underscores' };
  }
  return { valid: true };
}

function validateContent(content) {
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return { valid: false, error: 'Content is required' };
  }
  if (content.length > 300) {
    return { valid: false, error: 'Content must be 300 characters or less' };
  }
  return { valid: true };
}

function validateAvatar(avatar) {
  if (!avatar || typeof avatar !== 'string') {
    return { valid: false, error: 'Avatar is required' };
  }
  // Allow emojis and basic image URLs
  const emojiRegex = /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]$/u;
  const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
  
  if (!emojiRegex.test(avatar) && !urlRegex.test(avatar)) {
    return { valid: false, error: 'Avatar must be an emoji or a valid image URL' };
  }
  return { valid: true };
}

function validateEditId(editId) {
  if (!editId || typeof editId !== 'string') {
    return { valid: false, error: 'Edit ID is required' };
  }
  if (!/^\d{6}$/.test(editId)) {
    return { valid: false, error: 'Edit ID must be exactly 6 digits' };
  }
  return { valid: true };
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).json({});
    return;
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    const { id } = req.query;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Post ID is required'
      });
      return;
    }

    // Find the post
    const postIndex = posts.findIndex(post => post.id === id);
    if (postIndex === -1) {
      res.status(404).json({
        success: false,
        error: 'Post not found'
      });
      return;
    }

    const post = posts[postIndex];

    switch (req.method) {
      case 'GET':
        // GET /api/posts/[id] - Get specific post
        res.status(200).json({
          success: true,
          data: post
        });
        break;

      case 'PATCH':
        // PATCH /api/posts/[id] - Update post
        const { editId, updates } = req.body;

        // Validate edit ID
        const editIdValidation = validateEditId(editId);
        if (!editIdValidation.valid) {
          res.status(400).json({
            success: false,
            error: editIdValidation.error
          });
          return;
        }

        // Check if edit ID matches
        if (post.editId !== editId) {
          res.status(403).json({
            success: false,
            error: 'Invalid edit ID'
          });
          return;
        }

        // Validate updates
        if (updates.alias !== undefined) {
          const aliasValidation = validateAlias(updates.alias);
          if (!aliasValidation.valid) {
            res.status(400).json({
              success: false,
              error: aliasValidation.error
            });
            return;
          }
        }

        if (updates.content !== undefined) {
          const contentValidation = validateContent(updates.content);
          if (!contentValidation.valid) {
            res.status(400).json({
              success: false,
              error: contentValidation.error
            });
            return;
          }
        }

        if (updates.avatar !== undefined) {
          const avatarValidation = validateAvatar(updates.avatar);
          if (!avatarValidation.valid) {
            res.status(400).json({
              success: false,
              error: avatarValidation.error
            });
            return;
          }
        }

        // Update the post
        const updatedPost = {
          ...post,
          ...updates,
          alias: updates.alias ? updates.alias.trim() : post.alias,
          content: updates.content ? updates.content.trim() : post.content,
          timestamp: Date.now() // Update timestamp on edit
        };

        posts[postIndex] = updatedPost;

        res.status(200).json({
          success: true,
          data: updatedPost
        });
        break;

      default:
        res.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
