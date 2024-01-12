const BalanceController = require('../controllers/balance.controller');
const MiddlewareUtils = require('../utils/middleware.utils');
const express = require('express');
const router = express.Router();

router.get('/', MiddlewareUtils.validateUser, BalanceController.getBalance);
router.put('/', MiddlewareUtils.validateUser, BalanceController.updateBalance);

module.exports = router;