const { db } = require('../settings.js');
const COLLECTION_NAME = 'payments';
import { getPayment } from '../circlepay/circlepay';

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
      return reject({err: new Error('Exceeded max attempts'), payment: data});
    } else {
      setTimeout(executePoll, interval * 5, resolve, reject);
    }
  };

  return new Promise(executePoll);
}

/*
call this when?
if we call it right after payment was created,
and the user closes the app before payment status was updated,
then this polling function will never run again,
so we need to also call it when function is loaded?
 */
export const pollPaymentStatus = async (paymentId) => (
	polling({
      validate: (payment) => payment.status === 'confirmed',
      interval: 1000,
      paymentId
    })
      .then(async (payment) => {
        await updatePayment(payment.id, payment);
        console.log(payment.id);
      })
      .catch(async ({err, payment}) => {
        await updatePayment(payment.id, payment);
        console.error('error', err);
      })
);

export const updatePayment = async (paymentId, doc) => (
  await db.collection(COLLECTION_NAME)
    .doc(paymentId)
    .set(
        doc,
        {
            merge: true
        }
    )
)
