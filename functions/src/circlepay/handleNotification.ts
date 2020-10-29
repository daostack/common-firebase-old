import admin from 'firebase-admin';

import { ICircleNotification, IPaymentEntity } from '../util/types';
import { CommonError } from '../util/errors';
import { Collections } from '../util/constants';
import { saveSubscriptionPayment } from './createSubscriptionPayment';
import { subscriptionService } from '../subscriptions/subscriptionService';

const db = admin.firestore();

/**
 * Handles incoming CirclePay notification
 *
 * @param notification - the notification that we have received
 */
export const handleNotification = async (notification: ICircleNotification): Promise<void> => {
  if (notification.notificationType !== 'payments' || !notification.payment) {
    throw new CommonError(`
      Cannot handle notification that is not of type 'payments' 
      or does not have payment object!
    `, null, {
      notification,
      notificationString: JSON.stringify(notification)
    });
  }

  const paymentRef = await db.collection(Collections.Payments)
    .doc(notification.payment.id)
    .get();

  if (!paymentRef.exists) {
    throw new CommonError(`
      Cannot find payment with id ${notification.payment.id}
    `);
  }

  const paymentObj = paymentRef.data() as IPaymentEntity;

  if(paymentObj.type === 'SubscriptionPayment') {
    const subscription = await subscriptionService.findSubscriptionById(paymentObj.subscriptionId);

    const updateRes = await saveSubscriptionPayment(subscription, notification.payment);

    console.log(updateRes);

  } else {
    console.warn('Non subscription payments are not currently supported!');
  }
};