const express = require("express");
const Expense = require("../models/expense");

const router = express.Router();

router.get("/:groupId", async (req, res, next) => {
  const groupId = req.params.groupId;

  try {
    const expenses = await Expense.find({ groupId: groupId });
    res.status(200).json(expenses);
  } catch (error) {
    next(error);
  }
});

router.get("", async (req, res, next) => {
  try {
    const expenses = await Expense.find({ members: req.user._id });
    res.status(200).json(expenses);
  } catch (error) {
    next(error);
  }
});

router.post("", async (req, res, next) => {
  const { budgetId, amount, date, categoryId, description, groupId } = req.body;

  if (
    !amount ||
    !date ||
    !categoryId ||
    !description ||
    !budgetId ||
    !groupId
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const newExpense = new Expense({
      budgetId,
      amount,
      date,
      category: categoryId,
      description,
      userId: req.user._id,
      groupId: groupId || null,
    });

    await newExpense.save();
    res.status(201).json({
      message: "Expense created successfully",
      data: newExpense,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:expenseId", async (req, res, next) => {
  const { expenseId } = req.params;

  try {
    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json(expense);
  } catch (error) {
    next(error);
  }
});

router.put("/:expenseId", async (req, res, next) => {
  const { expenseId } = req.params;
  const { amount, date, category, description } = req.body;

  if (!amount || !date || !category || !description) {
    return res.status(400).json({
      message:
        "All fields are required: amount, date, category, and description.",
    });
  }

  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      { $set: { amount, date, category, description } },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({
      message: "Expense updated successfully",
      data: updatedExpense,
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
