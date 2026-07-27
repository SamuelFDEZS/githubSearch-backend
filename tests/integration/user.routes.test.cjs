jest.mock('../../src/db/db.cjs', () => ({
    query: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
    verify: jest.fn(),
    sign: jest.fn()
}));

jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn()
}));

const request = require('supertest');
const app = require('../../src/app.cjs');
const pool = require('../../src/db/db.cjs');
const JWT = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { default: expectCookies } = require('supertest/lib/cookies');

describe('user routes', () => {
    describe('GET /user', () => {
        test('returns status 500 when database connection fails', async () => {
            pool.query.mockRejectedValue(new Error('Database Error'));

            const response = await request(app).get('/user');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                success: false,
                message: 'Internal server error'
            });
        });

        test('returns status 200 and the user list', async () => {
            const users = [
                {
                    id: 1,
                    username: 'Samuel',
                    email: 'samuel@gmail.com',
                    phone: '612345678',
                    created_at: new Date('2026-01-15T10:30:00Z')
                },
                {
                    id: 2,
                    username: 'Laura',
                    email: 'laura@gmail.com',
                    phone: '623456789',
                    created_at: new Date('2026-02-08T16:45:00Z')
                },
                {
                    id: 3,
                    username: 'Carlos',
                    email: 'carlos@gmail.com',
                    phone: null,
                    created_at: new Date('2026-03-21T09:15:00Z')
                }
            ];
            pool.query.mockResolvedValue({
                rowCount: 3,
                rows: users
            });

            const response = await request(app).get('/user');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: 'Users found',
                data: users.map(user => ({
                    ...user,
                    created_at: user.created_at.toISOString()
                }))
            });
        });
    });

    describe('GET /user/me', () => {
        test('returns status 404 when rowcount is 0', async () => {
            const user = {
                id: 1,
                username: 'Samuel',
                email: 'samuel@gmail.com',
                password: 'qwerty',
                created_at: new Date('2026-01-15T10:30:00Z')
            };

            pool.query.mockResolvedValue({
                rowCount: 0,
                rows: []
            });

            JWT.verify.mockReturnValue(
                { sub: String(user.id) }
            );

            const response = await request(app).get('/user/me').set('authorization', 'Bearer auth_test');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                success: false,
                message: 'User not found'
            });
        });

        test('returns status 200 and user data when data is valid', async () => {
            const user = {
                id: 1,
                username: 'Samuel',
                email: 'samuel@gmail.com',
                password: 'qwerty',
                created_at: new Date('2026-01-15T10:30:00Z')
            };

            pool.query.mockResolvedValue({
                rowCount: 1,
                rows: [user]
            });

            JWT.verify.mockReturnValue(
                { sub: String(user.id) }
            );

            const response = await request(app)
                .get('/user/me')
                .set('authorization', 'Bearer auth_test');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: 'User found',
                data: {
                    ...user,
                    created_at: user.created_at.toISOString()
                }
            });
        });
    });

    describe('POST /user/register', () => {
        test('returns 500 when database connection fails', async () => {
            const user = {
                username: 'Samuel',
                email: 'samuel@gmail.com',
                password: 'qwerty',
                created_at: new Date('2026-01-15T10:30:00Z')
            };

            pool.query.mockRejectedValue(new Error('Database error'));
            bcrypt.hash.mockResolvedValue('hashed_password');

            const response = await request(app)
                .post('/user/register')
                .send(user);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                success: false,
                message: 'Internal Server error'
            });
        });

        test('returns 201 and user info when data is valid', async () => {
            const user = {
                username: 'Samuel',
                email: 'samuel@gmail.com',
                password: 'qwerty',
                created_at: new Date('2026-01-15T10:30:00Z')
            };

            pool.query.mockResolvedValue({
                rowCount: 1,
                rows: user
            });

            bcrypt.hash.mockResolvedValue('hashed_password');

            const response = await request(app)
                .post('/user/register')
                .send(user);

            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                success: true,
                message: 'User successfully created',
                data: {
                    ...user,
                    created_at: user.created_at.toISOString()
                }
            });
        });
    });

    describe('POST /user/login', () => {
        test('returns 500 when conection to database fails', async () => {
            const user = {
                username: 'Samuel',
                email: 'samuel@gmail.com',
                password: 'qwerty',
                created_at: new Date('2026-01-15T10:30:00Z')
            };

            pool.query.mockRejectedValue(new Error('Database Error'));

            const response = await request(app)
                .post('/user/login')
                .send(user);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                success: false,
                message: 'Internal Server error'
            });
        });

        test('returns 401 when rowcount is 0', async () => {
            const user = {
                username: 'Samuel',
                email: 'samuel@gmail.com',
                password: 'qwerty',
                created_at: new Date('2026-01-15T10:30:00Z')
            };

            pool.query.mockResolvedValue({
                rowCount: 0,
                rows: []
            });

            const response = await request(app)
                .post('/user/login')
                .send(user);

            expect(response.status).toBe(401);
            expect(response.body).toEqual({
                success: false,
                message: 'Invalid email or password'
            });
        });

        test('returns 401 when email or password is not right', async () => {
            const user = {
                username: 'Samuel',
                email: 'samuel@gmail.com',
                password: 'qwerty',
                created_at: new Date('2026-01-15T10:30:00Z')
            };

            pool.query.mockResolvedValue({
                rowCount: 1,
                rows: [{ ...user, password: '12345' }]
            });

            bcrypt.compare.mockResolvedValue(false);

            const response = await request(app)
                .post('/user/login')
                .send(user);

            expect(response.status).toBe(401);
            expect(response.body).toEqual({
                success: false,
                message: 'Invalid email or password'
            });
        });

        test('returns 200 when data is valid', async () => {
            const user = {
                id: 1,
                username: 'Samuel',
                email: 'samuel@gmail.com',
                password: 'qwerty',
                phone: '612345678',
                created_at: new Date('2026-01-15T10:30:00Z')
            };

            const token = 'test_token';

            const { password, ...rest } = user;

            pool.query.mockResolvedValue({
                rowCount: 1,
                rows: [user]
            });

            bcrypt.compare.mockResolvedValue(true);

            JWT.sign.mockReturnValue('test_token');

            const response = await request(app)
                .post('/user/login')
                .send(user);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: 'User successfully logged in',
                data: {
                    token,
                    user: {
                        ...rest,
                        created_at: user.created_at.toISOString()
                    }
                }
            });
        });
    });

    describe('PATCH /user/me', () => {
        test('returns 400 when user data is missing', async () => {
            const user = {
                id: '2',
                username: 'Samuel',
                email: 'samuel@gmail.com',
                phone: '612345678',
                created_at: new Date('2026-01-15T10:30:00Z')
            };

            JWT.verify.mockReturnValue(
                { sub: String(user.id) }
            );

            const response = await request(app)
                .patch('/user/me')
                .set('authorization', 'Bearer auth_test')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                success: false,
                message: 'At least one field must be provided'
            });
        });

        test('returns 400 when a field is not allowed', async () => {
            const user = {
                id: '2',
                username: 'Samuel',
                email: 'samuel@gmail.com',
                password: 'qwerty',
                phone: '612345678',
                created_at: new Date('2026-01-15T10:30:00Z')
            };

            JWT.verify.mockReturnValue(
                { sub: String(user.id) }
            );

            const response = await request(app)
                .patch('/user/me')
                .set('authorization', 'Bearer auth_test')
                .send(user);

            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                success: false,
                message: 'Invalid fields'
            });
        });

        test('returns 500 when database connection fails', async () => {
            const user = {
                username: 'Samuel',
                email: 'samuel@gmail.com',
                phone: '612345678'
            };

            JWT.verify.mockReturnValue(
                { sub: String(1) }
            );

            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .patch('/user/me')
                .set('authorization', 'Bearer auth_test')
                .send(user);

            console.log(response.body);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                success: false,
                message: 'Internal Server error'
            });
        });

        test('returns 404 when rowcount is 0', async () => {
            const user = {
                username: 'Samuel',
                email: 'samuel@gmail.com',
                phone: '612345678'
            };

            JWT.verify.mockReturnValue(
                { sub: String(1) }
            );

            pool.query.mockResolvedValue({
                rowCount: 0,
                rows: []
            });

            const response = await request(app)
                .patch('/user/me')
                .set('authorization', 'Bearer auth_test')
                .send(user);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                success: false,
                message: 'User not found'
            });
        });

        test('returns 200 when data is valid', async () => {
            const user = {
                id: 1,
                username: 'Samuel',
                email: 'samuel@gmail.com',
                phone: '612345678',
                created_at: new Date('2026-01-15T10:30:00Z')
            };

            const { password, id, created_at, ...rest } = user;

            JWT.verify.mockReturnValue(
                { sub: String(user.id) }
            );

            pool.query.mockResolvedValue({
                rowCount: 1,
                rows: [user]
            });

            const response = await request(app)
                .patch('/user/me')
                .set('authorization', 'Bearer auth_test')
                .send(rest);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: 'User successfully modified',
                data: {
                    ...user,
                    created_at: user.created_at.toISOString()
                }
            });
        });
    });
});
