import { QuerySnapshot } from '@google-cloud/firestore';
import * as functions from 'firebase-functions';
import admin from 'firebase-admin';

import { Collections } from '../../util/constants';
import { ISubscriptionEntity } from '../types';
import { CommonError } from '../../util/errors';
import { chargeSubscription, revokeMembership } from '../business';
import { CancellationReason } from '../business/cancelSubscription';

const db = admin.firestore();

exports.backup = functions.pubsub
  .schedule('17 5 * * *') // => every day at 05:17 AM
  .onRun(async () => {

  });