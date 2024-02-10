const express = require("express");
const jwt = require("jsonwebtoken");
const Budget = require("../models/budget");

const router = express.Router();

router.post("", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

  try {
    if (token) {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      if (!verified) {
        return res.status(401).send("Access Denied / Unauthorized request");
      }

      const newBudget = new Budget({
        totalBudget: req.body.totalBudget,
        purpose: req.body.purpose,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        userId: verified.userId,
        groupId: null,
        budgetType: req.body.budgetType,
        expenses: [],
      });

      await newBudget.save();
      res.status(201).json({
        message: "Budget created successfully",
        data: newBudget,
      });
    } else {
      const newBudget = new Budget({
        totalBudget: req.body.totalBudget,
        purpose: req.body.purpose,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        userId: null,
        groupId: req.body.groupId,
        budgetType: req.body.budgetType,
        expenses: [],
      });

      await newBudget.save();
      res.status(201).json({
        message: "Budget created successfully",
        data: newBudget,
      });
    }
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
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) {
      return res.status(401).send("Access Denied / Unauthorized request");
    }

    Budget.find({ userId: verified.userId }).toArray((error, result) => {
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

router.get("/:groupId", async (req, res) => {
  const groupId = req.params.groupId;

  try {
    Budget.find({ groupId: groupId }).toArray((error, result) => {
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

router.get("/:budgetId", async (req, res) => {
  const budgetId = req.params.budgetId;

  try {
    const budget = Budget.findById(budgetId);
    res.status(200).json(budget);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

router.put("/:budgetId", async (req, res) => {
  const budgetId = req.params.budgetId;

  try {
    const updatedBudget = Budget.findByIdAndUpdate(budgetId, req.body);
    res.status(200).json({
      message: "Budget updated successfully",
      data: updatedBudget,
    });
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

router.delete("/:budgetId", async (req, res) => {
  const budgetId = req.params.budgetId;

  try {
    Budget.findByIdAndDelete(budgetId);
    res.status(200).send("Budget deleted successfully");
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

module.exports = router;
