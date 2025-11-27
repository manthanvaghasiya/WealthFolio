const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'Please add a goal title']
  },
  type: {
    type: String,
    enum: ['Long Term', 'Short Term'],
    default: 'Long Term'
  },
  deadline: {
    type: Date,
    required: [true, 'Please add a deadline']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Goal', GoalSchema);