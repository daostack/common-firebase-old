import * as cardDb from '../../util/db/cardDb';
import { NotFoundError } from '../../util/errors';

/**
 * The raw version of assignCard();
 * Please not that here we do not validate anything, so use with caution
 *
 * @param cardId - the id of the card that we want to assign
 * @param proposalId - the id of the proposal that we want to assign to
 *
 * @return { Promise }
 */
export const assignCardToProposal = async (cardId: string, proposalId: string): Promise<void> => {
  const card = (await cardDb.getCardRef(cardId).get()).data();

  if(!card) {
    throw new NotFoundError(cardId, 'card');
  }

  if (card.proposals.some(x => x === proposalId)) {
    // The proposal is already assigned to
    // that card so just return
    return;
  }

  await cardDb.updateCard(cardId, {
    proposals: [
      ...card.proposals,
      proposalId
    ]
  });
};