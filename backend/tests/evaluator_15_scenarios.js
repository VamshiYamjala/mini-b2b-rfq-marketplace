const request = require('supertest');
const app = require('../src/app');

async function runEvaluatorScenarios() {
  console.log('============================================================');
  console.log('    LEVEL 19: 15-SCENARIO EVALUATOR END-TO-END VERIFICATION');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  function record(scenarioNum, name, success, details) {
    if (success) {
      console.log(`[PASS] Scenario ${scenarioNum}: ${name}`);
      if (details) console.log(`       → ${details}`);
      passed++;
    } else {
      console.error(`[FAIL] Scenario ${scenarioNum}: ${name}`);
      if (details) console.error(`       → Error: ${details}`);
      failed++;
    }
  }

  const timestamp = Date.now();
  const buyerAgent = request.agent(app);
  const supplierAgent = request.agent(app);

  const buyerEmail = `eval_buyer_${timestamp}@marketplace.com`;
  const supplierEmail = `eval_supplier_${timestamp}@marketplace.com`;

  let openRfqId;
  let closedRfqId;

  try {
    // -------------------------------------------------------------
    // Scenario 1: Register Buyer
    // -------------------------------------------------------------
    const s1 = await buyerAgent.post('/api/auth/register').send({
      name: 'Evaluation Buyer Corp',
      email: buyerEmail,
      password: 'Password123',
      role: 'BUYER'
    });
    record(1, 'Register Buyer', s1.status === 201 && s1.body.data.role === 'BUYER', `Registered as BUYER (ID: ${s1.body.data?.id})`);

    // -------------------------------------------------------------
    // Scenario 2: Register Supplier
    // -------------------------------------------------------------
    const s2 = await supplierAgent.post('/api/auth/register').send({
      name: 'Evaluation Supplier Ltd',
      email: supplierEmail,
      password: 'Password123',
      role: 'SUPPLIER'
    });
    record(2, 'Register Supplier', s2.status === 201 && s2.body.data.role === 'SUPPLIER', `Registered as SUPPLIER (ID: ${s2.body.data?.id})`);

    // -------------------------------------------------------------
    // Scenario 3: Login as Buyer
    // -------------------------------------------------------------
    const s3Agent = request.agent(app);
    const s3 = await s3Agent.post('/api/auth/login').send({
      email: buyerEmail,
      password: 'Password123'
    });
    record(3, 'Login as Buyer', s3.status === 200 && s3.body.data.role === 'BUYER', 'Session generated, role verified');

    // -------------------------------------------------------------
    // Scenario 4: Login with Wrong Password
    // -------------------------------------------------------------
    const s4 = await request(app).post('/api/auth/login').send({
      email: buyerEmail,
      password: 'WrongPassword999'
    });
    record(4, 'Login with Wrong Password', s4.status === 401 && s4.body.message === 'Invalid email or password', 'Clean 401 generic error returned');

    // -------------------------------------------------------------
    // Scenario 5: Logout
    // -------------------------------------------------------------
    const s5Logout = await s3Agent.post('/api/auth/logout');
    const s5Check = await s3Agent.get('/api/auth/me');
    record(5, 'Logout', s5Logout.status === 200 && s5Check.status === 401, 'Session destroyed, subsequent request returned 401');

    // -------------------------------------------------------------
    // Scenario 6: Create RFQ
    // -------------------------------------------------------------
    const future = new Date(Date.now() + 14 * 86400000).toISOString();
    const s6 = await buyerAgent.post('/api/rfqs').send({
      product_service_name: 'High Precision Pneumatic Valves',
      requirement_description: 'ISO 5599 pneumatic directional control valves with 24V DC solenoid coils.',
      quantity: 200,
      delivery_location: 'Detroit, MI Warehouse 2',
      deadline: future
    });
    openRfqId = s6.body.data?.id;
    record(6, 'Create RFQ', s6.status === 201 && s6.body.data?.status === 'OPEN', `RFQ created with status OPEN (ID: ${openRfqId})`);

    // -------------------------------------------------------------
    // Scenario 7: Create RFQ Validation
    // -------------------------------------------------------------
    const s7 = await buyerAgent.post('/api/rfqs').send({
      product_service_name: 'x', // too short
      requirement_description: '', // empty
      quantity: -5, // non-positive
      delivery_location: '',
      deadline: new Date(Date.now() - 3600000).toISOString() // past
    });
    record(7, 'Create RFQ Validation', s7.status === 422 && s7.body.errors.length >= 4, 'Multiple inline field errors returned');

    // -------------------------------------------------------------
    // Scenario 8: Edit RFQ
    // -------------------------------------------------------------
    const s8 = await buyerAgent.put(`/api/rfqs/${openRfqId}`).send({
      product_service_name: 'High Precision Pneumatic Valves v2',
      requirement_description: 'Updated requirement specification for directional control valves.',
      quantity: 250,
      delivery_location: 'Detroit, MI Warehouse 2B',
      deadline: future
    });
    record(8, 'Edit RFQ', s8.status === 200 && s8.body.data?.quantity === 250, 'Updated specifications persisted');

    // Create a second RFQ for closing scenario
    const s9Rfq = await buyerAgent.post('/api/rfqs').send({
      product_service_name: 'Temporary Flange Gaskets',
      requirement_description: 'Gaskets for immediate pipeline shutdown testing.',
      quantity: 50,
      delivery_location: 'Houston, TX',
      deadline: future
    });
    closedRfqId = s9Rfq.body.data.id;

    // -------------------------------------------------------------
    // Scenario 9: Close RFQ
    // -------------------------------------------------------------
    const s9 = await buyerAgent.patch(`/api/rfqs/${closedRfqId}/close`);
    const s9Edit = await buyerAgent.put(`/api/rfqs/${closedRfqId}`).send({
      product_service_name: 'Cannot Edit Closed',
      requirement_description: 'Should be rejected',
      quantity: 10,
      delivery_location: 'Houston, TX',
      deadline: future
    });
    record(9, 'Close RFQ', s9.status === 200 && s9.body.data?.status === 'CLOSED' && s9Edit.status === 409, 'RFQ closed and subsequent edits rejected with 409');

    // -------------------------------------------------------------
    // Scenario 10: Supplier Browse
    // -------------------------------------------------------------
    const s10 = await supplierAgent.get('/api/rfqs');
    const hasOpen = s10.body.data.items.some(r => r.id === openRfqId);
    const hasClosed = s10.body.data.items.some(r => r.id === closedRfqId);
    record(10, 'Supplier Browse', s10.status === 200 && hasOpen && !hasClosed, 'Open RFQs listed, closed RFQs excluded by default');

    // -------------------------------------------------------------
    // Scenario 11: Supplier Search and Filter
    // -------------------------------------------------------------
    const s11Search = await supplierAgent.get('/api/rfqs?search=Pneumatic');
    const s11Loc = await supplierAgent.get('/api/rfqs?location=Detroit');
    const s11None = await supplierAgent.get('/api/rfqs?search=NonExistentDevice123');
    record(11, 'Supplier Search and Filter', s11Search.body.data.items.length >= 1 && s11Loc.body.data.items.length >= 1 && s11None.body.data.items.length === 0, 'Keyword and location filters verified');

    // -------------------------------------------------------------
    // Scenario 12: Submit Quotation
    // -------------------------------------------------------------
    const s12 = await supplierAgent.post(`/api/rfqs/${openRfqId}/quotations`).send({
      quoted_price: 18500.00,
      estimated_delivery_time: '10 business days',
      message: 'Direct dispatch from Midwest distribution facility.'
    });
    record(12, 'Submit Quotation', s12.status === 201 && Number(s12.body.data?.quoted_price) === 18500, 'Valid quotation bid submitted');

    // -------------------------------------------------------------
    // Scenario 13: Duplicate Quotation Block
    // -------------------------------------------------------------
    const s13 = await supplierAgent.post(`/api/rfqs/${openRfqId}/quotations`).send({
      quoted_price: 18000.00,
      estimated_delivery_time: '8 business days'
    });
    record(13, 'Duplicate Quotation Block', s13.status === 409, 'Duplicate submission blocked with 409 Conflict');

    // -------------------------------------------------------------
    // Scenario 14: Quote on Closed RFQ
    // -------------------------------------------------------------
    const s14 = await supplierAgent.post(`/api/rfqs/${closedRfqId}/quotations`).send({
      quoted_price: 5000.00,
      estimated_delivery_time: '3 days'
    });
    record(14, 'Quote on Closed RFQ', s14.status === 409, 'Quotation on closed RFQ rejected with 409 Conflict');

    // -------------------------------------------------------------
    // Scenario 15: Buyer Reviews Quotes
    // -------------------------------------------------------------
    const s15 = await buyerAgent.get(`/api/rfqs/${openRfqId}/quotations`);
    record(15, 'Buyer Reviews Quotes', s15.status === 200 && s15.body.data.length === 1 && s15.body.data[0].supplier_name === 'Evaluation Supplier Ltd', 'Buyer views received bids with supplier details');

  } catch (err) {
    console.error('Unexpected scenario execution failure:', err);
    failed++;
  }

  console.log('\n============================================================');
  console.log(`EVALUATOR RESULTS: ${passed} / 15 SCENARIOS PASSED (${failed} FAILED)`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runEvaluatorScenarios().catch(err => {
  console.error(err);
  process.exit(1);
});
