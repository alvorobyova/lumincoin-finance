const CategoryIncomeController = require('../controllers/category-income.controller');
const MiddlewareUtils = require('../utils/middleware.utils');
const express = require('express');
const router = express.Router();

router.get('/', MiddlewareUtils.validateUser, CategoryIncomeController.getCategories);
router.get('/:id', MiddlewareUtils.validateUser, CategoryIncomeController.getCategory);
router.post('/', MiddlewareUtils.validateUser, CategoryIncomeController.createCategory);
router.put('/:id', MiddlewareUtils.validateUser, CategoryIncomeController.updateCategory);
router.delete('/:id', MiddlewareUtils.validateUser, CategoryIncomeController.deleteCategory);

module.exports = router;