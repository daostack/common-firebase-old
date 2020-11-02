import { burnToken } from '../../relayer/util/burnToken';
import { ISubscriptionEntity } from '../types';
import { IUserEntity } from '../../util/types';
import { Utils } from '../../util/util';
import { EVENT_TYPES } from '../../event/event';
import { createEvent } from '../../db/eventDbService';

import { updateSubscription } from './updateSubscription';

export const revokeMembership = async (subscription: ISubscriptionEntity): Promise<void> => {
  const user = await Utils.getUserById(subscription.userId) as IUserEntity;

  // @question Witch address should we use for burning the tokens (safe or etherium)?
  await burnToken(user.safeAddress);

  subscription.revoked = true;

  await updateSubscription(subscription);

  await createEvent({
    userId: subscription.userId,
    objectId: subscription.id,
    createdAt: new Date(),
    type: EVENT_TYPES.MEMBERSHIP_REVOKED
  });
}