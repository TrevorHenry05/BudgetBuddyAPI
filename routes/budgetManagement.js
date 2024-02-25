const express = require("express");
const Budget = require("../models/budget");
const Group = require("../models/group");
const User = require("../models/user");
const Expense = require("../models/expense");
const ExpenseCategory = require("../models/expenseCategory");

const router = express.Router();

// Create a new budget
router.post("/", async (req, res, next) => {
  const { totalBudget, purpose, startDate, endDate, budgetType } = req.body;

  if (!totalBudget || !purpose || !startDate || !endDate || !budgetType) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const newBudget = new Budget({
    totalBudget,
    purpose,
    startDate,
    endDate,
    userId: req.user._id,
    groupId: req.body.groupId || null,
    budgetType,
    expenses: [],
  });

  try {
    await newBudget.save();
    res
      .status(201)
      .json({ message: "Budget created successfully", data: newBudget });
  } catch (error) {
    next(error);
  }
});

// Get budgets by userId
router.get("/user", async (req, res, next) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id });
    res.status(200).json(budgets);
  } catch (error) {
    next(error);
  }
});

// Get budgets by groupId
router.get("/group/:groupId", async (req, res, next) => {
  const { groupId } = req.params;
  try {
    const budgets = await Budget.find({ groupId });
    res.status(200).json(budgets);
  } catch (error) {
    next(error);
  }
});

// Get a specific budget by budgetId
router.get("/:budgetId", async (req, res, next) => {
  const { budgetId } = req.params;
  try {
    const budget = await Budget.findById(budgetId);
    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    const user = await User.findById(budget.userId).select("-password");
    const group = budget.groupId ? await Group.findById(budget.groupId) : null;
    const expenses = await Expense.find({ budgetId: budget._id });
    const expensesWithDetails = await Promise.all(
      expenses.map(async (expense) => {
        const category = await ExpenseCategory.findById(expense.categoryId);
        const user = await User.findById(expense.userId).select("-password");
        const group = expense.groupId
          ? await Group.findById(expense.groupId)
          : null;
        return {
          _id: expense._id,
          amount: expense.amount,
          date: expense.date,
          description: expense.description,
          category: category ? { categoryName: category.categoryName } : null,
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

    res.status(200).json({
      _id: budget._id,
      totalBudget: budget.totalBudget,
      purpose: budget.purpose,
      startDate: budget.startDate,
      endDate: budget.endDate,
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
    });
  } catch (error) {
    next(error);
  }
});

// Update a specific budget by budgetId
router.put("/:budgetId", async (req, res, next) => {
  const { budgetId } = req.params;
  const { totalBudget, purpose, startDate, endDate } = req.body;

  if (!totalBudget || !purpose || !endDate || !startDate) {
    return res.status(400).json({ message: "All fields are required." });
  }
  try {
    const updatedBudget = await Budget.findByIdAndUpdate(
      budgetId,
      { totalBudget, purpose, startDate, endDate },
      {
        new: true,
      }
    );
    if (!updatedBudget) {
      return res.status(404).send({ message: "Budget not found" });
    }
    res.status(200).json({
      message: "Budget updated successfully",
      data: updatedBudget,
    });
  } catch (error) {
    next(error);
  }
});

// Delete a specific budget by budgetId
router.delete("/:budgetId", async (req, res, next) => {
  const { budgetId } = req.params;
  try {
    const deletedBudget = await Budget.findByIdAndDelete(budgetId);
    if (!deletedBudget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    await Expense.deleteMany({ budgetId: deletedBudget._id });

    res.status(200).json({ message: "Budget deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// Get all budgets
router.get("/", async (req, res, next) => {
  try {
    const budgets = await Budget.find({});
    res.status(200).json(budgets);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
