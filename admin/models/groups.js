const mongoose = require('../db.config');

const Groups = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  creater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  system: {
    type: String
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

module.exports = mongoose.model('groups', Groups);
