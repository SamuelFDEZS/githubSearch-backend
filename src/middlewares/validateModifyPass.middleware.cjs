const validateModifyPass = (req, res, next) => {
    const {
        oldPassword,
        newPassword,
        confirmPassword
    } = req.body ?? {};

    if (
        typeof oldPassword !== 'string' ||
        typeof newPassword !== 'string' ||
        typeof confirmPassword !== 'string'
    ) {
        return res.status(400).json({
            success: false,
            message: 'Invalid data'
        });
    }

    if (
        oldPassword.length === 0 ||
        newPassword.length === 0 ||
        confirmPassword.length === 0
    ) {
        return res.status(400).json({
            success: false,
            message: 'All fields must be filled'
        });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: 'Passwords do not match'
        });
    }

    next();
};

module.exports = validateModifyPass;
