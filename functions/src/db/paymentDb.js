const { db } = require('../settings.js');
const COLLECTION_NAME = 'payments';
const { getPayment } = require('../circlepay/circlepay');
const { Utils } = require('../util/util');
const { minterToken } = require('../relayer/util/minterToken')
const { updateDAOBalance } = require("../db/daoDbService");

const polling = async ({validate, interval, paymentId}) => {
	console.log('start polling');
	let attempts = 0;
	
	const executePoll = async (resolve, reject) => {
    console.log(`- poll #${attempts}`);
    const {data: {data}} = await getPayment(paymentId);
    attempts++;

    if (validate(data)) {
      return resolve(data);
    } else if (data.status === 'failed') {
      return reject({err: new Error('Payment failed'), payment: data});
    } else {
      return setTimeout(executePoll, interval * 2, resolve, reject);
    }
  };

  return new Promise(executePoll);
}

const pollPaymentStatus = async (paymentData, dao) => (
	polling({
      validate: (payment) => payment.status === 'confirmed',
      interval: 10000,
      paymentId: paymentData.id
    })
      .then(async (payment) => {
        //mint user's reputation
        return await updateStatus(paymentData.id, payment, 'confirmed', dao);
      })
      .catch(async ({error, payment}) => {
      	console.error('Polling error', error);
        return await updateStatus(paymentData.id, payment,'failed');
      })
);

const updateStatus = async(paymentId, payment, status, dao) => {
  let currentPayment = await Utils.getPaymentById(paymentId);
  currentPayment.status = status;
  updatePayment(paymentId, currentPayment);

   // minting amount here
  if (status === 'confirmed') {
    console.log(`Minting ${payment.amount.amount} tokens to ${dao}`)
    await minterToken(dao, payment.amount.amount)
    await updateDAOBalance(dao);
    //currentPayment.status = 'paid';
    //updatePayment(paymentId, currentPayment);
  }
}

const updatePayment = async (paymentId, doc) => (
  await db.collection(COLLECTION_NAME)
    .doc(paymentId)
    .set(
        doc,
        {
            merge: true
        }
    )
)

module.exports = {
  updatePayment,
  pollPaymentStatus
}