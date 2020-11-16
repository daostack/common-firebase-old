import express from 'express';
import { Utils } from '../util/util';
import { createCard } from './circlepay';
import cardDb, { updateCard } from '../util/db/cardDb';
import { v4 } from 'uuid';
import { CommonError } from '../util/errors';

interface IRequest {
  headers: { host?: string },
  body: {
    idToken: string,
    billingDetails: {
      name: string,
      city: string,
      country: string,
      line1: string,
      postalCode: string,
      district: string,
    },
    expMonth: number,
    expYear: number,
    idempotencyKey: string,
    metadata: {
      email: string,
      ipAddress: string,
      sessionId: string,
    }
    keyId: string,
    encryptedData: string,
  }
}

interface ICardCreatedPayload {
  cardId: string;
}

export const createCirclePayCard = async (req: IRequest): Promise<ICardCreatedPayload> => {
  const { ...cardData } = req.body;

  cardData.metadata.ipAddress = req.headers['x-forwarded-for'] || '127.0.0.1';
  cardData.metadata.sessionId = v4();
  cardData.idempotencyKey = v4();

  const { data } = await createCard(cardData);
  
  await updateCard({
      id: data.id,
      userId: req.user.uid,
      creationDate: new Date(),
      payments: []
  });

  return {
    cardId: data.id
  };
};

/**
 * Assigns already created card to given proposal
 *
 * @param req - The express request
 *
 * @return Promise
 */
export const assignCard = async (req: express.Request): Promise<void> => {
  const { idToken, cardId, proposalId } = req.body;

  const userId = await Utils.verifyId(idToken);
  const card = (await cardDb.getCardRef(cardId).get()).data();

  if (card.userId !== userId) {
    // @todo Custom CommonValidationError?
    throw new CommonError(`
      Cannot update the proposal of card with ID ${cardId} 
      because the user (${userId}), updating it, is not the owner!
    `);
  }

  if (card.proposals.lenght > 0) {
    // @todo Instead of throwing error should I just allow assignment
    //  of more than one proposal to card?
    throw new CommonError(`
       Cannot assign card (${cardId}) to proposal because
       the card is already assigned!
    `);
  }


  console.log(`
    Assigning card with id ${cardId} to proposal with id ${proposalId}
  `);

  await cardDb.updateCard({
    id: cardId,
    proposals: [proposalId]
  });
};

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

  if (card.proposals.lenght > 0) {
    // @todo Instead of throwing error should I just allow assignment
    //  of more than one proposal to card?
    throw new CommonError(`
       Cannot assign card (${cardId}) to proposal because
       the card is already assigned!
    `);
  }

  await cardDb.updateCard({
    id: cardId,
    proposals: [proposalId]
  });
};

export default {
  createCirclePayCard,
  assignCard
};