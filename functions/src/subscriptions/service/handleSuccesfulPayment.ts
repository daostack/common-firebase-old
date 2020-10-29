import admin from 'firebase-admin';

import { ISubscriptionEntity } from '../types';
import { addMonth } from '../../util';
import { Collections } from '../../util/constants';
import { CommonError } from '../../util/errors';

const db = admin.firestore();

/**
 * Clears the state of the subscription and updates the due date on payment success
 *
 * @param subscription - The subscription to update
 */
export const handleSuccessfulPayment = async (subscription: ISubscriptionEntity): Promise<void> => {
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
  if(new Date(subscription.dueDate) < new Date()) {
    subscription.dueDate = addMonth(subscription.dueDate);
  } else {
    throw new CommonError(
      `Trying to update due date that is in the feature 
      for subscription with id (${subscription.id})! 
    `);
  }

  await db.collection(Collections.Subscriptions)
    .doc(subscription.id)
    .set(subscription);
};