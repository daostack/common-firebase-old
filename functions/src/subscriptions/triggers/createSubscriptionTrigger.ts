import * as functions from 'firebase-functions';


import {db} from '../../settings';
import {IEventModel} from '../../event';
import {EVENT_TYPES} from '../../event/event';
import {ICardEntity, ICommonEntity, IProposalEntity, ISubscriptionEntity} from '../../util/types';
import {Collections} from '../../util/constants';
import {CommonError} from '../../util/errors';
import {Utils} from '../../util/util';

functions.firestore
  .document('/events/{id}')
  .onCreate(async (snap) => {
    const event = snap.data() as IEventModel;

    if (event.type === EVENT_TYPES.APPROVED_REQUEST_TO_JOIN) {
      const proposal = (await db.collection(Collections.Proposals)
        .doc(event.objectId)
        .get()).data() as IProposalEntity;

      const common = (await db.collection(Collections.Commons)
        .doc(event.objectId)
        .get()).data() as ICommonEntity;

      if (!proposal || !common) {
        throw new CommonError(`Cannot find the proposal or common`, null, {
          common,
          proposal
        });
      }

      if (common.metadata.contribution === 'monthly') {
        const card = (await Utils.getCardByProposalId(proposal.id)) as ICardEntity;

        if (card) {
          throw new CommonError(
            `Cannot create subscription for proposal (${proposal.id}), because there is no card found!`
          );
        }

        const subscription: Omit<ISubscriptionEntity, 'id'> = {
          paymentIds: [],
          proposalId: proposal.id,
          userId: proposal.proposerId,
          cardId: card.id,
          // Using Date().getDate() to ignore the time
          dueDate: new Date(new Date().getDate()),

          amount: proposal.description.funding / 100,

          status: 'Active'
        };

        await db.collection(Collections.Subscriptions)
          .add(subscription);
      }
    }
  });