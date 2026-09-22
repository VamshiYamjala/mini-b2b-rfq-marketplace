const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const healthRoutes = require('./routes/health.routes');

const app = express();

// Trust reverse proxy (for Render / Vercel deployment HTTPS cookie forwarding)
app.set('trust proxy', 1);

// CORS configuration matching specification Section 15
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger for development
if (config.nodeEnv !== 'test') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
  });
}

// Health and monitoring routes
app.use('/api', healthRoutes);

// Catch 404 for unhandled API routes
app.use('/api/*', (req, res, next) => {
  const { NotFoundError } = require('./utils/errors');
  next(new NotFoundError(`API endpoint ${req.originalUrl} not found`));
});

// Centralized error handler (MUST be registered last)
app.use(errorHandler);

module.exports = app;
