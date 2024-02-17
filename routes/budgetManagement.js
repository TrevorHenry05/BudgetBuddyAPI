const express = require("express");
const Budget = require("../models/budget");

const router = express.Router();

// Create a new budget
router.post("/", async (req, res) => {
  const newBudget = new Budget({
    totalBudget: req.body.totalBudget,
    purpose: req.body.purpose,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    userId: req.user._id,
    groupId: req.body.groupId || null,
    budgetType: req.body.budgetType,
    expenses: [],
  });

  try {
    await newBudget.save();
    res.status(201).json({
      message: "Budget created successfully",
      data: newBudget,
    });
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

// Get budgets by userId
router.get("/user", async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id });
    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

// Get budgets by groupId
router.get("/group/:groupId", async (req, res) => {
  const { groupId } = req.params;
  try {
    const budgets = await Budget.find({ groupId: groupId });
    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

// Get a specific budget by budgetId
router.get("/:budgetId", async (req, res) => {
  const { budgetId } = req.params;
  try {
    const budget = await Budget.findById(budgetId);
    if (!budget) {
      return res.status(404).send("Budget not found");
    }
    res.status(200).json(budget);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

// Update a specific budget by budgetId
router.put("/:budgetId", async (req, res) => {
  const { budgetId } = req.params;
  try {
    const updatedBudget = await Budget.findByIdAndUpdate(budgetId, req.body, {
      new: true,
    });
    if (!updatedBudget) {
      return res.status(404).send("Budget not found");
    }
    res.status(200).json({
      message: "Budget updated successfully",
      data: updatedBudget,
    });
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

// Delete a specific budget by budgetId
router.delete("/:budgetId", async (req, res) => {
  const { budgetId } = req.params;
  try {
    const deletedBudget = await Budget.findByIdAndDelete(budgetId);
    if (!deletedBudget) {
      return res.status(404).send("Budget not found");
    }
    res.status(200).send("Budget deleted successfully");
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

// Get all budgets
router.get("/", async (req, res) => {
  try {
    const budgets = await Budget.find({});
    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

module.exports = router;
