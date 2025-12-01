const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add a number']
  },
  type: {
    type: String,
    enum: ['income', 'expense', 'transfer'], // Added 'transfer'
    required: true
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Bank', 'Investment'], // Added 'Investment'
    required: true
  },
  category: {
    type: String,
    required: true // For transfers, this will store the 'Destination' (e.g., "To Cash")
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);