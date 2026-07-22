const validateModifyPass = (req, res, next) => {
    const {
        oldPassword,
        newPassword,
        confirmPassword
    } = req.body ?? {};

    if (!oldPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
            success: false,
            message: 'Missing data'
        });
    }

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
        !oldPassword.trim() ||
        !newPassword.trim() ||
        !confirmPassword.trim()
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

    if (oldPassword === newPassword) {
        return res.status(400).json({
            success: false,
            message: 'New password cannot be the same as the old password'
        });
    }

    next();
};

module.exports = validateModifyPass;
