import { chargeSubscription, chargeSubscriptionById } from './service/chargeSubscription';
import { chargeSubscriptions } from './service/chargeSubscriptions';

import { cancelSubscription } from './service/cancelSubscription';
import { findSubscriptionById } from './service/findSubscriptionById';
import { updateSubscription } from './service/updateSubscription';

export const subscriptionService = {
  chargeSubscription,
  chargeSubscriptionById,
  chargeSubscriptions,

  cancelSubscription,

  findSubscriptionById,

  updateSubscription
};