import { QuerySnapshot } from '@google-cloud/firestore';
import * as functions from 'firebase-functions';
import admin from 'firebase-admin';

import { Collections } from '../../util/constants';
import { ISubscriptionEntity } from '../types';
import { CommonError } from '../../util/errors';
import { revokeMembership } from '../business';

const db = admin.firestore();

exports.backup = functions.pubsub
  .schedule('0 22 * * *') // => every day at 22:00
  .onRun(async () => {
    console.info(`Beginning membership revoking for ${new Date().getDate()}`);

    // Only get the subscription cancelled by user, because the subscriptions
    // canceled by payment failure should already be revoked
    const subscriptions = await db.collection(Collections.Subscriptions)
      .where('dueDate', '<=', new Date().setHours(23, 59, 59, 999))
      .where('status', '==', 'CanceledByUser')
      .where('revoked', '==', false)
      .get() as QuerySnapshot<ISubscriptionEntity>;

    for (const subscriptionSnap of subscriptions.docs) {
      const subscription = subscriptionSnap.data() as ISubscriptionEntity;

      if (subscription.status === 'Active' || subscription.status === 'PaymentFailed') {
        console.error(
          new CommonError(`
            Trying to revoke subscription with status 
            (${subscription.status}) from the cron
          `)
        );
      } else {
        console.info(`Revoking membership for subscription with id ${subscription.id}`);

        // eslint-disable-next-line no-await-in-loop
        await revokeMembership(subscription);

        console.info(`Revoked membership ${subscription.id}`);
      }
    }

    console.info(`Memberships revoked successfully`);
  });