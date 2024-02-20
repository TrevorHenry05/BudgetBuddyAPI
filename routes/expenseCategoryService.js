const express = require("express");
const ExpenseCategory = require("../models/expenseCategory");

const router = express.Router();

// Get all expense categories
router.get("/", async (req, res, next) => {
  try {
    const expenseCategories = await ExpenseCategory.find({}).toArray();
    res.status(200).json(expenseCategories);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
