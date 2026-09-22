const bcrypt = require('bcryptjs');
const UserModel = require('../models/user.model');
const { ConflictError, UnauthorizedError, NotFoundError } = require('../utils/errors');

const BCRYPT_SALT_ROUNDS = 10;

const AuthService = {
  async register({ name, email, password, role }) {
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const user = await UserModel.create({
      name,
      email,
      passwordHash,
      role
    });

    return user;
  },

  async login({ email, password }) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      // Intentionally generic error message to prevent account enumeration
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    };
  },

  async getCurrentUser(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }
};

module.exports = AuthService;
