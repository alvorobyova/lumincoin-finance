const CategoryExpenseModel = require('../models/category-expense.model');
const OperationModel = require('../models/operation.model');

class CategoryExpenseController {
    static getCategories(req, res) {
        let categories = CategoryExpenseModel.findAll(req.body.user.id);
        res.json(categories.map(item => ({id: item.id, title: item.title})));
    }

    static getCategory(req, res) {
        const {id} = req.params;
        if (!id) {
            return res.status(400)
                .json({error: true, message: "ID parameter should be passed"});
        }

        const category = CategoryExpenseModel.findOne({id: parseInt(id), user_id: req.body.user.id});
        if (!category) {
            return res.status(404)
                .json({error: true, message: "Not found"});
        }
        res.json({
            id: category.id,
            title: category.title
        });
    }

    static createCategory(req, res) {
        const {title} = req.body;
        if (!title) {
            return res.status(400)
                .json({error: true, message: "Title parameter should be passed"});
        }

        let category = CategoryExpenseModel.findOne({title: title, user_id: req.body.user.id});
        if (category) {
            return res.status(400)
                .json({error: true, message: "This record already exists"});
        }

        let id = 1;
        while (CategoryExpenseModel.findOne({id: id})) {
            id++;
        }

        category = {
            id: id,
            title: req.body.title,
            user_id: req.body.user.id
        };

        CategoryExpenseModel.create(category)
        res.json({
            id: category.id,
            title: category.title
        });
    }

    static updateCategory(req, res) {
        const {id} = req.params;
        const {title} = req.body;
        if (!id || !title) {
            return res.status(400)
                .json({error: true, message: "Title and ID parameters should be passed"});
        }

        res.json(CategoryExpenseModel.update({id: parseInt(id), user_id: req.body.user.id}, title));
    }

    static deleteCategory(req, res) {
        const {id} = req.params;
        if (!id) {
            return res.status(400)
                .json({error: true, message: "ID parameter should be passed"});
        }
        CategoryExpenseModel.delete({id: parseInt(id), user_id: req.body.user.id});
        OperationModel.update({
            category_expense_id: parseInt(id),
            user_id: req.body.user.id
        }, {category_expense_id: null});
        res.json({
            error: false,
            message: 'Removed successfully'
        });
    }
}

module.exports = CategoryExpenseController;