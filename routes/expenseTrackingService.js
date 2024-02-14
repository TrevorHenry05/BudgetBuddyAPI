const express = require("express");
const jwt = require("jsonwebtoken");
const Expenses = require("../models/expense");

const router = express.Router();

router.get("/:groupId", async (req, res) => {
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
            groupId: req.body.groupId,
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
