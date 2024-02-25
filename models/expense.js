const mongoose = require("mongoose");

// Function to format date to YYYY-MM-DD
function formatDateToString(value) {
  const date = new Date(value);
  return date.toISOString().split("T")[0];
}

const ExpenseSchema = new mongoose.Schema(
  {
    amount: Number,
    date: {
      type: String,
      set: formatDateToString,
    },
    description: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExpenseCategory",
    },
    budgetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget",
      default: null,
    }, // Nullable
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

// Virtual for `date` as a Date object
ExpenseSchema.virtual("dateAsDate").get(function () {
  return this.date ? new Date(this.date) : null;
});

const Expense = mongoose.model("Expense", ExpenseSchema);

module.exports = Expense;
