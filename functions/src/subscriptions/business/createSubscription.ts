import { v4 } from 'uuid';

import { db } from '../../settings';

import { Utils } from '../../util/util';
import { CommonError } from '../../util/errors';
import { Collections } from '../../util/constants';
import { createSubscriptionPayment } from '../../circlepay/createSubscriptionPayment';
import { IProposalEntity } from '../../proposals/proposalTypes';
import { ISubscriptionEntity } from '../types';
import { commonDb } from '../../common/database';
import { ICardEntity } from '../../util/types';


/**
 * Creates subscription based on proposal
 *
 * @param proposal - The proposal for which we want to create the subscription
 *
 * @throws { CommonError } - If the proposal is not provided
 * @throws { CommonError } - If the card, assigned to the proposal, is not found
 */
export const createSubscription = async (proposal: IProposalEntity): Promise<ISubscriptionEntity> => {
  if(!proposal || !proposal.id) {
    throw new CommonError('Cannot create subscription without proposal')
  }

  if(proposal.type !== 'join') {
    throw new CommonError('Cannot create subscription for proposals that are not join proposals', {
      proposal
    });
  }

  // ---- @todo Extract that

  const card = (await Utils.getCardByProposalId(proposal.id)) as ICardEntity;

  if (!card) {
    throw new CommonError(
      `Cannot create subscription for proposal (${proposal.id}), because there is no card found!`
    );
  }

  // ----

  const common = await commonDb.getCommon(proposal.commonId);

  const subscription: ISubscriptionEntity = {
    id: v4(),

    payments: [],
    proposalId: proposal.id,
    userId: proposal.proposerId,
    cardId: card.id,
    // Using Date().getDate() to ignore the time
    dueDate: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    ),

    amount: proposal.join.funding,

    status: 'Active',
    revoked: false,

    metadata: {
      common: {
        id: common.id,
        name: common.name
      }
    }
  };

  await db.collection(Collections.Subscriptions)
    .doc(subscription.id)
    .set(subscription);

  // Charge the subscription for the initial payment
  await createSubscriptionPayment(subscription);

  return subscription;
};