const app = require('./app');
const config = require('./config/env');
const pool = require('./config/db');

const server = app.listen(config.port, async () => {
  console.log(`[SERVER] Mini B2B RFQ Marketplace backend listening on port ${config.port} (${config.nodeEnv})`);
  try {
    const [rows] = await pool.query('SELECT 1');
    console.log('[SERVER] Database connection pool verified successfully.');
  } catch (err) {
    console.error('[SERVER] Database connection pool verification failed:', err.message);
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SERVER] SIGTERM received. Shutting down gracefully...');
  server.close(async () => {
    await pool.end();
    console.log('[SERVER] Process terminated.');
  });
});

module.exports = server;
