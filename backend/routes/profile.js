'use strict';

const router = require('express').Router();
const { getProfile } = require('../controllers/profileController');

// GET /api/profile
router.get('/', getProfile);

module.exports = router;
