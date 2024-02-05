const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { hashPassword } = require('../utils/hashPassword');

const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await hashPassword(password);

    if (hashedPassword) {
        const newUser = new User({
            email: email,
            username: username,
            passwordHash: hashedPassword,
        });

        try {
            const savedUser = await newUser.save();
            res.status(201).send(savedUser);
        } catch (error) {
            res.status(500).send(error);
        }
    } else {
        res.status(500).send('Failed to hash password');
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });

    if (user) {
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (isMatch) {
            res.status(200).send('Login successful');
        } else {
            res.status(401).send('Invalid credentials');
        }
    } else {
        res.status(401).send('User not found');
    }
});


module.exports = router;