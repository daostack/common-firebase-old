import admin from 'firebase-admin';

import { ISubscriptionEntity } from '../../util/types';
import { Collections } from '../../util/constants';

const db = admin.firestore()

export const updateSubscription = async (subscription: ISubscriptionEntity, subscriptionId?: string): Promise<void> => {
  await db.collection(Collections.Subscriptions)
    .doc(subscriptionId || subscription.id)
    .update(subscription);
};