import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import reviewRoutes from './routes/review.routes.js';

import errorHandler from './middleware/errorHandler.js';

const app = express();

// Security middleware
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true
  })
);

// Body parsing middleware
app.use(express.json({ limit: '110kb' }));

app.use(
  express.urlencoded({
    extended: false,
    limit: '110kb'
  })
);

app.use(cookieParser());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'code-review-api'
  });
});

// Authentication routes
app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false
  }),
  authRoutes
);

// Project routes
app.use('/api/projects', projectRoutes);

// Review routes
app.use(
  '/api/reviews',
  rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false
  }),
  reviewRoutes
);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use(errorHandler);

export default app;