import * as admin from 'firebase-admin';

import { ICardEntity, ISubscriptionEntity } from '../../util/types';
import { Collections } from '../../util/constants';
import { CommonError } from '../../util/errors';

const db = admin.firestore();

/**
 * Return the card, that is currently linked to the subscription
 *
 * @param subscriptionId - the id of the subscription for witch we want to get the card
 */
export const findCardBySubscriptionId = async (subscriptionId: string): Promise<ICardEntity> => {
  const subscription = (await db.collection(Collections.Subscriptions)
    .doc(subscriptionId)
    .get())
    .data() as ISubscriptionEntity;

  if(!subscription) {
    throw new CommonError(`Cannot find subscription with id ${subscriptionId}`);
  }

  const card = (await (db.collection(Collections.Cards).doc(subscription.cardId).get())).data();

  if(!card) {
    throw new CommonError(`Cannot get card for subscription with id ${subscriptionId}`);
  }

  return card;
}