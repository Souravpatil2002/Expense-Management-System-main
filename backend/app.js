const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable Cross-Origin Resource Sharing

// MongoDB connection (Replace with your own MongoDB URI)
mongoose.connect('mongodb://localhost:27017/expenseSharingApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Mongoose schemas
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    mobile: String
});

const ExpenseSchema = new mongoose.Schema({
    description: String,
    totalAmount: Number,
    participants: [
        {
            userId: String,
            splitAmount: Number
        }
    ],
    splitMethod: String, // "equal", "exact", "percentage"
});

const User = mongoose.model('User', UserSchema);
const Expense = mongoose.model('Expense', ExpenseSchema);

// Routes

// Create User
app.post('/api/users', async (req, res) => {
    const { name, email, mobile } = req.body;
    try {
        const newUser = new User({ name, email, mobile });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
});

// Retrieve User Details
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error });
    }
});

// Add Expense
app.post('/api/expenses', async (req, res) => {
    const { description, totalAmount, participants, splitMethod } = req.body;
    try {
        const newExpense = new Expense({ description, totalAmount, participants, splitMethod });
        await newExpense.save();
        res.status(201).json({ message: 'Expense added successfully', expense: newExpense });
    } catch (error) {
        res.status(500).json({ message: 'Error adding expense', error });
    }
});

// Retrieve Individual User Expenses
app.get('/api/expenses/user/:userId', async (req, res) => {
    try {
        const expenses = await Expense.find({ 'participants.userId': req.params.userId });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving expenses', error });
    }
});

// Retrieve Overall Expenses
app.get('/api/expenses', async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving expenses', error });
    }
});

// Download Balance Sheet
app.get('/api/expenses/download', (req, res) => {
    // Here you can create a CSV or PDF file for download
    res.setHeader('Content-Disposition', 'attachment; filename=balance-sheet.txt');
    res.send('Balance sheet content goes here');
});

// Start the server and print the URL in the terminal
app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});
