const express = require('express');
const Expense = require('../models/expense.model');
const User = require('../models/user.model');
const router = express.Router();

// Add a new expense
router.post('/', async (req, res) => {
    try {
        const { description, totalAmount, splitMethod, participants } = req.body;
        let splitDetails = [];

        // Fetch users by their mobile numbers
        const users = await User.find({ mobileNumber: { $in: participants.map(p => p.mobileNumber) } });

        // Check if all participants are valid
        if (users.length !== participants.length) {
            return res.status(400).json({ message: 'Some participants are not valid.' });
        }

        // Create split details based on the split method
        if (splitMethod === 'equal') {
            const splitAmount = totalAmount / users.length;
            splitDetails = users.map(u => ({ userId: u._id, amountOwed: splitAmount }));
        } else if (splitMethod === 'exact') {
            splitDetails = participants.map(p => {
                const user = users.find(u => u.mobileNumber === p.mobileNumber);
                return { userId: user._id, amountOwed: p.amount };
            });
        } else if (splitMethod === 'percentage') {
            const totalPercent = participants.reduce((acc, p) => acc + p.percentage, 0);
            if (totalPercent !== 100) {
                return res.status(400).json({ message: 'Percentages must add up to 100%' });
            }
            splitDetails = participants.map(p => {
                const user = users.find(u => u.mobileNumber === p.mobileNumber);
                return { userId: user._id, amountOwed: (totalAmount * p.percentage) / 100 };
            });
        }

        // Create and save the new expense
        const newExpense = new Expense({ description, totalAmount, splitMethod, participants: splitDetails });
        await newExpense.save();
        res.status(201).json(newExpense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get individual user expenses
router.get('/user/:userId', async (req, res) => {
    try {
        const expenses = await Expense.find({ 'participants.userId': req.params.userId }).populate('participants.userId');
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all expenses (overall expenses)
router.get('/', async (req, res) => {
    try {
        const expenses = await Expense.find().populate('participants.userId');
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Download balance sheet (as JSON)
router.get('/download', async (req, res) => {
    try {
        const expenses = await Expense.find().populate('participants.userId');
        const balanceSheet = expenses.map(expense => ({
            description: expense.description,
            totalAmount: expense.totalAmount,
            participants: expense.participants.map(p => ({
                name: p.userId.name,
                amountOwed: p.amountOwed
            })),
            date: expense.createdAt // Use createdAt for the date
        }));

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=balance-sheet.json');
        res.send(JSON.stringify(balanceSheet, null, 2));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Export the router
module.exports = router;
