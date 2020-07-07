const db = require("../db");
const NAME = 'model.charge';
const mainLogger = require("../logger");
const logger = mainLogger.child({ label: NAME });

async function createCharge(user_id, charge, category) {
  const insertQuery = db('user_charges').insert({
    user_id,
    charge_id: charge.id,
    order_no:charge.order_no,
    amount: charge.amount,
    currency:charge.currency,
    category,
    charge_created: charge.created,
    status: 'PENDING'
  });
  return db.raw(`? ON CONFLICT DO NOTHING`, insertQuery);
}

async function handleChargeSucceededEvent(event) {
  const charge = event.data.object;
  logger.info(charge);
  return db('user_charges')
    .where({charge_id: charge.id})
    .update({
      status: 'PAID',
      charge_paied_at: charge.time_paid
    });
}
  
module.exports = {
  createCharge,
  handleChargeSucceededEvent,
};
  