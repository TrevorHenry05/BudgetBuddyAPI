const express = require("express");
const axios = require("axios");

const router = express.Router();

const aggregateUserData = (expenses, budgets) => {
  const aggregatedBudgets = budgets.map((budget) => ({
    _id: budget._id,
    totalBudget: budget.totalBudget,
    purpose: budget.purpose,
    startDate: budget.startDate,
    endDate: budget.endDate,
    userId: budget.userId,
    groupId: budget.groupId,
    budgetType: budget.budgetType,
    expenses: expenses.filter((expense) => expense.budgetId === budget._id),
  }));

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
      aggregatedData: aggregateUserData(userExpenses, userBudgets),
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
