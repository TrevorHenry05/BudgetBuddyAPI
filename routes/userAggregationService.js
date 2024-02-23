const express = require("express");
const axios = require("axios");
const ExpenseCategory = require("../models/expenseCategory");
const User = require("../models/user");

const router = express.Router();

const aggregateUserData = async (expenses, budgets) => {
  try {
    const userIds = [
      ...new Set(
        expenses
          .map((expense) => expense.userId)
          .concat(budgets.map((budget) => budget.userId))
      ),
    ];
    const categoryIds = [
      ...new Set(expenses.map((expense) => expense.categoryId)),
    ];

    const [users, categories] = await Promise.all([
      User.find({ _id: { $in: userIds } }),
      ExpenseCategory.find({ _id: { $in: categoryIds } }),
    ]);

    const userMap = new Map(users.map((user) => [user._id.toString(), user]));
    const categoryMap = new Map(
      categories.map((category) => [category._id.toString(), category])
    );

    return budgets.map((budget) => {
      const expensesForBudget = expenses.filter(
        (expense) => expense.budgetId.toString() === budget._id.toString()
      );
      const expensesWithDetails = expensesForBudget.map((expense) => {
        const category = categoryMap.get(expense.categoryId.toString());
        const user = userMap.get(expense.userId.toString());
        return {
          _id: expense._id,
          amount: expense.amount,
          date: expense.date,
          description: expense.description,
          budgetId: expense.budgetId,
          groupId: expense.groupId,
          categoryName: category ? category.categoryName : null,
          user: user ? { _id: user._id, username: user.username } : null,
        };
      });

      const budgetUser = userMap.get(budget.userId.toString());
      return {
        _id: budget._id,
        totalBudget: budget.totalBudget,
        purpose: budget.purpose,
        startDate: budget.startDate,
        endDate: budget.endDate,
        groupId: budget.groupId,
        budgetType: budget.budgetType,
        user: budgetUser
          ? { _id: budgetUser._id, username: budgetUser.username }
          : null,
        expenses: expensesWithDetails,
      };
    });
  } catch (error) {
    console.error("Error aggregating user data:", error);
    throw error;
  }
};

router.get("", async (req, res, next) => {
  const token = req.headers.authorization;
  try {
    const [expensesResponse, budgetsResponse] = await Promise.all([
      axios.get("http://localhost:3000/api/expenses/user", {
        headers: { Authorization: token },
        timeout: 5000,
      }),
      axios.get("http://localhost:3000/api/budgets/user", {
        headers: { Authorization: token },
        timeout: 5000,
      }),
    ]);

    const aggregatedData = await aggregateUserData(
      expensesResponse.data,
      budgetsResponse.data
    );
    res.status(200).json({ aggregatedData });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
