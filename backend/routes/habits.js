const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const { protect } = require('../middleware/authMiddleware');

// 1. GET all habits for the logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. ADD a new habit
router.post('/', protect, async (req, res) => {
  try {
    const habit = await Habit.create({
      user: req.user.id,
      title: req.body.title,
      completedDates: []
    });
    res.status(200).json(habit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. TOGGLE HABIT (Check/Uncheck for a specific date)
router.put('/:id/toggle', protect, async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    
    if (!habit) return res.status(404).json({ msg: 'Habit not found' });
    if (habit.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    const date = req.body.date; // Expecting "2023-11-27"

    // Logic: If date exists, remove it (Uncheck). If not, add it (Check).
    if (habit.completedDates.includes(date)) {
      habit.completedDates = habit.completedDates.filter(d => d !== date);
    } else {
      habit.completedDates.push(date);
    }

    await habit.save();
    res.json(habit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. DELETE Habit
router.delete('/:id', protect, async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ msg: 'Habit not found' });
    if (habit.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    await habit.deleteOne();
    res.json({ msg: 'Habit removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;