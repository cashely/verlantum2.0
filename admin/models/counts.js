const mongoose = require('../db.config');

const Counts = new mongoose.Schema({
  fruit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'fruits',
    required: true
  },
  total: {
    type: Number,
    default: 0
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

module.exports = mongoose.model('counts', Counts);
