const mongoose = require('../db.config');
// 成本分类
const CostsCategory = new mongoose.Schema({
  title: {
    type: String,
    required: true
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

module.exports = mongoose.model('cost_categorys', CostsCategory);
