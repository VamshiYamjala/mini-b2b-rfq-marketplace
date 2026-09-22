const request = require('supertest');
const app = require('../src/app');

describe('Buyer RFQ Flows API (§16.2)', () => {
  let buyerAgent;
  let buyer2Agent;
  let supplierAgent;
  let createdRfqId;

  beforeAll(async () => {
    // Setup buyer 1
    buyerAgent = request.agent(app);
    await buyerAgent.post('/api/auth/register').send({
      name: 'Test Buyer 1',
      email: `buyer1_jest_${Date.now()}@test.com`,
      password: 'Password123',
      role: 'BUYER'
    });

    // Setup buyer 2
    buyer2Agent = request.agent(app);
    await buyer2Agent.post('/api/auth/register').send({
      name: 'Test Buyer 2',
      email: `buyer2_jest_${Date.now()}@test.com`,
      password: 'Password123',
      role: 'BUYER'
    });

    // Setup supplier
    supplierAgent = request.agent(app);
    await supplierAgent.post('/api/auth/register').send({
      name: 'Test Supplier RFQ',
      email: `supplier_jest_${Date.now()}@test.com`,
      password: 'Password123',
      role: 'SUPPLIER'
    });
  });

  it('Create RFQ succeeds for a BUYER (201)', async () => {
    const future = new Date(Date.now() + 7 * 86400000).toISOString();
    const res = await buyerAgent.post('/api/rfqs').send({
      product_service_name: 'Precision Hydraulic Cylinders',
      requirement_description: 'Double acting high pressure welded hydraulic cylinders 3000 PSI.',
      quantity: 50,
      delivery_location: 'Detroit, MI',
      deadline: future
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.status).toBe('OPEN');
    createdRfqId = res.body.data.id;
  });

  it('Create RFQ is rejected for a SUPPLIER (403)', async () => {
    const future = new Date(Date.now() + 7 * 86400000).toISOString();
    const res = await supplierAgent.post('/api/rfqs').send({
      product_service_name: 'Supplier Cannot Post',
      requirement_description: 'Attempt by supplier to create RFQ should fail.',
      quantity: 10,
      delivery_location: 'Anywhere',
      deadline: future
    });

    expect(res.status).toBe(403);
  });

  it('Buyer can edit their own OPEN RFQ (200)', async () => {
    const future = new Date(Date.now() + 10 * 86400000).toISOString();
    const res = await buyerAgent.put(`/api/rfqs/${createdRfqId}`).send({
      product_service_name: 'Precision Hydraulic Cylinders v2',
      requirement_description: 'Updated requirement description for heavy duty hydraulic cylinders.',
      quantity: 75,
      delivery_location: 'Detroit, MI Warehouse A',
      deadline: future
    });

    expect(res.status).toBe(200);
    expect(res.body.data.quantity).toBe(75);
    expect(res.body.data.product_service_name).toBe('Precision Hydraulic Cylinders v2');
  });

  it('Buyer cannot edit another buyers RFQ (403)', async () => {
    const future = new Date(Date.now() + 10 * 86400000).toISOString();
    const res = await buyer2Agent.put(`/api/rfqs/${createdRfqId}`).send({
      product_service_name: 'Malicious Hijack',
      requirement_description: 'Attempt to overwrite someone elses specification.',
      quantity: 999,
      delivery_location: 'Nowhere',
      deadline: future
    });

    expect(res.status).toBe(403);
  });

  it('Buyer can close their own RFQ (200)', async () => {
    const res = await buyerAgent.patch(`/api/rfqs/${createdRfqId}/close`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CLOSED');
  });

  it('A second close attempt on closed RFQ returns 409', async () => {
    const res = await buyerAgent.patch(`/api/rfqs/${createdRfqId}/close`);
    expect(res.status).toBe(409);
    expect(res.body.message).toContain('already closed');
  });

  it('Editing a closed RFQ returns 409', async () => {
    const future = new Date(Date.now() + 10 * 86400000).toISOString();
    const res = await buyerAgent.put(`/api/rfqs/${createdRfqId}`).send({
      product_service_name: 'Precision Hydraulic Cylinders v3',
      requirement_description: 'Attempting to edit closed RFQ.',
      quantity: 100,
      delivery_location: 'Detroit, MI',
      deadline: future
    });

    expect(res.status).toBe(409);
  });
});
