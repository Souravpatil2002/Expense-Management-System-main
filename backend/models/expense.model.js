const mongoose = require('mongoose');

// Define the Expense schema
const expenseSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, 'Expense description is required'],
        minlength: [3, 'Description must be at least 3 characters long']
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0, 'Total amount cannot be negative']
    },
    splitMethod: {
        type: String,
        enum: ['equal', 'exact', 'percentage'],
        required: [true, 'Split method is required'],
        default: 'equal' // Set default split method to 'equal'
    },
    participants: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Participant user ID is required']
        },
        amountOwed: {
            type: Number,
            required: [true, 'Amount owed by the participant is required'],
            min: [0, 'Amount owed cannot be negative']
        }
    }],
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Automatically create 'createdAt' and 'updatedAt' fields
});

// Create the Expense model from the schema
const Expense = mongoose.model('Expense', expenseSchema);

// Export the Expense model
module.exports = Expense;
