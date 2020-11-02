// const { db } = require('../settings.js');
// const COLLECTION_NAME = 'payments';
// const { getPayment } = require('../circlepay/circlepay');
// const { Utils } = require('../util/util');

import { getPayment } from '../circlepay/circlepay';
import { Utils } from '../util/util';
import { Collections } from '../util/constants';
import { db } from '../settings';
import firebase from 'firebase';
import DocumentReference = firebase.firestore.DocumentReference;
import { IPaymentEntity } from '../util/types';
import DocumentSnapshot = firebase.firestore.DocumentSnapshot;

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
};

const pollPaymentStatus = async (paymentData) => (
  polling({
    validate: (payment) => payment.status === 'confirmed',
    interval: 10000,
    paymentId: paymentData.id
  })
    .then(async (payment) => {
      return await updateStatus(paymentData.id, 'confirmed');
    })
    .catch(async ({error, payment}) => {
      console.error('Polling error', error);
      // burn user's rep
      return await updateStatus(paymentData.id, 'failed');
    })
);

const updateStatus = async (paymentId, status) => {
  const currentPayment = await Utils.getPaymentById(paymentId);

  currentPayment.status = status;

  // The await was missing. Is there a reasoning behind that?
  await updatePayment(paymentId, currentPayment);
};

export const updatePayment = async (paymentId, doc) => (
  await db.collection(Collections.Payments)
    .doc(paymentId)
    .set(
      doc,
      {
        merge: true
      }
    )
);

export const getPaymentSnapshot = async (paymentId: string): Promise<DocumentSnapshot<IPaymentEntity>> => (
  await db.collection(Collections.Payments)
    .doc(paymentId)
    .get() as unknown as DocumentSnapshot<IPaymentEntity>
);

module.exports = {
  updatePayment,
  pollPaymentStatus
};