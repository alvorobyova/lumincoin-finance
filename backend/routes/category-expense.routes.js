const CategoryExpenseController = require('../controllers/category-expense.controller');
const MiddlewareUtils = require('../utils/middleware.utils');
const express = require('express');
const router = express.Router();

router.get('/', MiddlewareUtils.validateUser, CategoryExpenseController.getCategories);
router.get('/:id', MiddlewareUtils.validateUser, CategoryExpenseController.getCategory);
router.post('/', MiddlewareUtils.validateUser, CategoryExpenseController.createCategory);
router.put('/:id', MiddlewareUtils.validateUser, CategoryExpenseController.updateCategory);
router.delete('/:id', MiddlewareUtils.validateUser, CategoryExpenseController.deleteCategory);

module.exports = router;