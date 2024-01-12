const TAFFY = require('taffy');
const balances = TAFFY(require('../data/balances-initial.json'));

class BalanceModel {
    static findOne(userId) {
        userId = parseInt(userId);
        let balance = balances({user_id: userId}).first()
        if (!balance) {
            balance = this.create(userId);
        }
        return balance;
    }

    static create(userId) {
        balances.insert({user_id: parseInt(userId), balance: 0});
        return {user_id: userId, balance: 0};
    }

    static update(userId, newBalance) {
        userId = parseInt(userId);
        const balance = this.findOne(userId);
        if (balance) {
            balances({user_id: userId}).update({balance: parseFloat(newBalance)});
        }

        return newBalance;
    }
}

module.exports = BalanceModel;