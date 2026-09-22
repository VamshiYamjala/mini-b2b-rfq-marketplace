const request = require('supertest');
const app = require('../src/app');

describe('Authentication API (§16.1)', () => {
  const uniqueEmail = `test_auth_${Date.now()}@example.com`;

  it('Register succeeds with valid data (201)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jest Auth User',
        email: uniqueEmail,
        password: 'Password123',
        role: 'BUYER'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.email).toBe(uniqueEmail);
    expect(res.body.data.password_hash).toBeUndefined();
  });

  it('Register rejects duplicate email (409)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate User',
        email: uniqueEmail,
        password: 'Password123',
        role: 'BUYER'
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('Login fails with wrong password (401)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: uniqueEmail,
        password: 'IncorrectPassword999'
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('Login succeeds with correct credentials (200)', async () => {
    const agent = request.agent(app);
    const res = await agent
      .post('/api/auth/login')
      .send({
        email: uniqueEmail,
        password: 'Password123'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(uniqueEmail);

    // Verify session restoration on /api/auth/me
    const meRes = await agent.get('/api/auth/me');
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.email).toBe(uniqueEmail);
  });

  it('Logout clears the session (200)', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({
      email: uniqueEmail,
      password: 'Password123'
    });

    const logoutRes = await agent.post('/api/auth/logout');
    expect(logoutRes.status).toBe(200);

    // Verify /api/auth/me returns 401 after logout
    const meRes = await agent.get('/api/auth/me');
    expect(meRes.status).toBe(401);
  });

  it('Protected route rejects request with no session (401)', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
