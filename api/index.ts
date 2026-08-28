/**
 * Vercel Serverless Function entry point.
 * Re-exports the Express app so all /api/* and /auth/* routes work on Vercel.
 * 
 * The backend server.ts detects VERCEL=1 (set by Vercel automatically)
 * and skips app.listen(), letting Vercel handle request routing.
 */

// @ts-nocheck — backend uses different @types/express version
import app from '../backend/src/server.js';

export default app;
