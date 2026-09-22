const request = require('supertest');
const app = require('../src/app');

async function runPass() {
  console.log('=== LEVEL 13: VALIDATION & ERROR HANDLING PASS ===\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`✓ PASS: ${description}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${description}`);
      failed++;
    }
  };

  // 1. Unknown body field rejection (400)
  const unknownFieldRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Valid Name',
      email: 'valid@example.com',
      password: 'Password123',
      role: 'BUYER',
      maliciousField: 'exploit'
    });
  assert(unknownFieldRes.status === 400, 'Rejects unknown body fields with 400 Bad Request');

  // 2. Multi-field registration error collection (422)
  const multiErrorRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: '',
      email: 'not-an-email',
      password: 'weak',
      role: 'SUPERADMIN'
    });
  assert(multiErrorRes.status === 422, 'Returns 422 for invalid registration fields');
  assert(Array.isArray(multiErrorRes.body.errors) && multiErrorRes.body.errors.length === 4, 'Collects all 4 field errors simultaneously');

  // 3. Unauthenticated session guard (401)
  const unauthRes = await request(app).get('/api/auth/me');
  assert(unauthRes.status === 401, 'Rejects unauthenticated request with 401 Unauthorized');

  // 4. Register Buyer & Supplier
  const buyerAgent = request.agent(app);
  const buyerEmail = `buyer_edge_${Date.now()}@test.com`;
  await buyerAgent.post('/api/auth/register').send({
    name: 'Edge Buyer',
    email: buyerEmail,
    password: 'Password123',
    role: 'BUYER'
  });

  const supplierAgent = request.agent(app);
  const supplierEmail = `supplier_edge_${Date.now()}@test.com`;
  await supplierAgent.post('/api/auth/register').send({
    name: 'Edge Supplier',
    email: supplierEmail,
    password: 'Password123',
    role: 'SUPPLIER'
  });

  // 5. Role authorization bypass attempts (403)
  const supplierMakeRfq = await supplierAgent.post('/api/rfqs').send({
    product_service_name: 'Industrial Valves',
    requirement_description: 'Valid requirement description here',
    quantity: 10,
    delivery_location: 'Austin, TX',
    deadline: new Date(Date.now() + 86400000).toISOString()
  });
  assert(supplierMakeRfq.status === 403, 'Supplier cannot create RFQ (403 Forbidden)');

  const buyerBrowse = await buyerAgent.get('/api/rfqs');
  assert(buyerBrowse.status === 403, 'Buyer cannot access supplier discovery (403 Forbidden)');

  // 6. Non-existent resource (404)
  const missingRfq = await supplierAgent.get('/api/rfqs/888888');
  assert(missingRfq.status === 404, 'Returns 404 for non-existent RFQ');

  // 7. RFQ creation with expired/past deadline (422)
  const pastDeadlineRes = await buyerAgent.post('/api/rfqs').send({
    product_service_name: 'Industrial Valves',
    requirement_description: 'Valid requirement description here',
    quantity: 10,
    delivery_location: 'Austin, TX',
    deadline: new Date(Date.now() - 100000).toISOString()
  });
  assert(pastDeadlineRes.status === 422, 'Rejects past deadline on RFQ creation with 422');

  // 8. Valid RFQ creation
  const future = new Date(Date.now() + 86400000 * 5).toISOString();
  const createRfqRes = await buyerAgent.post('/api/rfqs').send({
    product_service_name: 'Hydraulic Test Pumps',
    requirement_description: 'Heavy duty testing equipment for high pressure systems.',
    quantity: 5,
    delivery_location: 'Denver, CO',
    deadline: future
  });
  const rfqId = createRfqRes.body.data.id;
  assert(createRfqRes.status === 201, 'Creates valid RFQ with 201 Created');

  // 9. Quotation validation bounds (422)
  const badPriceQuote = await supplierAgent.post(`/api/rfqs/${rfqId}/quotations`).send({
    quoted_price: 150000000, // exceeds 100,000,000
    estimated_delivery_time: '1 week'
  });
  assert(badPriceQuote.status === 422, 'Rejects price exceeding upper bound with 422');

  const zeroPriceQuote = await supplierAgent.post(`/api/rfqs/${rfqId}/quotations`).send({
    quoted_price: 0,
    estimated_delivery_time: '1 week'
  });
  assert(zeroPriceQuote.status === 422, 'Rejects non-positive price with 422');

  // 10. Valid quotation submission (201)
  const validQuoteRes = await supplierAgent.post(`/api/rfqs/${rfqId}/quotations`).send({
    quoted_price: 12500.50,
    estimated_delivery_time: '7 business days',
    message: 'Includes on-site calibration'
  });
  assert(validQuoteRes.status === 201, 'Submits valid quotation with 201 Created');

  // 11. Duplicate quotation prevention (409)
  const dupQuoteRes = await supplierAgent.post(`/api/rfqs/${rfqId}/quotations`).send({
    quoted_price: 11000.00,
    estimated_delivery_time: '5 business days'
  });
  assert(dupQuoteRes.status === 409, 'Rejects duplicate quotation with 409 Conflict');

  // 12. Quoting on closed RFQ (409)
  await buyerAgent.patch(`/api/rfqs/${rfqId}/close`);
  const supplierB = request.agent(app);
  await supplierB.post('/api/auth/register').send({
    name: 'Supplier B',
    email: `supplier_b_${Date.now()}@test.com`,
    password: 'Password123',
    role: 'SUPPLIER'
  });
  const quoteClosedRes = await supplierB.post(`/api/rfqs/${rfqId}/quotations`).send({
    quoted_price: 9000,
    estimated_delivery_time: '3 days'
  });
  assert(quoteClosedRes.status === 409, 'Rejects quotation on closed RFQ with 409 Conflict');

  // 13. Safe 500 without stack traces
  const crashRes = await request(app).get('/api/health/error-test');
  assert(crashRes.status === 500, 'Unhandled errors return HTTP 500');
  assert(!crashRes.body.stack && !JSON.stringify(crashRes.body).includes('Error:'), 'HTTP 500 response contains no stack trace or internal details');

  console.log(`\nResults: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runPass().catch(err => {
  console.error('Pass failed with unhandled error:', err);
  process.exit(1);
});
