// Vercel serverless function for posts API

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

// Helper function to generate post ID
function generatePostId() {
  return Math.random().toString(36).substr(2, 9);
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
    switch (req.method) {
      case 'GET':
        // GET /api/posts - Retrieve all posts (newest first)
        const sortedPosts = [...posts].sort((a, b) => b.timestamp - a.timestamp);
        res.status(200).json({
          success: true,
          data: sortedPosts
        });
        break;

      case 'POST':
        // POST /api/posts - Create new post
        const { alias, avatar, content, editId } = req.body;

        // Validate input
        const aliasValidation = validateAlias(alias);
        if (!aliasValidation.valid) {
          res.status(400).json({
            success: false,
            error: aliasValidation.error
          });
          return;
        }

        const contentValidation = validateContent(content);
        if (!contentValidation.valid) {
          res.status(400).json({
            success: false,
            error: contentValidation.error
          });
          return;
        }

        const avatarValidation = validateAvatar(avatar);
        if (!avatarValidation.valid) {
          res.status(400).json({
            success: false,
            error: avatarValidation.error
          });
          return;
        }

        // Create new post
        const newPost = {
          id: generatePostId(),
          alias: alias.trim(),
          avatar,
          content: content.trim(),
          timestamp: Date.now(),
          editId: editId || generateEditId()
        };

        posts.push(newPost);
        postIds.push(newPost.id);

        res.status(201).json({
          success: true,
          data: newPost
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
