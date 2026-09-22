const dotenv = require('dotenv');
const path = require('path');

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredEnv = [
  'PORT',
  'NODE_ENV',
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_NAME',
  'SESSION_SECRET'
];

const missingEnv = requiredEnv.filter(envVar => !process.env[envVar] && process.env[envVar] !== '');

if (missingEnv.length > 0 && process.env.NODE_ENV === 'production') {
  console.warn(`[WARN] Missing environment variables: ${missingEnv.join(', ')}`);
}

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  sessionSecret: process.env.SESSION_SECRET || 'dev-secret-key-please-change-in-production',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'b2b_rfq_db',
    connectionLimit: parseInt(process.env.DB_POOL_LIMIT, 10) || 10
  }
};
