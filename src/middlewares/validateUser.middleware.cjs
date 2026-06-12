const validateUser = (req, res, next) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Missing data'
        });
    }

    if (
        typeof username !== 'string' ||
        typeof email !== 'string' ||
        typeof password !== 'string'
    ) {
        return res.status(400).json({
            success: false,
            message: 'Invalid data'
        });
    }

    if (!username.trim() || !email.trim() || !password.trim()) {
        return res.status(400).json({
            success: false,
            message: 'All fields must be filled'
        });
    }

    req.body.username = username.trim();
    req.body.email = email.trim().toLowerCase();
    req.body.password = password.trim();

    next();
};

module.exports = validateUser;
