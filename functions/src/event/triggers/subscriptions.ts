/**
 *
 * This is the place where the events related to subscriptions
 * are created. No logic should be placed here!
 *
 */

import * as functions from 'firebase-functions';

import {createEvent} from '../../db/eventDbService';
import {Collections} from '../../util/constants';
import {ISubscriptionEntity} from '../../util/types';
import {EVENT_TYPES} from '../event';

functions.firestore
  .document(`/${Collections.Subscriptions}/{id}`)
  .onCreate(async (snap) => {
    const subscription = snap.data() as ISubscriptionEntity;

    await createEvent({
      userId: subscription.userId,
      objectId: subscription.id,
      createdAt: new Date(),
      type: EVENT_TYPES.SUBSCRIPTION_CREATED
    });
  });