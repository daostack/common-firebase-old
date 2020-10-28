import admin from 'firebase-admin';

import { ISubscriptionEntity, ISubscriptionPayment } from '../../util/types';
import { CommonError } from '../../util/errors';

import { subscriptionService } from '../subscriptionService';
import { createEvent } from '../../db/eventDbService';
import { EVENT_TYPES } from '../../event/event';

const db = admin.firestore();

/**
 * Charges one subscription (only if the due date is
 * today or in the past) by the subscription id
 *
 * @param subscriptionId - the id of the subscription, that we want to charge
 */
export const chargeSubscriptionById = async (subscriptionId: string): Promise<void> => {
  await chargeSubscription(
    await subscriptionService
      .findSubscriptionById(subscriptionId)
  );
}

/**
 * Charges one subscription (only if the due date is
 * today or in the past) by the subscription entity
 *
 * @param subscription - the subscription entity
 */
export const chargeSubscription = async (subscription: ISubscriptionEntity): Promise<void> => {
  // @todo Remember to do something if the charge failed, cause the subscription will not be charged again from here!!!
  try {
    // Check if the due date is in the past
    if(subscription.dueDate > new Date()) {
      throw new CommonError(
        `Trying to charge subscription ${subscription.id}, but the due date is in the future!`,
        `Cannot charge your subscription`, {
          subscription
        }
      );
    }

    // const {payment} = await circlePayService.createSubscriptionPayment({
    //   type: 'SubscriptionPayment'
    // });

    // @todo Create payment

    const payment: ISubscriptionPayment = {
      paymentId: 'TestSubscriptionPayment',
      paymentStatus: 'Pending'
    }

    subscription.payments.push(payment);

    await subscriptionService.updateSubscription(subscription);

    await createEvent({
      userId: subscription.userId,
      objectId: subscription.id,
      createdAt: new Date(),
      type: EVENT_TYPES.SUBSCRIPTION_PAYMENT_CREATED
    });
  } catch (e) {
    console.error(new CommonError(`
      Payment for subscription (${subscription.id}) has failed!
    `));

    await createEvent({
      userId: subscription.userId,
      objectId: subscription.id,
      createdAt: new Date(),
      type: EVENT_TYPES.SUBSCRIPTION_PAYMENT_FAILED
    });
  }
};