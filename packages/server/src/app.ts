import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import postRoutes from './routes/posts';
import { errorHandler, requestLogger } from './middleware/error';

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// API routes
app.use('/api/posts', postRoutes);

// Error handling (must be last)
app.use(errorHandler);

export default app;
