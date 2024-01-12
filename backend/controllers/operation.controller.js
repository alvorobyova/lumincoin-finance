const OperationModel = require('../models/operation.model');
const OperationNormalizer = require('../normalizers/operation-normalizer');
const BalanceModel = require('../models/balance.model');

class OperationController {
    static async getOperations(req, res) {
        let operations = await OperationModel.findAll(req.body.user.id, req.query);

        const result = await Promise.all(operations.map(async (item) => OperationNormalizer.normalize(req.body.user.id, item)));

        res.json(result);
    }

    static async getOperation(req, res) {
        const {id} = req.params;
        if (!id) {
            return res.status(400)
                .json({error: true, message: "ID parameter should be passed"});
        }

        const operation = OperationModel.findOne({id: parseInt(id), user_id: req.body.user.id});
        if (!operation) {
            return res.status(404)
                .json({error: true, message: "Not found"});
        }
        res.json(OperationNormalizer.normalize(req.body.user.id, operation));
    }

    static createOperation(req, res) {
        const {type, category_id, amount, date, comment} = req.body;
        if (!type || !amount || !date || !comment) {
            return res.status(400)
                .json({error: true, message: "All parameters should be passed"});
        }

        const params = {amount: parseFloat(amount), date, comment, user_id: req.body.user.id};

        let balance = BalanceModel.findOne(req.body.user.id);
        let newBalance = balance.balance;
        if (type === 'expense') {
            params.category_expense_id = category_id;
            params.type = 'expense';
            newBalance -= params.amount;
            if (newBalance < 0) {
                newBalance = 0;
            }
        } else if (type === 'income') {
            params.category_income_id = category_id;
            params.type = 'income';
            newBalance += params.amount;
        }

        let operation = OperationModel.findOne(params);
        if (operation) {
            return res.status(400)
                .json({error: true, message: "This record already exists"});
        }

        let id = 1;
        while (OperationModel.findOne({id: id})) {
            id++;
        }

        params.id = id;

        OperationModel.create(params);

        if (balance) {
            BalanceModel.update(req.body.user.id, newBalance);
        }

        res.json(OperationNormalizer.normalize(req.body.user.id, params));
    }


    static updateOperation(req, res) {
        const {id} = req.params;
        const {type, category_id, amount, date, comment} = req.body;
        if (!id || !type || !amount || !date || !comment) {
            return res.status(400)
                .json({error: true, message: "All parameters should be passed"});
        }
        const operation = OperationModel.findOne({id: parseInt(id), user_id: req.body.user.id});
        if (!operation) {
            return res.status(404)
                .json({error: true, message: "Not found"});
        }

        const params = {amount, date, comment, user_id: req.body.user.id};
        if (type === 'expense') {
            params.type = 'expense';
            params.category_expense_id = category_id;
            params.category_income_id = null;
        } else if (type === 'income') {
            params.type = 'income';
            params.category_income_id = category_id;
            params.category_expense_id = null;
        }
        OperationModel.update({id: parseInt(id), user_id: req.body.user.id}, params);

        let balance = BalanceModel.findOne(req.body.user.id);
        let newBalance = balance.balance;

        if (operation.category_expense_id) {
            // was expense
            newBalance += operation.amount;
        } else {
            // was income
            newBalance -= operation.amount;
        }

        if (type === 'expense') {
            newBalance -= params.amount;
            if (newBalance < 0) {
                newBalance = 0;
            }
        } else if (type === 'income') {
            newBalance += params.amount;
        }

        if (balance) {
            BalanceModel.update(req.body.user.id, newBalance);
        }

        res.json(OperationNormalizer.normalize(req.body.user.id, Object.assign(params, {id: parseInt(id)})));
    }

    static deleteOperation(req, res) {
        const {id} = req.params;
        if (!id) {
            return res.status(400)
                .json({error: true, message: "ID parameter should be passed"});
        }

        const operation = OperationModel.findOne({id: parseInt(id), user_id: req.body.user.id});
        if (!operation) {
            return res.status(404)
                .json({error: true, message: "Not found"});
        }

        let balance = BalanceModel.findOne(req.body.user.id);
        let newBalance = balance.balance;

        if (operation.category_expense_id) {
            // was expense
            newBalance += operation.amount;
        } else {
            // was income
            newBalance -= operation.amount;
        }

        if (balance) {
            BalanceModel.update(req.body.user.id, newBalance);
        }

        OperationModel.delete({id: parseInt(id), user_id: req.body.user.id});
        res.json({
            error: false,
            message: 'Removed successfully'
        });
    }
}

module.exports = OperationController;