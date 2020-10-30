import { v4 } from 'uuid';

import { db } from '../../settings';

import { Utils } from '../../util/util';
import { CommonError } from '../../util/errors';
import { Collections } from '../../util/constants';
import { ICardEntity, ICommonEntity, IProposalEntity, ISubscriptionEntity } from '../../util/types';
import { createSubscriptionPayment } from '../../circlepay/createSubscriptionPayment';


/**
 * Creates subscription based on proposal
 *
 * @param proposal - The proposal for witch we want to create the subscription
 *
 * @throws { CommonError } - If the proposal is not provided
 * @throws { CommonError } - If the card, assigned to the proposal, is not found
 */
export const createSubscription = async (proposal: IProposalEntity): Promise<ISubscriptionEntity> => {
  if(!proposal || !proposal.id) {
    throw new CommonError('Cannot create subscription without proposal')
  }

  const card = (await Utils.getCardByProposalId(proposal.id)) as ICardEntity;

  if (!card) {
    throw new CommonError(
      `Cannot create subscription for proposal (${proposal.id}), because there is no card found!`
    );
  }

  const common = (await db.collection(Collections.Commons)
    .doc(proposal.dao)
    .get()).data() as ICommonEntity;

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

    amount: proposal.description.funding / 100,

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