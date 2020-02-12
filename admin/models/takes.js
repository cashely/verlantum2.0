const mongoose = require('../db.config');

const Takes = new mongoose.Schema({
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'agents',
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  creater: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'users'
  },
  mark: {
    type: String
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

module.exports = mongoose.model('takes', Takes);
