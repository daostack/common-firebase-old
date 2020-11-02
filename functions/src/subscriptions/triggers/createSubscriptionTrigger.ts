import * as functions from 'firebase-functions';

import { ICommonEntity, IProposalEntity } from '../../util/types';
import { getDaoById } from '../../db/daoDbService';
import { CommonError } from '../../util/errors';
import { EVENT_TYPES } from '../../event/event';
import { IEventModel } from '../../event';
import { createSubscription } from '../business';
import { getProposalById } from '../../db/proposalDbService';

/**
 * This trigger is executed on all proposal approval and is used
 * to create subscription for the approved proposals in commons, that
 * use monthly payments
 */
export const createSubscriptionsTrigger = functions.firestore
  .document('/events/{id}')
  .onCreate(async (snap) => {
    const event = snap.data() as IEventModel;

    if (event.type === EVENT_TYPES.APPROVED_REQUEST_TO_JOIN) {
      // const proposal = (await db.collection(Collections.Proposals)
      //   .doc(event.objectId)
      //   .get()).data() as IProposalEntity;

      const proposal = (await getProposalById(event.objectId)).data() as IProposalEntity;

      // const common = (await db.collection(Collections.Commons)
      //   .doc(proposal.dao)
      //   .get()).data() as ICommonEntity;

      const common =  (await getDaoById(proposal.dao)).data() as ICommonEntity;

      if (!proposal || !common) {
        throw new CommonError(`Cannot find the proposal or common`, null, {
          common,
          proposal
        });
      }

      if (common.metadata.contribution === 'monthly') {
        await createSubscription(proposal);
      }
    }
  });