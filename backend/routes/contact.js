'use strict';

const router = require('express').Router();
const { submitContact }              = require('../controllers/contactController');
const { contactLimiter }             = require('../middleware/rateLimiter');
const { contactRules, validate }     = require('../middleware/validator');

// POST /api/contact
router.post('/', contactLimiter, contactRules, validate, submitContact);

module.exports = router;
