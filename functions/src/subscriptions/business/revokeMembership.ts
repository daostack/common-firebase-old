import { ISubscriptionEntity } from '../types';
import { IUserEntity } from '../../util/types';
import { Utils } from '../../util/util';
import { EVENT_TYPES } from '../../event/event';

import { updateSubscription } from './updateSubscription';
import { createEvent } from '../../util/db/eventDbService';

export const revokeMembership = async (subscription: ISubscriptionEntity): Promise<void> => {
  // @todo Not cool. Rework
  const user = await Utils.getUserById(subscription.userId) as IUserEntity;

  // @todo

  subscription.revoked = true;

  await updateSubscription(subscription);

  await createEvent({
    userId: subscription.userId,
    objectId: subscription.id,
    type: EVENT_TYPES.MEMBERSHIP_REVOKED
  });
}