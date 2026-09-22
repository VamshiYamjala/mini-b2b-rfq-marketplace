import api from './api';

const quotationService = {
  async submitQuotation(rfqId, data) {
    const res = await api.post(`/api/rfqs/${rfqId}/quotations`, data);
    return res.data;
  },

  async getMyQuotations() {
    const res = await api.get('/api/quotations/my');
    return res.data;
  },

  async getRfqQuotations(rfqId) {
    const res = await api.get(`/api/rfqs/${rfqId}/quotations`);
    return res.data;
  }
};

export default quotationService;
