const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

// GET endpoint to fetch the authenticated user's profile
router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { password, ...userWithoutPassword } = user.toObject();
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

// PUT endpoint to update the authenticated user's profile
router.put("/profile", async (req, res) => {
  const { password, ...updates } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    Object.keys(updates).forEach((update) => {
      user[update] = updates[update];
    });

    if (password) {
      user.password = password;
    }

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE endpoint to delete the authenticated user's account
router.delete("/profile", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
