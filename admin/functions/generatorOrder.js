const models = require('../model.js');
module.exports = ({aid, price, ratio, good, address, phone, sex, birthday, guardian, isRequireTicket, ticketHead, card, count = 1, username, goodId, payChannel}) => {
  const orderNo = String(Date.now());
  const paymentAmount = count * price;
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