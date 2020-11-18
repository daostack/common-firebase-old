import { getSubscription } from './getSubscription';
import { updateSubscription } from './updateSubscription';
import { db } from '../../util';
import { Collections } from '../../constants';
import { addSubscription } from './addSubscription';

export const subscriptionsCollection = db.collection(Collections.Subscriptions);

export const subscriptionDb = {
  addSubscription,
  getSubscription,
  updateSubscription
};