import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// Custom error types
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

// Minimal error handler
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  let statusCode = 500;
  let message = 'Internal server error';
  let field: string | undefined;

  if (error instanceof ValidationError) {
    statusCode = 400;
    message = error.message;
    field = error.field;
  } else if (error instanceof UnauthorizedError) {
    statusCode = 403;
    message = error.message;
  } else if (error instanceof NotFoundError) {
    statusCode = 404;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    const firstError = error.errors[0];
    if (firstError) {
      message = firstError.message;
      field = firstError.path.join('.');
    }
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(field && { field })
  });
};

// Request logger middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};
