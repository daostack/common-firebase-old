import { ISubscriptionEntity } from '../types';
import { CommonError } from '../../util/errors';

import { EVENT_TYPES } from '../../event/event';
import { createSubscriptionPayment } from '../../circlepay/createSubscriptionPayment';
import { findSubscriptionById } from './findSubscriptionById';
import { createEvent } from '../../util/db/eventDbService';

/**
 * Charges one subscription (only if the due date is
 * today or in the past) by the subscription id
 *
 * @param subscriptionId - the id of the subscription, that we want to charge
 */
export const chargeSubscriptionById = async (subscriptionId: string): Promise<void> => {
  await chargeSubscription(
    await findSubscriptionById(subscriptionId)
  );
};

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
    if (subscription.dueDate > new Date()) {
      throw new CommonError(`Trying to charge subscription ${subscription.id}, but the due date is in the future!`, {
          subscription
        }
      );
    }

    await createSubscriptionPayment(subscription);

    await createEvent({
      userId: subscription.userId,
      objectId: subscription.id,
      type: EVENT_TYPES.SUBSCRIPTION_PAYMENT_CREATED
    });
  } catch (e) {
    console.error(new CommonError(`
      Payment for subscription (${subscription.id}) has failed!
    `));

    await createEvent({
      userId: subscription.userId,
      objectId: subscription.id,
      type: EVENT_TYPES.SUBSCRIPTION_PAYMENT_FAILED
    });
  }
};