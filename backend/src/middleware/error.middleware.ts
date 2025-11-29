import { Request, Response, NextFunction } from 'express';
import { FEATURES, ERROR_DETAIL_LEVEL } from '../config/constants';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(ERROR_DETAIL_LEVEL.SHOW_STACK && { stack: err.stack }),
    });
  }

  // Log error for debugging
  console.error('Error:', err);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      ...(ERROR_DETAIL_LEVEL.SHOW_VALIDATION && { errors: err.message }),
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access',
    });
  }

  // Database errors
  if (err.name === 'QueryFailedError') {
    return res.status(500).json({
      success: false,
      message: 'Database operation failed',
      ...(ERROR_DETAIL_LEVEL.SHOW_DB_ERRORS && { error: err.message }),
    });
  }

  // Default error response
  return res.status(500).json({
    success: false,
    message: FEATURES.DETAILED_ERRORS ? err.message : 'Internal server error',
    ...(FEATURES.SHOW_STACK_TRACE && { stack: err.stack }),
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
