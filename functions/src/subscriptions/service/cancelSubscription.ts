import { createEvent } from '../../db/eventDbService';
import { subscriptionService } from '../subscriptionService';
import { EVENT_TYPES } from '../../event/event';

export type CancellationReason = 'CanceledByUser' | 'CanceledByPaymentFailure';

/**
 * Cancel recurring payment so the user is not charged again
 *
 * @param subscriptionId - the id of the subscription
 * @param cancellationReason - whether the user canceled or the payment has failed multiple times
 */
export const cancelSubscription = async (subscriptionId: string, cancellationReason: CancellationReason): Promise<void> => {
  const subscription = await subscriptionService.findSubscriptionById(subscriptionId);

  subscription.status = cancellationReason;

  await subscriptionService.updateSubscription(subscription);

  await createEvent({
    userId: subscription.userId,
    objectId: subscription.id,
    createdAt: new Date(),
    type: cancellationReason === 'CanceledByPaymentFailure'
      ? EVENT_TYPES.SUBSCRIPTION_CANCELED_BY_PAYMENT_FAILURE
      : EVENT_TYPES.SUBSCRIPTION_CANCELED_BY_USER
  });
};