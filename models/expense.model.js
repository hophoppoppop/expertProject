const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExpenseSchema = Schema({
    title: String,
    money: Number,
    category: {
        type: Schema.Types.ObjectId, ref: 'Category'
    }
},
{
    timestamps:true
});

const CategorySchema = Schema({
    name: String,
},
{
    timestamps:true
});

let Expense = mongoose.model('Expense', ExpenseSchema);
let Category = mongoose.model('Category', CategorySchema);

// Mongoose
module.exports = {
    Expense,
    Category
};