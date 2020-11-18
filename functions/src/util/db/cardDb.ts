import { db } from '../../settings';
import { DocumentData, DocumentReference } from '@google-cloud/firestore';
import { Collections } from '../../constants';
import {getProposalById} from './proposalDbService';
import { CommonError } from '../../util/errors/CommonError';

export const updateCard = async (doc: DocumentData): Promise<any> => (
  await db.collection(Collections.Cards)
    .doc(doc.id)
    .set(
      doc,
      {
        merge: true
      }
    )
);

export const getCardByProposalId = async (proposalId: string) : Promise<any> => {
  const proposal = (await getProposalById(proposalId)).data();
  return await getCardById(proposal.join.cardId);
}

  export const getCardById = async (cardId: string) : Promise<any> => {
    const cardRef = db.collection('cards').doc(cardId);
    const cardData = await cardRef.get().then(doc => doc.data());
    if (!cardData) {
      throw new CommonError(`Could not find card with id ${cardId}.`)
    }
    return cardData;
  }

  // moved from util/util.js, not in use at the moment
   /*export const getCardByUserId = async (userId: string) : Promise<any> => {
    const cardRef = await db.collection('cards')
      .where('userId', '==', userId)
      .get();
        if (cardRef.docs.length === 0) {
          throw new CommonError(`Could not find user with id ${userId} associated with a CirclePay card.`);
        }
    const cardData = cardRef.docs.map(doc => doc.data())[0];
    return cardData;
  }*/

/**
 * Returns the card document reference by the card ID
 *
 * @param cardId - The ID of the card
 */
export const getCardRef = (cardId: string): DocumentReference => {
  return db.collection(Collections.Cards).doc(cardId);
};


export default {
  updateCard,
  getCardRef,
  getCardByProposalId
};
