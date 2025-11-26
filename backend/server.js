// File: backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { protect } = require('./middleware/authMiddleware');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// --- ROUTES ---
app.use('/api/auth', require('./routes/auth')); // <--- NEW AUTH ROUTE

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

// --- TRANSACTION ROUTES (Old routes kept for now) ---
app.get('/api/transactions', async (req, res) => {
  const transactions = await Transaction.find().sort({ date: -1 });
  res.status(200).json(transactions);
});

app.post('/api/transactions', async (req, res) => {
  try {
    const { title, amount, type, category, date } = req.body;
    const transaction = await Transaction.create({ title, amount, type, category, date });
    res.status(201).json(transaction);
  } catch (err) {
    res.status(400).json({ error: 'Error adding transaction' });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ error: 'Not found' });
    await transaction.deleteOne();
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// --- PROTECTED TRANSACTION ROUTES ---

// 1. GET User's Transactions (Only show MY data)
app.get('/api/transactions', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// 2. ADD Transaction (Tag it with MY ID)
app.post('/api/transactions', protect, async (req, res) => {
  try {
    const { title, amount, type, category, date } = req.body;
    
    const transaction = await Transaction.create({
      user: req.user.id, // <--- Attach User ID
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

// 3. DELETE Transaction (Check if it's MY data)
app.delete('/api/transactions/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) return res.status(404).json({ error: 'Not found' });

    // Ensure user owns the transaction
    if (transaction.user.toString() !== req.user.id) {
        return res.status(401).json({ error: 'User not authorized' });
    }

    await transaction.deleteOne();
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// ... (Server listen code remains the same)
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});