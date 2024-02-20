const express = require("express");
const Budget = require("../models/budget");

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
    res.status(200).json(budget);
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
