const express = require("express");
const jwt = require("jsonwebtoken");
const Expenses = require("../models/expense");

const router = express.Router();

router.get("/:groupId", async (req, res) => {
  const groupId = req.params.groupId;
  const groupId = req.params.groupId;

  try {
    Expenses.find({ groupId: groupId }).toArray((error, result) => {
      if (error) {
        res.status(500).send(error.toString());
      } else {
        res.status(200).json(result);
      }
    });
  } catch (error) {
    res.status(500).send(error.toString());
  }
  try {
    Expenses.find({ groupId: groupId }).toArray((error, result) => {
      if (error) {
        res.status(500).send(error.toString());
      } else {
        res.status(200).json(result);
      }
    });
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

router.get("", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).send("Access Denied / Unauthorized request");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const expenses = await Expenses.find({ members: decoded.userId });

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

router.post("", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

  try {
    if (token) {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      if (!verified) {
        return res.status(401).send("Access Denied / Unauthorized request");
      }

      const newExpense = new Expenses({
        amount: req.body.amount,
        date: req.body.date,
        category: req.body.category,
        description: req.body.description,
        userId: verified.userId,
        groupId: req.body.groupId,
      });

      await newExpense.save();
      res.status(201).json({
        message: "Expense created successfully",
        data: newBudget,
      });
    } else {
      const newExpense = new Expenses({
        amount: req.body.amount,
        date: req.body.date,
        category: req.body.category,
        description: req.body.description,
        userId: null,
        groupId: null,
      });

      await newExpense.save();
      res.status(201).json({
        message: "Expense created successfully",
        data: newBudget,
      });
    }
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

router.get("/:expenseId", async (req, res) => {
  const { expenseId } = req.params;

  try {
    const expense = await Group.findById(expenseId);

    if (expense) {
      res.status(200).json(expense);
    } else {
      res.status(404).send("Expense not found");
    }
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

router.put("/:expenseId", async (req, res) => {
  const { expenseId } = req.params;
  const { amount, date, category, description, userId, groupId } = req.body;

  if (!amount || !date || !category || !description || !userId) {
    return res.status(400).json({
      message: "amount, date, category, description, and userId are required.",
    });
  }

  const updateObj = {
    amount,
    date,
    category,
    description,
    userId,
    groupId,
  };

  try {
    const updatedGroup = await Expenses.findByIdAndUpdate(
      expenseId,
      { $set: updateObj },
      { new: true }
    );
    res.status(200).json({
      message: "expense updated successfully",
      data: updatedGroup,
    });
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

router.delete("/:expenseId", async (req, res) => {
  const expenseId = req.params.budgetId;

  try {
    Expenses.findByIdAndDelete(expenseId);
    res.status(200).send("Expense deleted successfully");
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

module.exports = router;
