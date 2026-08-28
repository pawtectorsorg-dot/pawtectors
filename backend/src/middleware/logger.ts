/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';

// ============================================================================
// REQUEST LOGGER MIDDLEWARE
// ============================================================================

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = generateRequestId();

  // Store requestId in request object for use in other middleware
  (req as any).requestId = requestId;

  // Log incoming request
  console.log(`[${new Date().toISOString()}] [${requestId}] INCOMING: ${req.method} ${req.path}`);

  // Capture response
  const originalSend = res.send as (data: Record<string, unknown>) => Response;
  res.send = function (data: any) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    console.log(
      `[${new Date().toISOString()}] [${requestId}] RESPONSE: ${req.method} ${req.path} - ${statusCode} (${duration}ms)`
    );

    // Call original send method
    return originalSend.call(this, data);
  };

  next();
};

// ============================================================================
// REQUEST ID GENERATION
// ============================================================================

const generateRequestId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

// ============================================================================
// DATABASE QUERY LOGGER
// ============================================================================

export const logDatabaseQuery = (operation: string, table: string, duration: number, error?: Error | Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  if (error) {
    console.error(`[${timestamp}] [DB] ${operation} on ${table} failed (${duration}ms):`, error);
  } else {
    console.log(`[${timestamp}] [DB] ${operation} on ${table} completed (${duration}ms)`);
  }
};

// ============================================================================
// AUTH LOGGER
// ============================================================================

export const logAuthEvent = (event: string, userId: string, details?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [AUTH] ${event} for user ${userId}`, details);
};

// ============================================================================
// PAYMENT LOGGER
// ============================================================================

export const logPaymentEvent = (event: string, paymentId: string, amount: number, details?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [PAYMENT] ${event} - Payment ID: ${paymentId}, Amount: ${amount}`, details);
};
