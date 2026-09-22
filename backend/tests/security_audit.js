const request = require('supertest');
const app = require('../src/app');

async function runSecurityAudit() {
  console.log('=== LEVEL 14: SECURITY AUDIT & HARDENING ===\n');

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

  // 1. SQL Injection attempt in login email
  const sqlInjEmail = "' OR '1'='1' --";
  const sqlInjLogin = await request(app).post('/api/auth/login').send({
    email: sqlInjEmail,
    password: 'Password123'
  });
  assert(sqlInjLogin.status === 422 || sqlInjLogin.status === 401, 'SQL injection in login is rejected securely');

  // 2. SQL Injection payload in RFQ title / search
  const buyerAgent = request.agent(app);
  await buyerAgent.post('/api/auth/register').send({
    name: 'Security Test Buyer',
    email: `sec_buyer_${Date.now()}@test.com`,
    password: 'Password123',
    role: 'BUYER'
  });

  const sqlPayload = "Stainless Steel Valves'; DROP TABLE quotations; --";
  const rfqRes = await buyerAgent.post('/api/rfqs').send({
    product_service_name: sqlPayload,
    requirement_description: "Safe parameterized input test description here",
    quantity: 100,
    delivery_location: "Chicago, IL",
    deadline: new Date(Date.now() + 86400000).toISOString()
  });
  assert(rfqRes.status === 201, 'SQL injection attempt in product_service_name treated as literal string');
  assert(rfqRes.body.data.product_service_name === sqlPayload, 'Raw SQL was not executed, quotations table intact');

  // Verify quotations table was not dropped!
  const supplierAgent = request.agent(app);
  await supplierAgent.post('/api/auth/register').send({
    name: 'Security Test Supplier',
    email: `sec_supplier_${Date.now()}@test.com`,
    password: 'Password123',
    role: 'SUPPLIER'
  });
  const quotesRes = await supplierAgent.get('/api/quotations/my');
  assert(quotesRes.status === 200, 'Quotations table confirmed healthy after SQL injection test');

  // 3. Password hash exposure check
  const meRes = await buyerAgent.get('/api/auth/me');
  assert(!meRes.body.data.password_hash && !meRes.body.data.password, 'password_hash is never exposed in /me');

  // 4. Session cookie flags check
  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'buyer@example.com',
    password: 'Password123'
  });
  const setCookie = loginRes.headers['set-cookie'] || [];
  const sidCookie = setCookie.find(c => c.includes('marketplace_sid'));
  assert(sidCookie && sidCookie.includes('HttpOnly'), 'Session cookie includes HttpOnly flag to prevent XSS theft');

  // 5. Forbidden role access
  const supplierBuyerProbe = await supplierAgent.get('/api/auth/probe/buyer');
  assert(supplierBuyerProbe.status === 403, 'Supplier rejected from buyer route with 403');

  console.log(`\nSecurity Audit: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runSecurityAudit().catch(err => {
  console.error('Security audit error:', err);
  process.exit(1);
});
