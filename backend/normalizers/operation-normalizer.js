const CategoryExpenseModel = require('../models/category-expense.model');
const CategoryIncomeModel = require('../models/category-income.model');

class OperationNormalizer {
    static normalize(userId, item) {
        let categoriesExpense = CategoryExpenseModel.findAll(userId);
        let categoriesIncome = CategoryIncomeModel.findAll(userId);

        const data = {
            id: item.id,
            type: item.type,
            amount: item.amount,
            date: item.date,
            comment: item.comment,
        };

        if (data.type === 'expense') {
            const categoryExpense = categoriesExpense.find(cat => cat.id === item.category_expense_id);
            if (categoryExpense) {
                data.category = categoryExpense.title;
            }
        } else if (data.type === 'income') {
            const categoryIncome = categoriesIncome.find(cat => cat.id === item.category_income_id);
            if (categoryIncome) {
                data.category = categoryIncome.title;
            }
        }

        return data;
    }
}

module.exports = OperationNormalizer;