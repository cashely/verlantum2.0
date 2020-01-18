const mongoose = require('../db.config');
// 成本明细
const CostsCategory = new mongoose.Schema({
  title: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'cost_categorys'
  },
  count: {
    type: Number,
    default: 0
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

module.exports = mongoose.model('cost_details', CostsCategory);
