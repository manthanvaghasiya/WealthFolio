const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const { protect } = require('../middleware/authMiddleware');

// 1. GET ALL
router.get('/', protect, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. ADD NEW
router.post('/', protect, async (req, res) => {
  try {
    const habit = await Habit.create({
      user: req.user.id,
      title: req.body.title,
      target: req.body.target || 21,
      completedDates: []
    });
    res.status(200).json(habit);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// 3. EDIT HABIT (The Route You Need!) ✏️
router.put('/:id', protect, async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ msg: 'Not found' });
    if (habit.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    habit.title = req.body.title || habit.title;
    habit.target = req.body.target || habit.target;

    await habit.save();
    res.json(habit);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 4. TOGGLE DATE (Check/Uncheck)
// 3. UPDATE Habit (Title & Goal) - ROBUST VERSION
router.put('/:id', protect, async (req, res) => {
  try {
    // 1. Check if habit exists and belongs to user
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ msg: 'Habit not found' });
    if (habit.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    // 2. Force Update
    const updatedHabit = await Habit.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        target: req.body.target
      },
      { new: true } // This tells MongoDB to return the NEW updated version
    );

    res.json(updatedHabit);
  } catch (err) {
    console.error(err); // Show error in Render logs
    res.status(500).json({ message: err.message });
  }
});

// 5. DELETE
router.delete('/:id', protect, async (req, res) => {
  try {
    await Habit.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;