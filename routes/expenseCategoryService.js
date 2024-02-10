const express = require("express");
const ExpenseCategory = require("../models/expenseCategory");

const router = express.Router();

router.get("", async (req, res) => {
  try {
    const expenseCategories = await ExpenseCategory.find({}).toArray();
    res.status(200).json(expenseCategories);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});
