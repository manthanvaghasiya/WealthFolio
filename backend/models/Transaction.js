const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true }, // income, expense
  category: { type: String, required: true },
  
  // 👇 THIS IS THE IMPORTANT PART 👇
  paymentMode: { 
      type: String, 
      enum: ['Bank', 'Cash', 'BankToCash', 'CashToBank'], 
      default: 'Cash' 
  },
  bankName: { 
      type: String, 
      default: '' 
  },
  // 👆 -------------------------- 👆
  
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', TransactionSchema);