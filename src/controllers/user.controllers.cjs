const pool = require('../db/db.cjs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const getUsers = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username, email, phone, created_at FROM users');

        res.status(200).json({
            success: true,
            message: 'Users found',
            data: result.rows
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getUserById = async (req, res) => {
    const userId = req.user.id;

    if (isNaN(userId)) {
        return res.status(400).json({
            success: false,
            message: 'Bad request'
        });
    }

    const query = `
        SELECT id, username, email, phone, created_at
        FROM users
        WHERE users.id = $1
    `;

    const values = [userId];

    try {
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User found',
            data: result.rows[0]
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const createUser = async (req, res) => {
    const { username, email, password } = req.body;
    const phone = req.body.phone || null;

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
        INSERT INTO users(username, email, password_hash, phone)
        VALUES ($1, $2, $3, $4)
        RETURNING id, username, email, phone, created_at
    `;

    const values = [username, email, hashedPassword, phone];

    try {
        const result = await pool.query(query, values);

        res.status(201).json({
            success: true,
            message: 'User successfully created',
            data: result.rows
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Internal Server error'
        });
    }
};

const modifyUser = async (req, res) => {
    const allowedFields = ['username', 'email', 'phone'];

    const userId = req.user.id;

    if (isNaN(userId)) {
        return res.status(400).json({
            success: false,
            message: 'Bad request'
        });
    }

    const receivedFields = req.body;
    const keys = Object.keys(receivedFields);

    if (keys.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'At least one field must be provided'
        });
    }

    const invalidFields = keys.some(key => !allowedFields.includes(key));

    if (invalidFields) {
        return res.status(400).json({
            success: false,
            message: 'Invalid fields'
        });
    }

    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    const query = `
        UPDATE users
        SET ${setClause}
        WHERE id = $${keys.length + 1}
        RETURNING id, username, email, phone, created_at
    `;
    const values = keys.map(key => receivedFields[key]);
    values.push(userId);

    try {
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User successfully modified',
            data: result.rows[0]
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Internal Server error'
        });
    }
};

const modifyPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    const query = `
        SELECT password_hash
        FROM users
        WHERE id = $1
    `;
    const values = [userId];

    try {
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(oldPassword, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updateQuery = `
            UPDATE users
            SET password_hash = $1
            WHERE id = $2
            RETURNING id, username, email, phone, created_at
        `;
        const updateValues = [hashedPassword, userId];

        const updateResult = await pool.query(updateQuery, updateValues);

        if (updateResult.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Password successfully modified'
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Internal Server error'
        });
    }
};

const deleteUser = async (req, res) => {
    const userId = req.user.id;

    if (isNaN(userId)) {
        return res.status(400).json({
            success: false,
            message: 'Bad request'
        });
    }

    const query = `
        DELETE FROM users
        WHERE id = $1
        RETURNING id, username, email, phone, created_at
    `;
    const values = [userId];

    try {
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User successfully deleted',
            data: result.rows[0]
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Internal Server error'
        });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const query = `
        SELECT id, username, email, phone, password_hash, created_at
        FROM users
        WHERE email = $1
    `;

    const values = [email];

    try {
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            { sub: String(user.id) },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h',
                algorithm: 'HS256'
            }
        );

        res.status(200).json({
            success: true,
            message: 'User successfully logged in',
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    phone: user.phone,
                    created_at: user.created_at
                }
            }
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Internal Server error'
        });
    }
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    loginUser,
    modifyUser,
    modifyPassword,
    deleteUser
};
