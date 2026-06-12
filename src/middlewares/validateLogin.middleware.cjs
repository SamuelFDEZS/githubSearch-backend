const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Missing data'
        });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Invalid data'
        });
    }

    if (!email.trim() || !password.trim()) {
        return res.status(400).json({
            success: false,
            message: 'All fields must be filled'
        });
    }

    req.body.email = email.trim().toLowerCase();

    next();
};

module.exports = validateLogin;
