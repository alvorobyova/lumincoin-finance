const TAFFY = require('taffy');
const operations = TAFFY(require('../data/operations-initial.json'));
const moment = require('moment');

class OperationModel {
    static findAll(userId, filter) {
        const {period, dateFrom, dateTo} = filter;
        let today = new Date();
        let dateFilterFrom = moment(today);
        let dateFilterTo = moment(today);

        switch (period) {
            case 'week':
                dateFilterFrom = dateFilterFrom.subtract(7, 'days');
                break;
            case 'month':
                dateFilterFrom = dateFilterFrom.subtract(1, 'month');
                break;
            case 'year':
                dateFilterFrom = dateFilterFrom.subtract(1, 'year');
                break;
            case 'all':
                dateFilterFrom = null;
                dateFilterTo = null;
                break;
            case 'interval':
                if (dateFrom && dateTo) {
                    dateFilterFrom = moment(dateFrom);
                    dateFilterTo = moment(dateTo);
                }
                break;
        }

        // do filter
        const operationModels = operations({user_id: userId}).get();

        const filteredOperations = dateFilterTo && dateFilterFrom ? operationModels.filter(operationModel => {
            const operationDate = moment(operationModel.date);
            return dateFilterFrom.isSameOrBefore(operationDate, 'day') && dateFilterTo.isSameOrAfter(operationDate, 'day');
        }) : operationModels;

        return filteredOperations.sort((a,b) => moment(a.date).isBefore(b.date) ? 1 : -1);
    }

    static findOne(params) {
        return operations(params).first();
    }

    static create(data) {
        return operations.insert(data);
    }

    static update(params, data) {
        const category = operations(params);
        if (category) {
            category.update(data);

            const updatedCategory = category.first();
            return {
                id: updatedCategory.id,
                type: updatedCategory.category_expense_id ? 'expense' : 'income',
                amount: updatedCategory.amount,
                date: updatedCategory.date,
                comment: updatedCategory.comment,
            };
        }
        return null;
    }

    static delete(filter) {
        return operations(filter).remove();
    }
}

module.exports = OperationModel;