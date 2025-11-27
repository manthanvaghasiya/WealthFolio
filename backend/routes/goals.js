const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const { protect } = require('../middleware/authMiddleware');

// 1. GET ALL
router.get('/', protect, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ deadline: 1 });
    res.json(goals);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. ADD GOAL
router.post('/', protect, async (req, res) => {
  try {
    const { title, type, deadline } = req.body;
    const goal = await Goal.create({
      user: req.user.id,
      title,
      type,
      deadline
    });
    res.status(201).json(goal);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// 3. UPDATE GOAL
router.put('/:id', protect, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ msg: 'Goal not found' });
    if (goal.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    const updatedGoal = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedGoal);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 4. DELETE GOAL
router.delete('/:id', protect, async (req, res) => {
  try {
    const goal = await Goal.findByIdAndDelete(req.params.id);
    if (!goal) return res.status(404).json({ msg: 'Goal not found' });
    res.json({ msg: 'Goal removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;