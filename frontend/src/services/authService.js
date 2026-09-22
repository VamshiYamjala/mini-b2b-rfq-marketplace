import api from './api';

const authService = {
  async register(data) {
    const res = await api.post('/api/auth/register', data);
    return res.data;
  },

  async login(credentials) {
    const res = await api.post('/api/auth/login', credentials);
    return res.data;
  },

  async logout() {
    const res = await api.post('/api/auth/logout');
    return res.data;
  },

  async getMe() {
    const res = await api.get('/api/auth/me');
    return res.data;
  }
};

export default authService;
