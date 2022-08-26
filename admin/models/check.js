/*
** @name 检测列表
*/

const mongoose = require('../db.config');

const Check = new mongoose.Schema({
  // 检测编号
  boxNumber: {
    type: String,
    required: true
  },
  reportPath: { // 报告地址
    type: String,
  },
  // 用户id
  openId: {
    type: String,
  },
  mark: {
    type: String,
    required: true
  },
  // 姓名
  uname: {
    type: String,
  },
  // 性别
  sex: {
    type: String,
  },
  // 年龄
  age: {
    type: Number
  },
  // 省份证号
  passPortNumber: {
    type: String
  },
  // 采样日期
  checkDate: {
    type: Date,
  },
  // 手机号
  phone: {
    type: String
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

module.exports = mongoose.model('check', Check);
