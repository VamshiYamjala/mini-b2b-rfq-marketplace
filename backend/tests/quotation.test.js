const request = require('supertest');
const app = require('../src/app');

describe('Supplier Flows & Quotation System API (§16.3)', () => {
  let buyerAgent;
  let supplier1Agent;
  let supplier2Agent;
  let activeRfqId;
  let closedRfqId;

  beforeAll(async () => {
    // Register buyer
    buyerAgent = request.agent(app);
    await buyerAgent.post('/api/auth/register').send({
      name: 'Quote Test Buyer',
      email: `buyer_quote_${Date.now()}@test.com`,
      password: 'Password123',
      role: 'BUYER'
    });

    // Register supplier 1
    supplier1Agent = request.agent(app);
    await supplier1Agent.post('/api/auth/register').send({
      name: 'Quote Test Supplier 1',
      email: `supplier1_quote_${Date.now()}@test.com`,
      password: 'Password123',
      role: 'SUPPLIER'
    });

    // Register supplier 2
    supplier2Agent = request.agent(app);
    await supplier2Agent.post('/api/auth/register').send({
      name: 'Quote Test Supplier 2',
      email: `supplier2_quote_${Date.now()}@test.com`,
      password: 'Password123',
      role: 'SUPPLIER'
    });

    // Create an OPEN RFQ
    const future = new Date(Date.now() + 14 * 86400000).toISOString();
    const rfqRes = await buyerAgent.post('/api/rfqs').send({
      product_service_name: 'Industrial Linear Actuators',
      requirement_description: 'Heavy duty 12V 24V electric linear actuators 6000N thrust.',
      quantity: 100,
      delivery_location: 'Columbus, OH',
      deadline: future
    });
    activeRfqId = rfqRes.body.data.id;

    // Create and close a second RFQ
    const closedRes = await buyerAgent.post('/api/rfqs').send({
      product_service_name: 'Closed RFQ Test',
      requirement_description: 'Requirement to test closed quotation rejection.',
      quantity: 10,
      delivery_location: 'Dallas, TX',
      deadline: future
    });
    closedRfqId = closedRes.body.data.id;
    await buyerAgent.patch(`/api/rfqs/${closedRfqId}/close`);
  });

  it('Supplier can browse OPEN RFQs (200)', async () => {
    const res = await supplier1Agent.get('/api/rfqs');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.items.some(r => r.id === activeRfqId)).toBe(true);
    expect(res.body.data.items.some(r => r.id === closedRfqId)).toBe(false);
  });

  it('Supplier can submit a quotation to an OPEN RFQ (201)', async () => {
    const res = await supplier1Agent.post(`/api/rfqs/${activeRfqId}/quotations`).send({
      quoted_price: 32500.00,
      estimated_delivery_time: '10 business days',
      message: 'Includes pre-shipment testing and 2-year warranty.'
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(Number(res.body.data.quoted_price)).toBe(32500);
    expect(res.body.data.estimated_delivery_time).toBe('10 business days');
  });

  it('A second quotation from the same supplier to the same RFQ is rejected (409)', async () => {
    const res = await supplier1Agent.post(`/api/rfqs/${activeRfqId}/quotations`).send({
      quoted_price: 30000.00,
      estimated_delivery_time: '8 business days'
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain('already submitted a quotation');
  });

  it('Quotation submitted on closed RFQ is rejected (409)', async () => {
    const res = await supplier2Agent.post(`/api/rfqs/${closedRfqId}/quotations`).send({
      quoted_price: 5000.00,
      estimated_delivery_time: '5 days'
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain('closed');
  });

  it('BUYER cannot submit a quotation (403)', async () => {
    const res = await buyerAgent.post(`/api/rfqs/${activeRfqId}/quotations`).send({
      quoted_price: 15000.00,
      estimated_delivery_time: '3 days'
    });

    expect(res.status).toBe(403);
  });

  it('Supplier sees only their own quotations via /api/quotations/my', async () => {
    const res = await supplier1Agent.get('/api/quotations/my');
    expect(res.status).toBe(200);
    expect(res.body.data.some(q => q.rfq_id === activeRfqId)).toBe(true);

    const s2Res = await supplier2Agent.get('/api/quotations/my');
    expect(s2Res.status).toBe(200);
    expect(s2Res.body.data.some(q => q.rfq_id === activeRfqId)).toBe(false);
  });

  it('Buyer sees all quotations for their own RFQ', async () => {
    const res = await buyerAgent.get(`/api/rfqs/${activeRfqId}/quotations`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].supplier_name).toBeDefined();
  });
});
