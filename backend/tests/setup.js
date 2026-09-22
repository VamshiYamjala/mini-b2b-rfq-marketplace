const pool = require('../src/config/db');

afterAll(async () => {
  try {
    await pool.end();
  } catch (err) {
    // Ignore pool already closed
  }
});
