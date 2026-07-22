const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();

app.use(express.json());

app.use(cors({
    origin: '*',
    exposedHeaders: ['Link']
}));

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running'
    });
});

const githubRouter = require('./routes/github.routes.cjs');
const userRouter = require('./routes/users.routes.cjs');

app.use('/api', githubRouter);
app.use('/user', userRouter);

module.exports = app;
