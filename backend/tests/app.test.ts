import request from 'supertest';
import app from '../src/app';

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
    expect([200, 503]).toContain(res.statusCode);
    expect(res.body.dependencies).toHaveProperty('database');
  });
});

describe('Authentication guard on protected endpoints', () => {
  it('rejects unauthenticated requests to /api/tasks with 401', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects unauthenticated requests to /api/study-plans/ai/suggest with 401', async () => {
    const res = await request(app)
      .post('/api/study-plans/ai/suggest')
      .send({ subject: 'Math', daysAvailable: 5, hoursPerDay: 2 });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('404 handler', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
