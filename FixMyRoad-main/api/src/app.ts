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
  origin: ENV.NODE_ENV === 'production' ? 'https://fixmyroad.com' : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
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
