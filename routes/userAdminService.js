const express = require("express");
const User = require("../models/user");
const Group = require("../models/group");
const Expense = require("../models/expense");
const Budget = require("../models/budget");
const ExpenseCategory = require("../models/expenseCategory");

const router = express.Router();

const getBudgetDetails = async (budgets, expenses) => {
  const budgetWithDetails = await Promise.all(
    budgets.map(async (budget) => {
      const user = budget.userId
        ? await User.findById(budget.userId).select("-password")
        : null;
      const group = budget.groupId
        ? await Group.findById(budget.groupId)
        : null;
      const expensesWithDetails = await Promise.all(
        expenses
          .filter(
            (expense) => expense.budgetId.toString() === budget._id.toString()
          )

          .map(async (expense) => {
            const category = await ExpenseCategory.findById(expense.categoryId);
            const user = expense.userId
              ? await User.findById(expense.userId).select("-password")
              : null;
            const group = expense.groupId
              ? await Group.findById(expense.groupId)
              : null;
            return {
              _id: expense._id,
              amount: expense.amount,
              date: expense.date,
              description: expense.description,
              category: category
                ? {
                    _id: category._id,
                    categoryName: category.categoryName,
                  }
                : null,
              user: user
                ? {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                  }
                : null,
              group: group
                ? {
                    _id: group._id,
                    groupName: group.groupName,
                  }
                : null,
            };
          })
      );

      return {
        _id: budget._id,
        totalBudget: budget.totalBudget,
        purpose: budget.purpose,
        startDate: budget.startDate,
        endDate: budget.endDate,
        budgetType: budget.budgetType,
        user: user
          ? {
              _id: user._id,
              username: user.username,
              email: user.email,
            }
          : null,
        group: group
          ? {
              _id: group._id,
              groupName: group.groupName,
            }
          : null,
        expenses: expensesWithDetails,
      };
    })
  );

  return budgetWithDetails;
};

const getExpenseDetails = async (budgets) => {
  const expenses = budgets.reduce((acc, budget) => {
    budget.expenses.forEach((expense) => {
      acc.push(expense);
    });
    return acc;
  }, []);

  return expenses;
};

const getGroupDetails = async (groups) => {
  const groupWithDetails = await Promise.all(
    groups.map(async (group) => {
      const users = await User.find({ _id: { $in: group.members } }).select(
        "-password"
      );

      return {
        _id: group._id,
        groupName: group.groupName,
        members: users.map((user) => {
          return {
            _id: user._id,
            username: user.username,
            email: user.email,
          };
        }),
      };
    })
  );

  return groupWithDetails;
};

router.get("", async (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    const users = await User.find({}).select("-password");
    const groups = await Group.find({});
    const expenses = await Expense.find({});
    const budgets = await Budget.find({});

    const budgetsWithDetails = await getBudgetDetails(budgets, expenses);
    const expensesWithDetails = await getExpenseDetails(budgetsWithDetails);
    const groupsWithDetails = await getGroupDetails(groups);

    res.status(200).json({
      users: users.map((user) => {
        return {
          _id: user._id,
          username: user.username,
          email: user.email,
        };
      }),
      groups: groupsWithDetails,
      expenses: expensesWithDetails,
      budgets: budgetsWithDetails,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
