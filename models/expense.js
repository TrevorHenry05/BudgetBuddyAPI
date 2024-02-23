const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
  {
    amount: Number,
    date: Date,
    description: String,
    budgetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Nullable
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    }, // Nullable
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExpenseCategory",
    },
  },
  { timestamps: true }
);

const Expense = mongoose.model("Expense", ExpenseSchema);

module.exports = Expense;
