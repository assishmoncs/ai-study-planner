const request = require('supertest');
const app = require('../src/app');

describe('Health check', () => {
  it('GET /api/health returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok' });
    expect(typeof res.body.uptime).toBe('number');
  });
});

describe('Readiness probe', () => {
  it('GET /api/ready reports database dependency status', async () => {
    const res = await request(app).get('/api/ready');
    // Without a live DB connection in tests, readiness reports not-ready (503).
    expect([200, 503]).toContain(res.statusCode);
    expect(res.body.dependencies).toHaveProperty('database');
  });
});

describe('404 handler', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
