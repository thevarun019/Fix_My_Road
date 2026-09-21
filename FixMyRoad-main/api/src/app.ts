import express from 'express';
import cors from 'cors';
import { apiRateLimiter } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';
import { ENV } from './config/env';
import helmet from 'helmet';

import { authRouter } from './modules/auth/auth.controller';
import { complaintsRouter } from './modules/complaints/complaints.controller';
import { dashboardRouter } from './modules/dashboard/dashboard.controller';
import { authoritiesRouter } from './modules/authorities/authorities.controller';
import { auditRouter } from './modules/audit/audit.controller';
import { mediaRouter } from './modules/media/media.controller';
import { aiRouter } from './modules/ai/ai.controller';

export const app = express();

// Security & Parsing Middlewares
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://fixmyroad.com'
    ];
    if (ENV.FRONTEND_URL) {
      allowedOrigins.push(ENV.FRONTEND_URL.replace(/\/$/, ''));
    }

    const isAllowed =
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      ENV.NODE_ENV !== 'production';

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(apiRateLimiter);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'fixmyroad-api',
    time: new Date().toISOString()
  });
});

// Modular Routes
app.use('/api/auth', authRouter);
app.use('/api/complaints', complaintsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/authorities', authoritiesRouter);
app.use('/api/audit', auditRouter);
app.use('/api/media', mediaRouter);
app.use('/api/ai', aiRouter);

// Global Error Handler
app.use(errorHandler);
