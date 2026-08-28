/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';

// ============================================================================
// ERROR HANDLER
// ============================================================================

export interface AppError extends Error {
  status?: number;
  details?: Record<string, unknown>;
}

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[${new Date().toISOString()}] Error:`, {
    status,
    message,
    path: req.path,
    method: req.method,
    stack: err.stack,
    details: err.details,
  });

  res.status(status).json({
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path,
    ...(process.env.NODE_ENV === 'development' && { details: err.details, stack: err.stack }),
  });
};

// ============================================================================
// 404 HANDLER
// ============================================================================

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
    message: `Cannot ${req.method} ${req.path}`,
  });
};

// ============================================================================
// ERROR FACTORY FUNCTIONS
// ============================================================================

export const createValidationError = (message: string, details?: any): AppError => {
  const error = new Error(message) as AppError;
  error.status = 400;
  error.details = details;
  return error;
};

export const createDatabaseError = (error: Error | Record<string, unknown>): AppError => {
  const appError = new Error('Database operation failed') as AppError;
  appError.status = 500;
  appError.details = {
    code: error instanceof Error ? (error as any).code : (error as any).code,
    message: error instanceof Error ? error.message : (error as any).message,
  };
  return appError;
};

export const createAuthorizationError = (message: string = 'Access Denied'): AppError => {
  const error = new Error(message) as AppError;
  error.status = 403;
  return error;
};

export const createNotFoundError = (resource: string): AppError => {
  const error = new Error(`${resource} not found`) as AppError;
  error.status = 404;
  return error;
};
