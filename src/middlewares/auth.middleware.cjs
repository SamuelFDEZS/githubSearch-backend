const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(req.headers.authorization);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Authentiication required'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET,
            {
                algorithm: 'HS256'
            }
        );

        const userId = Number(decodedToken.sub);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        req.user = {
            id: userId
        };

        next();
    } catch (error) {
        console.error(error);

        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

module.exports = authMiddleware;
