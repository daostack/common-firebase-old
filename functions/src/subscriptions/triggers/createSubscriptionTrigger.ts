import * as functions from 'firebase-functions';


import {db} from '../../settings';
import {IEventModel} from '../../event';
import {EVENT_TYPES} from '../../event/event';
import {ICardEntity, ICommonEntity, IProposalEntity, ISubscriptionEntity} from '../../util/types';
import {Collections} from '../../util/constants';
import {CommonError} from '../../util/errors';
import {Utils} from '../../util/util';
import { subscriptionService } from '../subscriptionService';

export const createSubscriptionsTrigger = functions.firestore
  .document('/events/{id}')
  .onCreate(async (snap) => {
    const event = snap.data() as IEventModel;

    // @todo Delete this
    console.log(`Created event ${event.type}`)

    if (event.type === EVENT_TYPES.APPROVED_REQUEST_TO_JOIN) {
      // @todo Delete this
      console.log(`Creating subscriptions`)

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