import admin from 'firebase-admin';

import { ISubscriptionEntity, Nullable } from '../../util/types';
import { Collections } from '../../util/constants';
import { CommonError } from '../../util/errors';

const db = admin.firestore();

/**
 * Finds subscription with type safety (throws error if no subscription is found)
 *
 * @param subscriptionId - The id of the subscription we want tp find
 */
export const findSubscriptionById = async (subscriptionId: Nullable<string>): Promise<ISubscriptionEntity> => {
  if (!subscriptionId) {
    throw new CommonError('Cannot get subscription without providing the id!');
  }

  const subscription = (await db.collection(Collections.Subscriptions)
    .doc(subscriptionId)
    .get()).data() as Nullable<ISubscriptionEntity>;

  if (!subscription) {
    throw new CommonError(`
      Cannot find subscription with id ${subscriptionId}
    `, null, {
      statusCode: 404
    });
  }

  return subscription;
};