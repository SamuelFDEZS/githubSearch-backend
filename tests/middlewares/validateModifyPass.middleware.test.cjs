const validateModifyPass = require('../../src/middlewares/validateModifyPass.middleware.cjs');

test('returns status 400 when any of the fields is missing', () => {
    const data = {
        oldPassword: 'qwerty',
        newPassword: 'qwerty123'
    };

    const req = {
        body: data
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const next = jest.fn();

    validateModifyPass(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Missing data'
    });

    expect(next).not.toHaveBeenCalled();
});

test('returns status 400 when the data is not a string', () => {
    const data = {
        oldPassword: 123,
        newPassword: 'qwerty123',
        confirmPassword: 'qwerty123'
    };

    const req = {
        body: data
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const next = jest.fn();

    validateModifyPass(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid data'
    });

    expect(next).not.toHaveBeenCalled();
});

test('returns status 400 when any of the fields is empty', () => {
    const data = {
        oldPassword: ' ',
        newPassword: 'qwerty123',
        confirmPassword: 'qwerty123'
    };

    const req = {
        body: data
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const next = jest.fn();

    validateModifyPass(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'All fields must be filled'
    });

    expect(next).not.toHaveBeenCalled();
});

test('returns status 400 when the new password does not match the confirm password', () => {
    const data = {
        oldPassword: 'qwerty',
        newPassword: 'qwerty123',
        confirmPassword: 'qwerty1234'
    };

    const req = {
        body: data
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const next = jest.fn();

    validateModifyPass(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Passwords do not match'
    });

    expect(next).not.toHaveBeenCalled();
});

test('returns status 400 when the new password is the same as the old password', () => {
    const data = {
        oldPassword: 'qwerty',
        newPassword: 'qwerty',
        confirmPassword: 'qwerty'
    };

    const req = {
        body: data
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const next = jest.fn();

    validateModifyPass(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'New password cannot be the same as the old password'
    });

    expect(next).not.toHaveBeenCalled();
});

test('calls next when data is valid', () => {
    const data = {
        oldPassword: 'qwerty',
        newPassword: 'qwerty123',
        confirmPassword: 'qwerty123'
    };

    const req = {
        body: data
    };

    const res = {};

    const next = jest.fn();

    validateModifyPass(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
});
