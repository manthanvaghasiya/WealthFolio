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
  target: {
    type: Number,
    default: 21 // Default goal: 21 days
  },
  // Stores completed dates like ["2023-11-28", "2023-11-29"]
  completedDates: {
    type: [String], 
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Habit', HabitSchema);