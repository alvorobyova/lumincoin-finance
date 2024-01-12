const TAFFY = require('taffy');
const categories = TAFFY(require('../data/categories-income-initial.json'));

class CategoryIncomeModel {
    static findAll(userId) {
        return categories({user_id: userId}).get();
    }

    static findOne(params) {
        return categories(params).first();
    }

    static create(data) {
        return categories.insert(data);
    }

    static update(params, title) {
        const category = categories(params);
        if (category) {
            category.update({title: title});

            const updatedCategory = category.first();
            return {
                id: updatedCategory.id,
                title: updatedCategory.title
            };
        }
        return null;
    }

    static delete(filter) {
        return categories(filter).remove();
    }
}

module.exports = CategoryIncomeModel;