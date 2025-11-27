// File: backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { protect } = require('./middleware/authMiddleware'); // Security Guard

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// --- ROUTES ---
app.use('/api/auth', require('./routes/auth'));

// Import Transaction Model
const Transaction = require('./models/Transaction');

// --- DATABASE CONNECTION ---
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// --- TRANSACTION ROUTES ---

// 1. GET User's Transactions
app.get('/api/transactions', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// 2. ADD Transaction
app.post('/api/transactions', protect, async (req, res) => {
  try {
    const { title, amount, type, category, date } = req.body;
    const transaction = await Transaction.create({
      user: req.user.id,
      title,
      amount,
      type,
      category,
      date
    });
    res.status(201).json(transaction);
  } catch (err) {
    res.status(400).json({ error: 'Error adding transaction' });
  }
});

// 3. EDIT Transaction (NEW FEATURE) ✏️
app.put('/api/transactions/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    // Check if transaction exists
    if (!transaction) return res.status(404).json({ error: 'Not found' });

    // Check if user owns it
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    // Update
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Return the new updated version
    );

    res.status(200).json(updatedTransaction);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// 4. DELETE Transaction
app.delete('/api/transactions/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ error: 'Not found' });
    if (transaction.user.toString() !== req.user.id) {
        return res.status(401).json({ error: 'Not authorized' });
    }
    await transaction.deleteOne();
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});