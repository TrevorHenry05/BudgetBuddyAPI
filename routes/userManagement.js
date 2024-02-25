const express = require("express");
const User = require("../models/user");

const router = express.Router();

// GET endpoint to fetch the authenticated user's profile
router.get("/profile", async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password, ...userWithoutPassword } = user.toObject();
    res.json({
      _id: userWithoutPassword._id,
      username: userWithoutPassword.username,
      email: userWithoutPassword.email,
      isAdmin: userWithoutPassword.isAdmin,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/all", async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

// PUT endpoint to update the authenticated user's profile
router.put("/profile", async (req, res, next) => {
  const { password, email, username } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email is already in use." });
      }
      user.email = email;
    }

    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ message: "Username is already in use." });
      }
      user.username = username;
    }

    if (password) {
      user.password = password;
    }

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// DELETE endpoint to delete the authenticated user's account
router.delete("/profile", async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
