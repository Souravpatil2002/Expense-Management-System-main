const Expense = require('../models/expense.model');
const User = require('../models/user.model');

// Add Expense
exports.addExpense = async (req, res) => {
    try {
        const { description, totalAmount, splitMethod, participants } = req.body;

        // Validate participants and totalAmount
        if (!participants || participants.length === 0) {
            return res.status(400).json({ message: 'Participants are required' });
        }

        // Validate split method
        if (splitMethod === 'percentage') {
            const totalPercentage = participants.reduce((sum, p) => sum + p.percentage, 0);
            if (totalPercentage !== 100) {
                return res.status(400).json({ message: 'Percentages must add up to 100%' });
            }
        }

        // Create the expense
        const expense = new Expense({ description, totalAmount, splitMethod, participants });
        await expense.save();

        res.status(201).json({ message: 'Expense added successfully', expense });
    } catch (error) {
        res.status(500).json({ message: 'Error adding expense', error });
    }
};

// Get Expenses for a User
exports.getUserExpenses = async (req, res) => {
    try {
        const userId = req.params.userId;
        const expenses = await Expense.find({ 'participants.userId': userId });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user expenses', error });
    }
};

// Get All Expenses
exports.getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find().populate('participants.userId', 'name email');
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expenses', error });
    }
};

// Download Balance Sheet (example: export to CSV)
exports.downloadBalanceSheet = async (req, res) => {
    try {
        const userId = req.params.userId;
        const expenses = await Expense.find({ 'participants.userId': userId });

        let csvContent = 'Description,Total Amount,Owed Amount,Split Method,Date\n';
        expenses.forEach(expense => {
            const participant = expense.participants.find(p => p.userId == userId);
            csvContent += `${expense.description},${expense.totalAmount},${participant.amountOwed},${expense.splitMethod},${expense.date}\n`;
        });

        res.header('Content-Type', 'text/csv');
        res.attachment('balance-sheet.csv');
        res.send(csvContent);
    } catch (error) {
        res.status(500).json({ message: 'Error generating balance sheet', error });
    }
};
