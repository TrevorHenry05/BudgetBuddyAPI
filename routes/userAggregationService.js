const express = require("express");
const axios = require("axios");
const ExpenseCategory = require("../models/expenseCategory");
const User = require("../models/user");

const router = express.Router();

const aggregateUserData = async (expenses, budgets) => {
  const aggregatedBudgets = await Promise.all(
    budgets.map(async (budget) => {
      const expensesForBudget = expenses.filter(
        (expense) => expense.budgetId === budget._id
      );
      const expensesWithDetails = await Promise.all(
        expensesForBudget.map(async (expense) => {
          const category = await ExpenseCategory.findById(expense.categoryId);
          const user = await User.findById(expense.userId);
          return {
            _id: expense._id,
            amount: expense.amount,
            date: expense.date,
            description: expense.description,
            categoryName: category.categoryName,
            budgetId: expense.budgetId,
            user:
              user == null
                ? null
                : {
                    _id: user._id,
                    username: user.username,
                  },
            groupId: expense.groupId,
          };
        })
      );

      const user = await User.findById(budget.userId);

      return {
        _id: budget._id,
        totalBudget: budget.totalBudget,
        purpose: budget.purpose,
        startDate: budget.startDate,
        endDate: budget.endDate,
        user:
          user == null
            ? null
            : {
                _id: user._id,
                username: user.username,
              },
        groupId: budget.groupId,
        budgetType: budget.budgetType,
        expenses: expensesWithDetails,
      };
    })
  );

  return aggregatedBudgets;
};

// Get aggregated user data
router.get("/user", async (req, res, next) => {
  const token = req.headers.authorization;
  try {
    // Fetch user expenses
    const expensesResponse = await axios.get(
      "http://localhost:3000/api/expenses",
      {
        headers: { Authorization: token },
        timeout: 5000,
      }
    );
    const userExpenses = expensesResponse.data;
    console.log(userExpenses);

    // Fetch user budgets
    const budgetsResponse = await axios.get(
      "http://localhost:3000/api/budgets",
      {
        headers: { Authorization: token },
        timeout: 5000,
      }
    );
    const userBudgets = budgetsResponse.data;
    console.log(userBudgets);

    res.status(200).json({
      aggregatedData: await aggregateUserData(userExpenses, userBudgets),
    });
  } catch (error) {
    if (error.response) {
      return res
        .status(error.response.status)
        .json({ message: error.response.data.message });
    } else if (error.request) {
      return res.status(504).json({
        message: "No response was received from the budget or expense service.",
      });
    } else {
      return next(error);
    }
  }
});

module.exports = router;
