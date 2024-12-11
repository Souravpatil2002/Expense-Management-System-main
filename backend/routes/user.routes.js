const express = require('express');
const User = require('../models/user.model');
const router = express.Router();

// Create a new user
router.post('/', async (req, res) => {
    try {
        const { email, name, mobileNumber } = req.body;
        const newUser = new User({ email, name, mobileNumber });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get user details
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
