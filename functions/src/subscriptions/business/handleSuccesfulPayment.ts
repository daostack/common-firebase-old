import admin from 'firebase-admin';
import Timestamp = admin.firestore.Timestamp;

import { addMonth } from '../../util';
import { CommonError } from '../../util/errors';

import { ISubscriptionEntity } from '../types';
import { subscriptionDb } from '../database';

const db = admin.firestore();

/**
 * Clears the state of the subscription and updates the due date on payment success
 *
 * @param subscription - The subscription to update
 *
 * @throws { CommonError } - If there is no subscription passed (or is null/undefined)
 * @throws { CommonError } - If the due date for the subscription is in the future
 */
export const handleSuccessfulSubscriptionPayment = async (subscription: ISubscriptionEntity): Promise<void> => {
  if (!subscription) {
    throw new CommonError(`
      Cannot handle successful payment without providing subscription object!
    `);
  }

  // The user may have canceled the subscription between the payment failure
  // so change this only if it explicitly set that the payment is failed
  if (subscription.status === 'PaymentFailed') {
    subscription.status = 'Active';
    subscription.paymentFailures = [];
  }

  // Update the date only if it is in the past (it should always be!)
  if(subscription.dueDate.toDate() < new Date()) {
    subscription.dueDate = Timestamp.fromDate(addMonth(subscription.dueDate));
  } else {
    throw new CommonError(
      `Trying to update due date that is in the future 
      for subscription with id (${subscription.id})! 
    `);
  }

  // await db.collection(Collections.Subscriptions)
  //   .doc(subscription.id)
  //   .set(subscription);
  await subscriptionDb.updateSubscription(subscription);
};