const models = require('../model.js');
const bignumber = require('bignumber.js');
module.exports = ({aid, price, ratio, good, address, phone, sex, birthday, guardian, isRequireTicket, ticketHead, card, count = 1, username, goodId, payChannel}) => {
  const orderNo = String(Date.now());
  const paymentAmount = new bignumber(count).multipliedBy(price).toNumber();
  console.log(paymentAmount, '<<<<<----下单付款金额')
  const order = {
    price,
    paymentAmount,
    agentProfit: ratio,
    good,
    count,
    address,
    phone,
    card,
    username,
    orderNo,
    goodNumber: goodId,
    sex, birthday, guardian, isRequireTicket, ticketHead,
    payChannel,
  }
  if (aid) {
    order.agent = aid
  }
  return new models.orders(order).save().then(() => orderNo)
}
