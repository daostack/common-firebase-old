import * as functions from 'firebase-functions';

import { EVENT_TYPES } from '../../event/event';
import { IEventModel } from '../../event';
import { createSubscription } from '../business';
import { getProposal } from '../../proposals/database/getProposal';
import { IJoinRequestProposal } from '../../proposals/proposalTypes';

/**
 * This trigger is executed on all proposal approval and is used
 * to create subscription for the approved proposals in commons, that
 * use monthly payments
 */
export const createSubscriptionsTrigger = functions.firestore
  .document('/events/{id}')
  .onCreate(async (snap) => {
    const event = snap.data() as IEventModel;

    if (event.type === EVENT_TYPES.REQUEST_TO_JOIN_ACCEPTED) {
      const proposal = (await getProposal(event.objectId));

      // @todo Fix
      if ((proposal as IJoinRequestProposal).join.fundingType === 'monthly') {
        await createSubscription(proposal);
      }
    }
  });