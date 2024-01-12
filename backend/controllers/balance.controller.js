const BalanceModel = require('../models/balance.model');

class BalanceController {
    static async getBalance(req, res) {
        let balance = BalanceModel.findOne(req.body.user.id);
        res.json({balance: balance.balance});
    }

    static async updateBalance(req, res) {
        const {newBalance} = req.body;

        BalanceModel.update(req.body.user.id, parseFloat(newBalance));
        res.json({balance: newBalance});
    }
}

module.exports = BalanceController;