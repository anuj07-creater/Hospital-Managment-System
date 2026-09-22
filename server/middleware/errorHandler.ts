import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: number;
  errors?: any;
  keyValue?: any;
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  let error = { ...err };
  error.message = err.message;
  let statusCode = err.statusCode || 500;

  // Log error for debugging
  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err);

  // Mongoose Bad ObjectId / CastError
  if (err.name === 'CastError') {
    const message = `Resource not found with invalid identifier: ${err.value}`;
    statusCode = 400;
    error.message = message;
  }

  // Mongoose Duplicate Key (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate value entered for ${field}. Please use another unique value.`;
    statusCode = 409;
    error.message = message;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map((val: any) => val.message);
    statusCode = 400;
    error.message = messages.join(', ');
  }

  // JWT Token Invalid
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    error.message = 'Invalid authentication token. Please sign in again.';
  }

  // JWT Token Expired
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    error.message = 'Session expired. Please log in again.';
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
