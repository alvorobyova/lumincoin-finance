const OperationController = require('../controllers/operation.controller');
const MiddlewareUtils = require('../utils/middleware.utils');
const express = require('express');
const router = express.Router();

router.get('/', MiddlewareUtils.validateUser, OperationController.getOperations);
router.get('/:id', MiddlewareUtils.validateUser, OperationController.getOperation);
router.post('/', MiddlewareUtils.validateUser, OperationController.createOperation);
router.put('/:id', MiddlewareUtils.validateUser, OperationController.updateOperation);
router.delete('/:id', MiddlewareUtils.validateUser, OperationController.deleteOperation);


module.exports = router;