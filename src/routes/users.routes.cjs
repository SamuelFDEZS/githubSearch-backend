const express = require('express');
const { getUsers, getUserById, createUser, modifyUser, deleteUser, loginUser, modifyPassword } = require('../controllers/user.controllers.cjs');
const validateUser = require('../middlewares/validateUser.middleware.cjs');
const validateLogin = require('../middlewares/validateLogin.middleware.cjs');
const authMiddleware = require('../middlewares/auth.middleware.cjs');
const validateModifyPass = require('../middlewares/validateModifyPass.middleware.cjs');
const router = express.Router();

router.get('/', getUsers);

router.get('/me', authMiddleware, getUserById);

router.post('/register', validateUser, createUser);
router.post('/login', validateLogin, loginUser);

router.patch('/me', authMiddleware, modifyUser);
router.patch('/me/password', authMiddleware, validateModifyPass, modifyPassword);

router.delete('/me', authMiddleware, deleteUser);

module.exports = router;
