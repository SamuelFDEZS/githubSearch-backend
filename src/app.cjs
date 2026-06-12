const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();

app.use(express.json());

app.use(cors({
    origin: '*',
    exposedHeaders: ['Link']
}));

const githubRouter = require('./routes/github.routes.cjs');
const userRouter = require('./routes/users.routes.cjs');

app.use('/api', githubRouter);
app.use('/user', userRouter);

module.exports = app;
