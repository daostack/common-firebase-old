import admin from 'firebase-admin';

import { ISubscriptionEntity, Nullable } from '../../util/types';
import { Collections } from '../../util/constants';
import { CommonError } from '../../util/errors';

const db = admin.firestore();

/**
 *
 *
 * @param subscriptionId
 */
export const findSubscriptionById = async (subscriptionId: string): Promise<ISubscriptionEntity> => {
  const subscription = (await db.collection(Collections.Subscriptions)
    .doc(subscriptionId)
    .get()).data() as Nullable<ISubscriptionEntity>;

  if(!subscription) {
    throw new CommonError(`
      Cannot find subscription with id ${subscriptionId}
    `);
  }

  return subscription;
};