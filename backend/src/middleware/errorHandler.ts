import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  if (typeof err === 'object' && err !== null && 'status' in err && 'message' in err) {
    const error = err as { status?: number; message?: string };
    res.status(error.status || 500).json({
      error: error.message,
    });
  } else {
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    error: 'Not found',
  });
};
