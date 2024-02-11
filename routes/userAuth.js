const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { hashPassword } = require("../utils/hashPassword");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    const hashedPassword = await hashPassword(password);
    if (hashedPassword) {
      const newUser = new User({
        email: email,
        username: username,
        passwordHash: hashedPassword,
        isAdmin: false,
      });

      await newUser.save();
      res.status(201).send("User created successfully");
    } else {
      res.status(500).send("Failed to hash password");
    }
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });

  if (user && (await bcrypt.compare(password, user.passwordHash))) {
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET
    );

    res.status(200).json({ token: token, message: "Login successful" });
  } else {
    res.status(401).send("Invalid credentials");
  }
});

router.get("", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).send("Access Denied / Unauthorized request");
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-passwordHash");

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.json(user);
  } catch (error) {
    res.status(400).send("Invalid token");
  }
});

module.exports = router;
