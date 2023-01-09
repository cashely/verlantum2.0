/**
 * 发票
 */
 const models = require('../model.js');
 const moment = require('moment');
 const excel = require('../functions/excel');

 module.exports = [
  {
    uri: '/list',
    method: 'get',
    mark: '查询发票列表',
    callback: async (req, res) => {
     const { page = 1, pageSize = 20, date = [], orderNo, status, orderDate = [] } = req.query;
     let formatDate = date.map(item => {
       return moment(JSON.parse(item)).format();
     });
     let conditions = {};
     
     let formatOrderDate = orderDate.map(item => {
        return moment(JSON.parse(item)).format();
      })
     
     if(formatDate[0]) {
       conditions.createdAt = { $gte: new Date(moment(formatDate[0]).format('YYYY-MM-DD 00:00:00'))}
       if(formatDate[1]) {
         conditions.createdAt = { $gte: new Date(moment(formatDate[0]).format('YYYY-MM-DD 00:00:00')), $lte: new Date(moment(formatDate[1]).format('YYYY-MM-DD 23:59:59'))}
       }
     }
     
     if (formatOrderDate[0]) {
        const orderConditions = {
          createdAt: {
            $gte: new Date(moment(formatOrderDate[0]).format('YYYY-MM-DD 00:00:00'))
          }
        };
        if (formatOrderDate[1]) {
          orderConditions.createdAt = {
            $gte: new Date(moment(formatDate[0]).format('YYYY-MM-DD 00:00:00')),
            $lte: new Date(moment(formatDate[1]).format('YYYY-MM-DD 23:59:59')),
          }
        }
        const orders = await models.orders.find(orderConditions);
        conditions.orderId = { $in: orders.map(({ _id }) => _id) };
      }
     
     if (typeof status !== 'undefined') {
      conditions.status = status;
     }

     if (orderNo) {
      const orderInfo = await models.orders.findOne({ orderNo });
      conditions.orderId = orderInfo._id;
    }
     models.tickets.find(conditions).populate({ path: 'orderId', populate: { path: 'goodNumber' }}).sort({ _id: -1 }).skip((page - 1) * pageSize).limit(+pageSize).then(tickets => {
       req.response(200, tickets)
     }).catch(err => {
       req.response(500, err)
     })
    }
  },
  {
    uri: '/apply/:orderId',
    method: 'get',
    callback(req, res) {
      const { orderId } = req.params;
      res.render('ticket', { orderId })
    }
  },
  {
    uri: '/list/count',
    method: 'get',
    mark: '统计发票数量',
    callback: async (req, res) => {
      const { date = [], orderNo, status, orderDate = [] } = req.query;
      let formatDate = date.map(item => {
        return moment(JSON.parse(item)).format();
      });
      let conditions = {};
     
      let formatOrderDate = orderDate.map(item => {
        return moment(JSON.parse(item)).format();
      });
     
      if(formatDate[0]) {
        conditions.createdAt = { $gte: new Date(moment(formatDate[0]).format('YYYY-MM-DD 00:00:00'))}
        if(formatDate[1]) {
          conditions.createdAt = { $gte: new Date(moment(formatDate[0]).format('YYYY-MM-DD 00:00:00')), $lte: new Date(moment(formatDate[1]).format('YYYY-MM-DD 23:59:59'))}
        }
      }
     
      if (formatOrderDate[0]) {
        const orderConditions = {
          createdAt: {
            $gte: new Date(moment(formatOrderDate[0]).format('YYYY-MM-DD 00:00:00'))
          }
        };
        if (formatOrderDate[1]) {
          orderConditions.createdAt = {
            $gte: new Date(moment(formatDate[0]).format('YYYY-MM-DD 00:00:00')),
            $lte: new Date(moment(formatDate[1]).format('YYYY-MM-DD 23:59:59')),
          }
        }
        const orders = await models.orders.find(orderConditions);
        conditions.orderId = { $in: orders.map(({ _id }) => _id) };
      }
     
      if (typeof status !== 'undefined') {
       conditions.status = status;
      }
     
      if (orderNo) {
        const orderInfo = await models.orders.findOne({ orderNo });
        conditions.orderId = orderInfo._id;
      }
      models.tickets.count(conditions).then(count => {
        req.response(200, count)
      }).catch(err => {
        req.response(500, err)
      })
    }
  },
  {
    uri: '/:_id',
    method: 'put',
    mark: '修改发票信息',
    async callback(req, res) {
      const { _id } = req.params;
      const params = req.body;
      try {
        await models.tickets.findOneAndUpdate({ _id }, params)
        req.response(200, 'ok')
      } catch (e) {
        req.response(500, e);
      }

    }
  },
  {
    uri: '/excel/:filename',
    method: 'get',
    mark: '导出开票列表',
    async callback(req, res) {
     let { date = [], orderNo, status, orderDate = [] } = req.query;
     if (typeof date === 'string') {
       date = JSON.parse(date);
     }
     
     if (typeof orderDate === 'string') {
       orderDate = JSON.parse(orderDate);
     }
     
     status = JSON.parse(status)

     orderNo = JSON.parse(orderNo);

     let formatDate = date.map(item => {
       return moment(item).format();
     });
     
     let formatOrderDate = orderDate.map(item => {
       return moment(item).format();
     });
     
     let conditions = {};

     if(formatDate[0]) {
       conditions.createdAt = { $gte: new Date(moment(formatDate[0]).format('YYYY-MM-DD 00:00:00'))}
       if(formatDate[1]) {
         conditions.createdAt = { $gte: new Date(moment(formatDate[0]).format('YYYY-MM-DD 00:00:00')), $lte: new Date(moment(formatDate[1]).format('YYYY-MM-DD 23:59:59'))}
       }
     }
     
     if (formatOrderDate[0]) {
       const orderConditions = {
         createdAt: {
           $gte: new Date(moment(formatOrderDate[0]).format('YYYY-MM-DD 00:00:00'))
         }
       };
       if (formatOrderDate[1]) {
         orderConditions.createdAt = {
           $gte: new Date(moment(formatDate[0]).format('YYYY-MM-DD 00:00:00')),
           $lte: new Date(moment(formatDate[1]).format('YYYY-MM-DD 23:59:59')),
         }
       }
       const orders = await models.orders.find(orderConditions);
       conditions.orderId = { $in: orders.map(({ _id }) => _id) };
     }
     
     if (typeof status !== 'undefined') {
      conditions.status = status;
     }

     if (orderNo) {
      const orderInfo = await models.orders.findOne({ orderNo });
      conditions.orderId = orderInfo._id;
    }

     models.tickets.find(conditions).populate({ path: 'orderId', populate: { path: 'goodNumber' }}).sort({_id: -1}).then(tickets => {

       const data = [['商品名称', '开票金额', '订单编号', '交易号', '订单时间', '发货状态', '付款状态', '开票类型', '开票人', '开票抬头', '电子邮箱', '是否已开票', '申请时间']].concat(tickets.map(ticket => ([
         ticket.orderId && ticket.orderId.goodNumber.title,
         ticket.amount / 100,
         ticket.orderId._id.toString(),
         ticket.orderId.orderNo,
         ticket.orderId.createdAt && moment(ticket.orderId.createdAt).format('YYYY-MM-DD HH:mm'),
         ticket.orderId.sended === 1 ? '已发货' : '未发货',
         ticket.orderId.hasPayed === 1 ? '已付款' : '未付款',
         ticket.type === 0 ? '个人' : '机构',
         ticket.name,
         ticket.head,
         ticket.email,
         ticket.isOffer ? '是' : '否',
         moment(ticket.createdAt).format('YYYY-MM-DD HH:mm:ss'),
       ])))
       const downloadPath = excel(data, req);
       res.download(downloadPath);
     }).catch(err => {
       req.response(500, err);
     })
   }
  }
 ];
