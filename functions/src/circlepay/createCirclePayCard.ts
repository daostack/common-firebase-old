import { createCard } from './circlepay';
import { createNewCard } from '../util/db/cardDb';
import { v4 } from 'uuid';
import * as cardDb from '../util/db/cardDb';
import axios from 'axios';
import { NotFoundError } from '../util/errors';

// @todo Why do this? Rework to use express.IRequest
interface IRequest {
  headers: { host?: string },
  body: {
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
  };
  user: {
    uid: string;
  }
}

interface ICardCreatedPayload {
  cardId: string;
}

// @todo Don't like this, rework
export const createCirclePayCard = async (req: IRequest): Promise<ICardCreatedPayload> => {
  // @todo Any king of validation????
  const cardData = req.body;
  // Without passing data: cannot read property ipAddress of undefined => validation is highly needed
  cardData.metadata.ipAddress = req.headers['x-forwarded-for'] || '127.0.0.1';
  // @todo I think there should be session ID on the request object. This is not using the express requests (to witch I appended the types), so there is no way to access it
  cardData.metadata.sessionId = v4();
  // @todo This key for idempotency so how it will guarantee idempotency if we are always generating new key?
  cardData.idempotencyKey = v4();

  const { data } = await createCard(cardData);

  // @todo This is not types. So here arises the first problem: missing proposals array on some cards?
  await createNewCard({
    // @todo What happens if two users use the same card
      id: data.id,
      userId: req.user.uid,
      creationDate: new Date(),
      payments: [],
      proposals: [],
  });

  // @todo Why are we only returning the id of the card. And that id is the id that circle gave us, not ours
  return {
    cardId: data.id
  };
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

  if(!card) {
    throw new NotFoundError(cardId, 'card');
  }

  // If there are proposals on the card check if some
  // of them is the one that we are currently adding
  if (card.proposals && card.proposals.some(x => x === proposalId)) {
    return;
  }

  await cardDb.updateCard({
    id: cardId,
    proposals: [
      ...(card.proposals || []),
      proposalId
    ]
  });
};

interface ITestIpPayload {
  ip: string;
}

export const testIP = async (): Promise<ITestIpPayload> => {
  const response = await axios.get('https://api.ipify.org?format=json');
  return {
    ip: response.data
  };
};

export default {
  createCirclePayCard,
};
