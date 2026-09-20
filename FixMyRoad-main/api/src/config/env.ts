import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'roadwatch_jwt_secret_dev_2026',
  MSG91_AUTH_KEY: process.env.MSG91_AUTH_KEY || 'dummy_auth_key',
  MSG91_SENDER_ID: process.env.MSG91_SENDER_ID || 'RODWCH',
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8001',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || ''
};
