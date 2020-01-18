const mongoose = require('../db.config');

const Cases = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'groups'
  },
  statu: {
    type: Number,
    default: 0
  },
  tester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  developer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  test: {
    type: Boolean,
    default: false
  },
  develop: {
    type: Boolean,
    default: false
  },
  creater: {
    type: mongoose.Schema.Types.ObjectId,
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

module.exports = mongoose.model('cases', Cases);
