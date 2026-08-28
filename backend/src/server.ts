import express, { Application } from 'express';
import cors from 'cors';
// cookie-parser removed — no longer using session cookies
import 'express-async-errors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import type { SupabaseClient } from '@supabase/supabase-js';

import apiRoutes from './routes/apiRoutes.js';
import authRoutes from './routes/authRoutes.js';
import seedRoutes from './routes/seedRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandling.js';
import { requestLogger } from './middleware/logger.js';
import { supabaseAdmin as supabase, isUsingMock } from './config/supabase.js';

const typedSupabase = supabase as SupabaseClient;

// Resolve .env relative to this file's directory (backend/src/) → project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app: Application = express();

// In production (Render), backend is the only process — serve frontend + API on platform PORT.
// In local dev, Vite gets PORT 10000, backend uses BACKEND_PORT (3001).
const isProduction = process.env.NODE_ENV === 'production';
const PORT = isProduction
  ? process.env.PORT || 10000
  : process.env.BACKEND_PORT || 3001;
let dbConnected = true; // Track database connection status

// ============================================================================
// SUPABASE CONNECTION TEST
// ============================================================================

async function testSupabaseConnection(): Promise<boolean> {
  try {
    if (isUsingMock) {
      console.log('⚠️  Using mock database (development mode)');
      dbConnected = false;
      return false;
    }

    const { error } = await typedSupabase
      .from('products')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      console.log('⚠️  Switching to mock database mode for development');
      dbConnected = false;
      return false;
    }

    console.log('✅ Supabase connection established successfully');
    console.log(`📊 Database accessible - Tables status: OK`);
    dbConnected = true;
    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Supabase connection error:', message);
    console.log('⚠️  Switching to mock database mode for development');
    dbConnected = false;
    return false;
  }
}

// ============================================================================
// GLOBAL MIDDLEWARE
// ============================================================================

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:10000',
  'http://localhost:3001',
  'http://localhost:10000',
  'https://pawtectors.in',
  'https://pawtectors.onrender.com',
  'https://pawtectors.vercel.app',
];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Requested-With', 'X-User-Id', 'X-User-Email'],
  })
);

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// No cookie parsing needed — auth is header-based

// Request Logging
app.use(requestLogger);

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

app.get('/health', async (_req, res) => {
  try {
    const dbHealthCheck = await typedSupabase
      .from('products')
      .select('count', { count: 'exact', head: true });

    const isConnected = !dbHealthCheck.error;

    res.status(isConnected ? 200 : 503).json({
      status: isConnected ? 'OK' : 'Service Unavailable',
      timestamp: new Date().toISOString(),
      database: isConnected ? 'Connected' : 'Disconnected',
      supabase: isConnected ? '✅ Active' : '❌ Inactive',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    res.status(503).json({
      status: 'Service Unavailable',
      timestamp: new Date().toISOString(),
      database: 'Disconnected',
      supabase: '❌ Inactive',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// API INFO ENDPOINT
// ============================================================================

app.get('/api', (_req, res) => {
  res.json({
    name: 'Pawtectors API',
    version: '1.0.0',
    description: 'Complete backend API for Pawtectors pet services platform',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        signup: 'POST /api/auth/signup',
        logout: 'POST /api/auth/logout',
      },
      users: {
        profile: 'GET /api/user/profile',
        updateProfile: 'PUT /api/user/profile',
        roles: 'GET /api/user/roles',
      },
      providers: {
        list: 'GET /api/providers',
        create: 'POST /api/providers',
        get: 'GET /api/providers/:id',
        update: 'PUT /api/providers/:id',
        delete: 'DELETE /api/providers/:id',
      },
      bookings: {
        list: 'GET /api/bookings',
        create: 'POST /api/bookings',
        get: 'GET /api/bookings/:id',
        update: 'PUT /api/bookings/:id',
        cancel: 'POST /api/bookings/:id/cancel',
      },
      products: {
        list: 'GET /api/products',
        create: 'POST /api/products',
        get: 'GET /api/products/:id',
        update: 'PUT /api/products/:id',
        delete: 'DELETE /api/products/:id',
      },
      orders: {
        list: 'GET /api/orders',
        create: 'POST /api/orders',
        get: 'GET /api/orders/:id',
        update: 'PUT /api/orders/:id',
        addItem: 'POST /api/orders/:orderId/items',
      },
      reviews: {
        list: 'GET /api/reviews',
        create: 'POST /api/reviews',
        update: 'PUT /api/reviews/:id',
        delete: 'DELETE /api/reviews/:id',
      },
      payments: {
        list: 'GET /api/payments',
        create: 'POST /api/payments',
        verify: 'POST /api/payments/verify',
      },
      ngos: {
        list: 'GET /api/ngos',
        create: 'POST /api/ngos',
        get: 'GET /api/ngos/:id',
        update: 'PUT /api/ngos/:id',
        animals: 'GET /api/ngos/:id/animals',
        addAnimal: 'POST /api/ngos/:id/animals',
        adoptions: 'POST /api/ngos/:id/adoptions',
        donations: 'POST /api/ngos/:id/donations',
      },
      notifications: {
        list: 'GET /api/notifications',
        markAsRead: 'POST /api/notifications/:id/read',
      },
    },
    database: 'Supabase PostgreSQL',
    authentication: 'Supabase Auth (JWT)',
  });
});

// ============================================================================
// API ROUTES
// ============================================================================

app.use('/auth', authRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', apiRoutes);

// ============================================================================
// STATIC FILE SERVING (Production)
// ============================================================================

const distPath = path.resolve(__dirname, '../../dist');
const hasBuiltFrontend = fs.existsSync(path.join(distPath, 'index.html'));

if (hasBuiltFrontend) {
  console.log('📦 Serving frontend static files from:', distPath);
  app.use(express.static(distPath));

  // SPA catch-all: serve index.html for any non-API/auth route
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/auth')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.json({
      name: 'Pawtectors API Server',
      status: 'online',
      message: 'Vite frontend dev server is running on http://localhost:10001',
      apiDoc: '/api'
    });
  });
  app.use(notFoundHandler);
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use(errorHandler);

// ============================================================================
// SERVER STARTUP
// ============================================================================

function tryListen(port: number | string, retries = 3): void {
  const server = app.listen(port, () => {
    console.log(`\n================================================`);
    console.log(`🐾 PAWTECTORS BACKEND SERVER`);
    console.log(`================================================`);
    console.log(`✅ Server is running on http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api`);
    console.log(`🏥 Health Check: http://localhost:${port}/health`);
    console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Database: ${dbConnected ? 'Connected ✅' : 'Mock Database (Dev Mode) 🧪'}`);
    console.log(`🌐 Static Files: ${hasBuiltFrontend ? 'Serving from dist/ ✅' : 'Not built (dev mode) ⚠️'}`);
    console.log(`================================================\n`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE' && retries > 0) {
      const nextPort = Number(port) + 1;
      console.warn(`⚠️  Port ${port} is in use, trying ${nextPort}...`);
      server.close();
      tryListen(nextPort, retries - 1);
    } else {
      console.error('❌ Failed to start server:', err);
      process.exit(1);
    }
  });
}

async function startServer() {
  try {
    // Test database connection
    await testSupabaseConnection();

    // Start listening (with auto-retry on port conflict)
    tryListen(PORT);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start server only when run directly (not imported by Vercel serverless)
const isVercel = process.env.VERCEL === '1';
if (!isVercel) {
  startServer();
}

export default app;
