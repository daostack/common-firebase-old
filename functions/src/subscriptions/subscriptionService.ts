import { chargeSubscription, chargeSubscriptionById } from './service/chargeSubscription';
import { handleSuccessfulPayment } from './service/handleSuccesfulPayment';
import { findSubscriptionById } from './service/findSubscriptionById';
import { chargeSubscriptions } from './service/chargeSubscriptions';
import { handleFailedPayment } from './service/handleFailedPayment';
import { cancelSubscription } from './service/cancelSubscription';
import { updateSubscription } from './service/updateSubscription';
import { createSubscription } from './service/createSubscription';
import { revokeMembership } from './service/revokeMembership';

export const subscriptionService = {
  chargeSubscription,
  chargeSubscriptionById,
  chargeSubscriptions,
  cancelSubscription,
  findSubscriptionById,
  updateSubscription,
  createSubscription,
  handleFailedPayment,
  handleSuccessfulPayment,
  revokeMembership
};