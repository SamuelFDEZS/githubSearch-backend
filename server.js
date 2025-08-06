require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors({
    exposedHeaders: ['Link']
}));

app.get('/api/user', async (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    try {
        const response = await fetch(`https://api.github.com/users/${username}`, {
            headers: {
                Authorization: `token ${process.env.GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.message || 'GitHub API error' });
        }

        res.json(data);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/search-users', async (req, res) => {
    const { q, page = 1, per_page = 30 } = req.query;

    if (!q) return res.status(400).json({ error: 'Query is required' });

    try {
        const response = await fetch(`https://api.github.com/search/users?q=${q}&page=${page}&per_page=${per_page}`, {
            headers: {
                Authorization: `token ${process.env.GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });

        const data = await response.json();
        const linkHeader = response.headers.get('link');

        if (linkHeader) {
            res.set('Link', linkHeader);
        }

        if (!response.ok) {
            return res.status(response.status).json({ error: data.message || 'GitHub API error' });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching GitHub users' });
    }
});

app.get('/api/user-repos', async (req, res) => {
    const { user } = req.query;

    if (!user) {
        return res.status(400).json({ error: 'User is required' });
    }

    try {
        const response = await fetch(`https://api.github.com/users/${user}/repos`, {
            headers: {
                Authorization: `token ${process.env.GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.message || 'GitHub API error' });
        }

        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/search-repos', async (req, res) => {
    const { q, page = 1, per_page = 30 } = req.query;

    if (!q) return res.status(400).json({ error: 'Query is required' });

    try {
        const response = await fetch(`https://api.github.com/search/repositories?q=${q}&page=${page}&per_page=${per_page}`, {
            headers: {
                Authorization: `token ${process.env.GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });

        const linkHeader = response.headers.get('link');

        if (linkHeader) {
            res.set('Link', linkHeader);
        }

        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching from GitHub' });
    }
});

app.get('/api/repo', async (req, res) => {
    const { owner, repo } = req.query;

    if (!owner || !repo) {
        return res.status(400).json({ error: 'owner and repo are required' });
    }

    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
                Authorization: `token ${process.env.GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });

        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json({ error: data.message || 'GitHub API error' });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching repo data' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
