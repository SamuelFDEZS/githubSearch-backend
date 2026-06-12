const GH_HEADERS = {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'github-search-api/1.0'
};

const getUsers = async (req, res) => {
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: 'Username is required' });

    try {
        const response = await fetch(`https://api.github.com/users/${username}`, { headers: GH_HEADERS });
        const data = await response.json();
        if (!response.ok) return res.status(response.status).json({ error: data.message || 'GitHub API error' });
        res.json(data);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getUserSummary = async (req, res) => {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: 'Username is required' });

    try {
        const response = await fetch(`https://api.github.com/users/${username}`, { headers: GH_HEADERS });
        const data = await response.json();
        if (!response.ok) return res.status(response.status).json({ error: data.message || 'GitHub API error' });

        const summary = {
            followers: data.followers,
            public_repos: data.public_repos,
            following: data.following,
            created_at: data.created_at,
            updated_at: data.updated_at
        };
        res.json(summary);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getUserRepos = async (req, res) => {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: 'Username is required' });

    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos`, { headers: GH_HEADERS });
        const data = await response.json();
        if (!response.ok) return res.status(response.status).json({ error: data.message || 'GitHub API error' });

        const linkHeader = response.headers.get('link');
        if (linkHeader) res.set('Link', linkHeader);

        res.json({ count: Array.isArray(data) ? data.length : 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getUserEvents = async (req, res) => {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: 'Username is required' });

    try {
        const response = await fetch(`https://api.github.com/users/${username}/received_events?per_page=1`, { headers: GH_HEADERS });
        if (!response.ok) {
            const error = await response.json();
            return res.status(response.status).json({ error: error.message || 'GitHub API error' });
        }

        const linkHeader = response.headers.get('link');
        const match = linkHeader && linkHeader.match(/[?&]page=(\d+)>;\s*rel="last"/i);
        const count = match ? parseInt(match[1], 10) : 1;

        res.json({ count });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getUserSubscriptions = async (req, res) => {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: 'Username is required' });

    try {
        const response = await fetch(`https://api.github.com/users/${username}/subscriptions?per_page=1`, { headers: GH_HEADERS });
        if (!response.ok) {
            const error = await response.json();
            return res.status(response.status).json({ error: error.message || 'GitHub API error' });
        }

        const linkHeader = response.headers.get('link');
        const match = linkHeader && linkHeader.match(/[?&]page=(\d+)>;\s*rel="last"/i);
        const count = match ? parseInt(match[1], 10) : 1;

        res.json({ count });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const searchUsers = async (req, res) => {
    const { q, page = 1, per_page = 30 } = req.query;
    if (!q) return res.status(400).json({ error: 'Query is required' });

    try {
        const response = await fetch(`https://api.github.com/search/users?q=${encodeURIComponent(q)}&page=${page}&per_page=${per_page}`, { headers: GH_HEADERS });
        const data = await response.json();

        const linkHeader = response.headers.get('link');
        if (linkHeader) res.set('Link', linkHeader);

        if (!response.ok) return res.status(response.status).json({ error: data.message || 'GitHub API error' });
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching GitHub users' });
    }
};

const getReposFromUser = async (req, res) => {
    const { user } = req.query;
    if (!user) return res.status(400).json({ error: 'User is required' });

    try {
        const response = await fetch(`https://api.github.com/users/${user}/repos`, { headers: GH_HEADERS });
        const data = await response.json();
        if (!response.ok) return res.status(response.status).json({ error: data.message || 'GitHub API error' });
        res.json(data);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const searchRepos = async (req, res) => {
    const { q, page = 1, per_page = 30 } = req.query;
    if (!q) return res.status(400).json({ error: 'Query is required' });

    try {
        const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&page=${page}&per_page=${per_page}`, { headers: GH_HEADERS });
        const data = await response.json();

        const linkHeader = response.headers.get('link');
        if (linkHeader) res.set('Link', linkHeader);

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching from GitHub' });
    }
};

const getSingleRepo = async (req, res) => {
    const { owner, repo } = req.query;
    if (!owner || !repo) return res.status(400).json({ error: 'owner and repo are required' });

    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: GH_HEADERS });
        const data = await response.json();
        if (!response.ok) return res.status(response.status).json({ error: data.message || 'GitHub API error' });
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching repo data' });
    }
};

module.exports = {
    getUsers,
    getUserSummary,
    getUserRepos,
    getUserSubscriptions,
    getUserEvents,
    searchUsers,
    getReposFromUser,
    searchRepos,
    getSingleRepo

};
