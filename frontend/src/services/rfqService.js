import api from './api';

const rfqService = {
  async createRfq(data) {
    const res = await api.post('/api/rfqs', data);
    return res.data;
  },

  async getMyRfqs(status) {
    const params = status ? { status } : {};
    const res = await api.get('/api/rfqs/my', { params });
    return res.data;
  },

  async getPublicRfqs(params = {}) {
    const res = await api.get('/api/rfqs', { params });
    return res.data;
  },

  async getRfqById(id) {
    const res = await api.get(`/api/rfqs/${id}`);
    return res.data;
  },

  async updateRfq(id, data) {
    const res = await api.put(`/api/rfqs/${id}`, data);
    return res.data;
  },

  async closeRfq(id) {
    const res = await api.patch(`/api/rfqs/${id}/close`);
    return res.data;
  }
};

export default rfqService;
