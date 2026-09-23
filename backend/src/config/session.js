const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const pool = require('./db');
const config = require('./env');

const sessionStore = new MySQLStore({
  clearExpired: true,
  checkExpirationInterval: 15 * 60 * 1000, // 15 minutes
  expiration: 7 * 24 * 60 * 60 * 1000,     // 7 days
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
}, pool);

const sessionMiddleware = session({
  key: 'marketplace_sid',
  secret: config.sessionSecret,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  proxy: config.isProduction, // trust the reverse proxy for cookie handling
  cookie: {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
});

module.exports = sessionMiddleware;
