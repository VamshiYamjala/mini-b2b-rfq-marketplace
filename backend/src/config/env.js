const dotenv = require('dotenv');
const path = require('path');

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const isProd = process.env.NODE_ENV === 'production';

// Parse CORS origin - can be single URL or comma-separated list of origins
const rawCorsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const allowedOrigins = rawCorsOrigin.split(',').map(s => s.trim()).filter(Boolean);

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: isProd,
  corsOrigins: allowedOrigins,
  sessionSecret: process.env.SESSION_SECRET || 'dev-secret-key-please-change-in-production',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'b2b_rfq_db',
    connectionLimit: parseInt(process.env.DB_POOL_LIMIT, 10) || 10,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  }
};
