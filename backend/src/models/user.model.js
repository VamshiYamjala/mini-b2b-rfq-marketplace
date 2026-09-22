const pool = require('../config/db');

const UserModel = {
  async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT id, name, email, password_hash, role, created_at, updated_at FROM users WHERE email = ? LIMIT 1',
      [email.toLowerCase().trim()]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, email, passwordHash, role }) {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), passwordHash, role]
    );
    return {
      id: result.insertId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role
    };
  }
};

module.exports = UserModel;
