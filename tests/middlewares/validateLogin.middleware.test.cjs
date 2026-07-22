const validateLogin = require('../../src/middlewares/validateLogin.middleware.cjs');

test('returns status 400 when any of the fields is missing', () => {
    const loginInfo = {
        password: 'qwerty'
    };

    const req = {
        body: loginInfo
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const next = jest.fn();

    validateLogin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Missing data'
    });

    expect(next).not.toHaveBeenCalled();
});

test('returns status 400 when the data is not a string', () => {
    const loginInfo = {
        email: 1,
        password: 'qwerty'
    };

    const req = {
        body: loginInfo
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const next = jest.fn();

    validateLogin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid data'
    });

    expect(next).not.toHaveBeenCalled();
});

test('returns status 400 when any of the fields is empty', () => {
    const loginInfo = {
        email: ' ',
        password: 'qwerty'
    };

    const req = {
        body: loginInfo
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const next = jest.fn();

    validateLogin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'All fields must be filled'
    });

    expect(next).not.toHaveBeenCalled();
});

test('calls next when data is valid', () => {
    const loginInfo = {
        email: 'SAMUEL@GMAIL.COM',
        password: 'qwerty'
    };

    const req = {
        body: loginInfo
    };

    const res = {};

    const next = jest.fn();

    validateLogin(req, res, next);

    expect(req.body.email).toBe('samuel@gmail.com');
    expect(next).toHaveBeenCalledTimes(1);
});
