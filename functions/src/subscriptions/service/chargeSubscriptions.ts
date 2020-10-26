import admin from 'firebase-admin';
import { QuerySnapshot } from '@google-cloud/firestore';

import { Collections } from '../../util/constants';
import { ISubscriptionEntity } from '../../util/types';

const db = admin.firestore();

export const chargeSubscriptions = async (): Promise<void> => {
  const subscriptionsDueToday = await db.collection(Collections.Subscriptions)
    .where('dueDate', '>=', new Date().setHours(0,0,0,0))
    .where('dueDate', '<=', new Date().setHours(23,59,59,999))
    .where('status', '==', 'Active')
    .get() as QuerySnapshot<ISubscriptionEntity>;

  for(const subscriptionDueToday of subscriptionsDueToday.docs) {
    const subscriptionEntity = subscriptionDueToday.data() as ISubscriptionEntity;

    console.info(`Charging subscription (${subscriptionEntity.id}) with $${subscriptionEntity.amount}`);
  }
};