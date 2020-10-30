import * as functions from 'firebase-functions';

import { ICommonEntity, IProposalEntity } from '../../util/types';
import { subscriptionService } from '../subscriptionService';
import { Collections } from '../../util/constants';
import { CommonError } from '../../util/errors';
import { EVENT_TYPES } from '../../event/event';
import { IEventModel } from '../../event';
import { db } from '../../settings';

export const createSubscriptionsTrigger = functions.firestore
  .document('/events/{id}')
  .onCreate(async (snap) => {
    const event = snap.data() as IEventModel;

    console.log('Approved!!!!');

    if (event.type === EVENT_TYPES.APPROVED_REQUEST_TO_JOIN) {
      const proposal = (await db.collection(Collections.Proposals)
        .doc(event.objectId)
        .get()).data() as IProposalEntity;

      const common = (await db.collection(Collections.Commons)
        .doc(proposal.dao)
        .get()).data() as ICommonEntity;

      if (!proposal || !common) {
        throw new CommonError(`Cannot find the proposal or common`, null, {
          common,
          proposal
        });
      }

      if (common.metadata.contribution === 'monthly') {
        await subscriptionService.createSubscription(proposal);
      }
    }
  });