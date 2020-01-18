const mongoose = require('../db.config');
const {getSha1} = require('../functions/helper');

let Users = new mongoose.Schema({
  acount: {
    type: String,
    required: true
  },
  password: {
    type: String
  },
  role: {
    type: Number,
    default: 0 // 0 普通角色  1 开发角色  2  测试角色   3  超级管理员
  },
  statu: {
    type: Number,
    default: 1 // 1 正常   2 异常
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});


Users = mongoose.model('users', Users);

Users.findOne().then(res => {
  if(!res) {
    console.log('系统还没有用户，初始化root用户，密码为root');
    new Users({
      acount: 'root',
      password: getSha1('root')
    }).save((err, res) => {
      if(!err) {
        console.log('初始化用户完毕!')
      }else {
        console.log(err)
      }
    })
  }
})

module.exports = Users
