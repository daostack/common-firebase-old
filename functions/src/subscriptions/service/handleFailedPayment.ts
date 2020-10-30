import { ISubscriptionEntity } from '../types';
import { IPaymentEntity } from '../../util/types';
import { CommonError } from '../../util/errors';
import { subscriptionService } from '../subscriptionService';

/**
 * Handles update for the subscription document on payment failure
 *
 * @param subscription - The subscription that we want to update
 * @param payment - The failed payment
 *
 * @throws { CommonError } - If the subscription status is not 'Active' or 'PaymentFailed'
 */
export const handleFailedPayment = async (subscription: ISubscriptionEntity, payment: IPaymentEntity): Promise<void> => {
  const failedPayment = {
    paymentStatus: payment.status,
    paymentId: payment.id
  };

  if (subscription.status === 'Active') {
    subscription.status = 'PaymentFailed';
    subscription.paymentFailures = [failedPayment];
  } else if (subscription.status === 'PaymentFailed') {
    subscription.paymentFailures.push(failedPayment);
  } else {
    throw new CommonError(`
      Payment failed for unsupported payment status (${subscription.status}) 
      for subscription with id ${subscription.id}
    `);
  }

  await subscriptionService.updateSubscription(subscription);
};