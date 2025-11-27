const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'Please add a habit title']
  },
  // NEW: The Goal (e.g., 21 days, 30 days)
  target: {
    type: Number,
    default: 21 // Default goal is 21 days if not specified
  },
  // Stores completed dates like ["2023-11-27"]
  completedDates: {
    type: [String], 
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Habit', HabitSchema);