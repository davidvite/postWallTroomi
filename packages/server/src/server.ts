import app from './app';
import { Post } from '@post-wall/shared';
import { postStore } from './store';
import { generatePostId, generateEditId } from './util/id';

const PORT = process.env.PORT || 4000;

// Initialize default post
const initializeDefaultPost = async () => {
  try {
    // Check if there are any existing posts
    const existingPosts = await postStore.list();
    
    // Only create default post if no posts exist
    if (existingPosts.length === 0) {
      const defaultPost: Post = {
        id: generatePostId(),
        alias: 'MexicanSnowboarder',
        avatar: '🏂',
        content: 'Just hit the slopes! Fresh powder today! 🏔️',
        timestamp: Date.now(),
        editId: generateEditId()
      };
      
      await postStore.set(defaultPost);
      console.log('🏂 Created default post: MexicanSnowboarder');
    } else {
      console.log(`📝 Found ${existingPosts.length} existing posts, skipping default post creation`);
    }
  } catch (error) {
    console.error('Failed to initialize default post:', error);
  }
};

const server = app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api/posts`);
  
  // Initialize default post
  await initializeDefaultPost();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
