'use strict';

const router = require('express').Router();
const { getServices } = require('../controllers/servicesController');

// GET /api/services
router.get('/', getServices);

module.exports = router;
