const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema(
  {
    totalBudget: Number,
    purpose: String,
    startDate: Date,
    endDate: Date,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    }, // Nullable
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    }, // Nullable
    budgetType: { type: String, enum: ["personal", "group"] },
    expenses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Expense" }],
  },
  { timestamps: true }
);

const Budget = mongoose.model("Budget", BudgetSchema);

module.exports = Budget;
