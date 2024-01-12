const CategoryIncomeModel = require('../models/category-income.model');
const OperationModel = require('../models/operation.model');

class CategoryIncomeController {
    static getCategories(req, res) {
        let operations = CategoryIncomeModel.findAll(req.body.user.id);
        res.json(operations.map(item => ({id: item.id, title: item.title})));
    }

    static getCategory(req, res) {
        const {id} = req.params;
        if (!id) {
            return res.status(400)
                .json({error: true, message: "ID parameter should be passed"});
        }

        const category = CategoryIncomeModel.findOne({id: parseInt(id), user_id: req.body.user.id});
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

        let category = CategoryIncomeModel.findOne({title: title, user_id: req.body.user.id});
        if (category) {
            return res.status(400)
                .json({error: true, message: "This record already exists"});
        }

        let id = 1;
        while (CategoryIncomeModel.findOne({id: id})) {
            id++;
        }

        category = {
            id: id,
            title: req.body.title,
            user_id: req.body.user.id
        };

        CategoryIncomeModel.create(category)
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

        res.json(CategoryIncomeModel.update({id: parseInt(id), user_id: req.body.user.id}, title));
    }

    static deleteCategory(req, res) {
        const {id} = req.params;
        if (!id) {
            return res.status(400)
                .json({error: true, message: "ID parameter should be passed"});
        }
        CategoryIncomeModel.delete({id: parseInt(id), user_id: req.body.user.id});
        OperationModel.update({
            category_income_id: parseInt(id),
            user_id: req.body.user.id
        }, {category_income_id: null});
        res.json({
            error: false,
            message: 'Removed successfully'
        });
    }
}

module.exports = CategoryIncomeController;