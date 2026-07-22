const request = require('supertest');
const app = require('../../src/app.cjs');

test('GET /health returns API status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
        success: true,
        message: 'API is running'
    });
});
