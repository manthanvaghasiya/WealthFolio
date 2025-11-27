const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/authMiddleware');

// 1. GET User's Transactions
router.get('/', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// 2. ADD Transaction
router.post('/', protect, async (req, res) => {
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

// 3. UPDATE Transaction
router.put('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ error: 'Not found' });
    if (transaction.user.toString() !== req.user.id) return res.status(401).json({ error: 'Not authorized' });

    const updatedTransaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTransaction);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// 4. DELETE Transaction
router.delete('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ error: 'Not found' });
    if (transaction.user.toString() !== req.user.id) return res.status(401).json({ error: 'Not authorized' });

    await transaction.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;