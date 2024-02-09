const mongoose = require("mongoose");

const ExpenseCategorySchema = new mongoose.Schema({
  categoryName: { type: String, unique: true, required: true },
});

const ExpenseCategory = mongoose.model(
  "ExpenseCategory",
  ExpenseCategorySchema
);

module.exports = ExpenseCategory;
