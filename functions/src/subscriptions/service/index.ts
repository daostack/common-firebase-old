import { chargeSubscription, chargeSubscriptionById } from './chargeSubscription';
import { chargeSubscriptions } from './chargeSubscriptions';

import { cancelSubscription } from './cancelSubscription';

export const subscriptionService = {
  chargeSubscription,
  chargeSubscriptionById,
  chargeSubscriptions,

  cancelSubscription
};