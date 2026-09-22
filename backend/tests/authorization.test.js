const request = require('supertest');
const app = require('../src/app');

describe('Authorization Matrix API (§16.4)', () => {
  let buyerAgent;
  let buyer2Agent;
  let supplierAgent;
  let supplier2Agent;
  let buyerRfqId;

  beforeAll(async () => {
    buyerAgent = request.agent(app);
    await buyerAgent.post('/api/auth/register').send({
      name: 'Matrix Buyer 1',
      email: `matrix_b1_${Date.now()}@test.com`,
      password: 'Password123',
      role: 'BUYER'
    });

    buyer2Agent = request.agent(app);
    await buyer2Agent.post('/api/auth/register').send({
      name: 'Matrix Buyer 2',
      email: `matrix_b2_${Date.now()}@test.com`,
      password: 'Password123',
      role: 'BUYER'
    });

    supplierAgent = request.agent(app);
    await supplierAgent.post('/api/auth/register').send({
      name: 'Matrix Supplier 1',
      email: `matrix_s1_${Date.now()}@test.com`,
      password: 'Password123',
      role: 'SUPPLIER'
    });

    supplier2Agent = request.agent(app);
    await supplier2Agent.post('/api/auth/register').send({
      name: 'Matrix Supplier 2',
      email: `matrix_s2_${Date.now()}@test.com`,
      password: 'Password123',
      role: 'SUPPLIER'
    });

    // Create RFQ
    const future = new Date(Date.now() + 10 * 86400000).toISOString();
    const rfqRes = await buyerAgent.post('/api/rfqs').send({
      product_service_name: 'Matrix Industrial Motors',
      requirement_description: '3 Phase 480V 50HP Induction Motors NEMA Premium.',
      quantity: 10,
      delivery_location: 'Milwaukee, WI',
      deadline: future
    });
    buyerRfqId = rfqRes.body.data.id;

    // Supplier 1 submits quote
    await supplierAgent.post(`/api/rfqs/${buyerRfqId}/quotations`).send({
      quoted_price: 18000,
      estimated_delivery_time: '2 weeks'
    });
  });

  it('Buyer cannot view another buyers quotations (403)', async () => {
    const res = await buyer2Agent.get(`/api/rfqs/${buyerRfqId}/quotations`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('Supplier cannot view another suppliers quotation / RFQ quotation list (403)', async () => {
    const res = await supplier2Agent.get(`/api/rfqs/${buyerRfqId}/quotations`);
    expect(res.status).toBe(403);
  });

  it('Supplier cannot access buyer-only routes (403 on /api/rfqs/my)', async () => {
    const res = await supplierAgent.get('/api/rfqs/my');
    expect(res.status).toBe(403);
  });

  it('Buyer cannot access supplier-only routes (403 on /api/quotations/my)', async () => {
    const res = await buyerAgent.get('/api/quotations/my');
    expect(res.status).toBe(403);
  });

  it('Unauthenticated requests are rejected with 401 across all protected endpoints', async () => {
    const endpoints = [
      { method: 'get', url: '/api/auth/me' },
      { method: 'post', url: '/api/auth/logout' },
      { method: 'post', url: '/api/rfqs' },
      { method: 'get', url: '/api/rfqs/my' },
      { method: 'get', url: `/api/rfqs/${buyerRfqId}` },
      { method: 'put', url: `/api/rfqs/${buyerRfqId}` },
      { method: 'patch', url: `/api/rfqs/${buyerRfqId}/close` },
      { method: 'get', url: '/api/rfqs' },
      { method: 'post', url: `/api/rfqs/${buyerRfqId}/quotations` },
      { method: 'get', url: `/api/rfqs/${buyerRfqId}/quotations` },
      { method: 'get', url: '/api/quotations/my' }
    ];

    for (const ep of endpoints) {
      const res = await request(app)[ep.method](ep.url);
      expect(res.status).toBe(401);
    }
  });
});
