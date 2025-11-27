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
  // We store an array of strings like ["2023-11-27", "2023-11-28"]
  completedDates: {
    type: [String], 
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Habit', HabitSchema);