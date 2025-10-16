import { Router, Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Post, ApiResponse } from '@post-wall/shared';
import { postStore } from '../store';
import { generatePostId, generateEditId } from '../util/id';
import { newPostSchema, patchPostSchema, postIdParamSchema, NewPostRequest, PatchPostRequest, PostIdParam } from '../util/validation';
import { ValidationError, UnauthorizedError, NotFoundError } from '../middleware/error';

const router: Router = Router();

// GET /posts - Retrieve all posts (newest first)
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const posts = await postStore.list();
    const response: ApiResponse<Post[]> = {
      success: true,
      data: posts
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// POST /posts - Create new post
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Validate request body
    const validatedData = newPostSchema.parse(req.body) as NewPostRequest;
    
    // Create post object
    const post: Post = {
      id: generatePostId(),
      alias: validatedData.alias,
      avatar: validatedData.avatar,
      content: validatedData.content,
      timestamp: Date.now(),
      editId: validatedData.editId || generateEditId()
    };

    // Save post
    const savedPost = await postStore.set(post);
    
    const response: ApiResponse<Post> = {
      success: true,
      data: savedPost
    };
    
    res.status(201).json(response);
  } catch (error) {
    if (error instanceof ZodError || error instanceof ValidationError) {
      next(error);
    } else {
      next(new ValidationError('Failed to create post'));
    }
  }
});

// PATCH /posts/:id - Update post
router.patch('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Validate path parameter
    const { id } = postIdParamSchema.parse(req.params) as PostIdParam;
    
    // Validate request body
    const { editId, updates } = patchPostSchema.parse(req.body) as PatchPostRequest;
    
    // Get existing post
    const existingPost = await postStore.get(id);
    if (!existingPost) {
      throw new NotFoundError('Post not found');
    }
    
    // Verify edit ID
    if (existingPost.editId !== editId) {
      throw new UnauthorizedError('Invalid edit ID');
    }
    
    // Create updated post
    const updatedPost: Post = {
      ...existingPost,
      ...updates,
      id: existingPost.id, // Never change the ID
      timestamp: existingPost.timestamp, // Never change the timestamp
      editId: existingPost.editId // Never change the edit ID
    } as Post;
    
    // Save updated post
    const savedPost = await postStore.update(id, updatedPost);
    
    const response: ApiResponse<Post> = {
      success: true,
      data: savedPost
    };
    
    res.json(response);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof UnauthorizedError || error instanceof NotFoundError) {
      next(error);
    } else {
      next(new ValidationError('Failed to update post'));
    }
  }
});

export default router;
