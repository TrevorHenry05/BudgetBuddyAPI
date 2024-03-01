const express = require("express");
const ExpenseCategory = require("../models/expenseCategory");

const router = express.Router();

// Get all expense categories
router.get("/all", async (req, res, next) => {
  try {
    const expenseCategories = await ExpenseCategory.find(
      {},
      "_id categoryName"
    );
    res.status(200).json(expenseCategories);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
