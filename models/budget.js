const mongoose = require("mongoose");

// Function to format date to YYYY-MM-DD
function formatDateToString(value) {
  const date = new Date(value);
  return date.toISOString().split('T')[0];
}

const BudgetSchema = new mongoose.Schema(
  {
    totalBudget: Number,
    purpose: String,
    startDate: {
      type: String,
      set: formatDateToString
    },
    endDate: {
      type: String,
      set: formatDateToString
    },
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
  { 
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

// Virtual for `startDate` as a Date object
BudgetSchema.virtual('startDateAsDate').get(function() {
  return this.startDate ? new Date(this.startDate) : null;
});

// Virtual for `endDate` as a Date object
BudgetSchema.virtual('endDateAsDate').get(function() {
  return this.endDate ? new Date(this.endDate) : null;
});

const Budget = mongoose.model("Budget", BudgetSchema);

module.exports = Budget;
