const validateUserMiddleware = require('../../src/middlewares/validateUser.middleware.cjs');

test('return 400 when a field is missing', () => {
    const user = {
        username: 'Samuel',
        email: 'samuel@gmail.com'
    };

    const req = {
        body: user
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const next = jest.fn();

    validateUserMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Missing data'
    });

    expect(next).not.toHaveBeenCalled();
});

test('return 400 when a field is empty', () => {
    const user = {
        username: '',
        email: 'samuel@gmail.com',
        password: 'qwerty'
    };

    const req = {
        body: user
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const next = jest.fn();

    validateUserMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Missing data'
    });

    expect(next).not.toHaveBeenCalled();
});

test('return 400 when data type is invalid', () => {
    const user = {
        username: 'Samuel',
        email: 2,
        password: true
    };

    const req = {
        body: user
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const next = jest.fn();

    validateUserMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid data'
    });

    expect(next).not.toHaveBeenCalled();
});

test('return 400 when data comes with a space', () => {
    const user = {
        username: ' ',
        email: 'samuel@gmail.com',
        password: 'qwerty'
    };

    const req = {
        body: user
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const next = jest.fn();

    validateUserMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'All fields must be filled'
    });

    expect(next).not.toHaveBeenCalled();
});

test('calls next when data is valid', () => {
    const user = {
        username: '  Samuel  ',
        email: 'SAMUEL@GMAIL.COM',
        password: 'qwerty'
    };

    const req = {
        body: user
    };

    const res = {};

    const next = jest.fn();

    validateUserMiddleware(req, res, next);

    expect(req.body.username).toBe('Samuel');
    expect(req.body.email).toBe('samuel@gmail.com');
    expect(next).toHaveBeenCalledTimes(1);
});
