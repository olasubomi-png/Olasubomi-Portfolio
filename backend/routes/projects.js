'use strict';

const router = require('express').Router();
const { getProjects } = require('../controllers/projectsController');

// GET /api/projects
router.get('/', getProjects);

module.exports = router;
