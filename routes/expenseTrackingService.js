const express = require("express");
const Expense = require("../models/expense");
const User = require("../models/user");
const Group = require("../models/group");
const ExpenseCategory = require("../models/expenseCategory");

const router = express.Router();

//GET EXPENSE BY GROUP ID
router.get("/group/:groupId", async (req, res, next) => {
  const groupId = req.params.groupId;

  try {
    const expenses = await Expense.find({ groupId: groupId });
    res.status(200).json(expenses);
  } catch (error) {
    next(error);
  }
});

//GET EXPENSES BY USER ID
router.get("/user", async (req, res, next) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id });
    res.status(200).json(expenses);
  } catch (error) {
    next(error);
  }
});

//CREATE NEW EXPENSE DOCUMENT
router.post("", async (req, res, next) => {
  const { amount, date, categoryId, description, groupId, budgetId } = req.body;

  if (!amount || !date || !categoryId || !description || !budgetId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const newExpense = new Expense({
      amount,
      date,
      categoryId: categoryId,
      description,
      budgetId,
      userId: req.user._id,
      groupId: groupId || null,
    });

    await newExpense.save();
    res.status(201).json({
      message: "Expense created successfully",
      data: {
        _id: newExpense._id,
        amount: newExpense.amount,
        date: newExpense.date,
        description: newExpense.description,
        budgetId: newExpense.budgetId,
        groupId: newExpense.groupId,
        categoryId: newExpense.categoryId,
      },
    });
  } catch (error) {
    next(error);
  }
});

//GET EXPENSE BY EXPENSE ID
router.get("/:expenseId", async (req, res, next) => {
  const { expenseId } = req.params;

  try {
    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const user = await User.findById(expense.userId).select("-password");
    const group = expense.groupId
      ? await Group.findById(expense.groupId)
      : null;
    const category = await ExpenseCategory.findById(expense.categoryId);

    res.status(200).json({
      _id: expense._id,
      amount: expense.amount,
      date: expense.date,
      description: expense.description,
      budgetId: expense.budgetId,
      group: group ? { _id: group._id, groupName: group.groupName } : null,
      category: category ? { categoryName: category.categoryName } : null,
      user: user
        ? { _id: user._id, username: user.username, email: user.email }
        : null,
    });
  } catch (error) {
    next(error);
  }
});

//UPDATE EXPENSE
router.put("/:expenseId", async (req, res, next) => {
  const { expenseId } = req.params;
  const { amount, date, categoryId, description } = req.body;

  if (!amount || !date || !categoryId || !description) {
    return res.status(400).json({
      message:
        "All fields are required: amount, date, category, and description.",
    });
  }

  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      { $set: { amount, date, categoryId, description } },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({
      message: "Expense updated successfully",
      data: {
        _id: updatedExpense._id,
        amount: updatedExpense.amount,
        date: updatedExpense.date,
        description: updatedExpense.description,
        budgetId: updatedExpense.budgetId,
        groupId: updatedExpense.groupId,
        categoryId: updatedExpense.categoryId,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:expenseId", async (req, res, next) => {
  const { expenseId } = req.params;

  try {
    const result = await Expense.findByIdAndDelete(expenseId);

    if (!result) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
