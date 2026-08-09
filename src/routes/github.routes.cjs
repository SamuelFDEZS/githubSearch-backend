const express = require('express');
const { getUsers, getUserSummary, getUserRepos, getUserSubscriptions, getUserEvents, searchUsers, getReposFromUser, searchRepos, getSingleRepo } = require('../controllers/github.controllers.cjs');
const router = express.Router();

router.get('/health', (_req, res) => res.json({ ok: true }));

router.get('/user', getUsers);

router.get('/user/summary', getUserSummary);

router.get('/user/repos', getUserRepos);

router.get('/user/received-events', getUserEvents);

router.get('/user/subscriptions', getUserSubscriptions);

router.get('/search-users', searchUsers);

router.get('/user-repos', getReposFromUser);

router.get('/search-repos', searchRepos);

router.get('/repo', getSingleRepo);

module.exports = router;
