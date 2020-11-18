import { createEvent } from '../../db/eventDbService';
import { EVENT_TYPES } from '../../event/event';
import { ISubscriptionEntity } from '../types';

import { updateSubscription } from './updateSubscription';
import { revokeMembership } from './revokeMembership';

export enum CancellationReason {
  CanceledByUser = 'CanceledByUser',
  CanceledByPaymentFailure = 'CanceledByPaymentFailure'
}


/**
 * Cancel recurring payment so the user is not charged again. Does not revoke memberships!
 *
 * @param subscriptionId - the id of the subscription
 * @param cancellationReason - whether the user canceled or the payment has failed multiple times
 */
export const cancelSubscription = async (subscription: ISubscriptionEntity, cancellationReason: CancellationReason): Promise<void> => {
  subscription.status = cancellationReason;

  await updateSubscription(subscription);

  // If the subscription is canceled by payment failure we shoukd
  if(cancellationReason === CancellationReason.CanceledByPaymentFailure) {
    await revokeMembership(subscription);
  }

  await createEvent({
    userId: subscription.userId,
    objectId: subscription.id,
    createdAt: new Date(),
    type: cancellationReason === CancellationReason.CanceledByPaymentFailure
      ? EVENT_TYPES.SUBSCRIPTION_CANCELED_BY_PAYMENT_FAILURE
      : EVENT_TYPES.SUBSCRIPTION_CANCELED_BY_USER
  });
};