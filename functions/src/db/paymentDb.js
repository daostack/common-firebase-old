const { db } = require('../settings.js');
const COLLECTION_NAME = 'payments';
const { getPayment } = require('../circlepay/circlepay');


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
      setTimeout(executePoll, interval * 2, resolve, reject);
    }
  };

  return new Promise(executePoll);
}

const pollPaymentStatus = async (paymentId) => (
	polling({
      validate: (payment) => payment.status === 'confirmed',
      interval: 10000,
      paymentId
    })
      .then(async (payment) => {
        console.log(payment.id);
        return await updatePayment(payment.id, payment);
      })
      .catch(async ({error, payment}) => {
        await updatePayment(payment.id, payment);
        console.error('Polling error', error);
      })
);

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
  pollPaymentStatus,
  updatePayment
}