const jwt = require('jsonwebtoken');
const authMiddleware = require('../../src/middlewares/auth.middleware.cjs');

// test case headers comes empty
test('returns 401 when Authorization header is missing', () => {
    const req = {
        headers: {}
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required'
    });
    expect(next).not.toHaveBeenCalled();
});

// test case headers token comes with wrong content

test('returns 401 when Authorization header is invalid', () => {
    const req = {
        headers: {
            authorization: 'test'
        }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required'
    });

    expect(next).not.toHaveBeenCalled();
});

// test case headers are properly sent
test('calls next when token is valid', () => {
    process.env.JWT_SECRET = 'test_secret';

    const token = jwt.sign(
        { sub: '1' },
        process.env.JWT_SECRET,
        {
            expiresIn: '1h',
            algorithm: 'HS256'
        }
    );
    const req = {
        headers: {
            authorization: `Bearer ${token}`
        }
    };

    const res = {};

    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
});

test('returns 401 when the authorization does not start with Bearer', () => {
    process.env.JWT_SECRET = 'test_secret';

    const token = jwt.sign(
        { sub: 1 },
        process.env.JWT_SECRET,
        {
            expiresIn: '1h',
            algorithm: 'HS256'
        }
    );

    const req = {
        headers: {
            authorization: token
        }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required'
    });

    expect(next).not.toHaveBeenCalled();
});

test('return 401 when the userId is negative', () => {
    process.env.JWT_SECRET = 'test_secret';

    const token = jwt.sign(
        { sub: -1 },
        process.env.JWT_SECRET,
        {
            expiresIn: '1h',
            algorithm: 'HS256'
        }
    );

    const req = {
        headers: {
            authorization: `Bearer ${token}`
        }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized'
    });
    expect(next).not.toHaveBeenCalled();
});
