const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  expenseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    default: () => new mongoose.Types.ObjectId(),
  },
  amount: Number,
  date: Date,
  description: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Nullable
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    default: null,
  }, // Nullable
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "ExpenseCategory" },
});

const Expense = mongoose.model("Expense", ExpenseSchema);

module.exports = Expense;
