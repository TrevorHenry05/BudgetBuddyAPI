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

router.get("/", async (req, res) => {
  try {
    const expenses = await Expenses.find({ members: req.user._id });

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

module.exports = router;
