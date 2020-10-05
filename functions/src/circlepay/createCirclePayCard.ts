import { Utils } from '../util/util';
import { createCard } from './circlepay';
import { updateCard } from '../db/cardDb';
import ethers from 'ethers';
import v4 from 'uuid';

const _updateCard = async (userId: string, cardId: string, proposalId: string, id: string) : Promise<any> => {
	const doc = {
		id,
		userId,
		proposals: [proposalId],
		cardId,
		creationData: new Date(),
		payments: [],
	};
  await updateCard(id, doc);
}

interface IRequest {
  headers: {host?: string},
  body: {
    idToken: string,
    idempotencyKey: string,
    proposalId: string,
    metadata: {
      email: string,
      ipAddress: string,
      sessionId: string,
    }
  }
}

export const createCirclePayCard = async (req: IRequest) : Promise<any> => {
  let result = 'Card already exists in CirclePay.';
  const {idToken, ...cardData} = req.body;
  cardData.metadata.ipAddress = req.headers.host; //this returns localhost at this point
  cardData.metadata.sessionId = ethers.utils.id(cardData.proposalId).substring(0,50);
  cardData.idempotencyKey = v4();
  const uid = await Utils.verifyId(idToken);
  const {data} = await createCard(cardData);
  const id = ethers.utils.id(cardData.metadata.email);
  const cardById = await Utils.getCardById(id);

  if(!cardById)
  {
    await _updateCard(uid, data.id, cardData.proposalId, id)
    result = 'CirclePay card created.'
  }/* else {
  update card with new requestToJoin proposal
  }*/
  // if card exists, add proposal to list of proposal

  return `${result} circleCardId --> ${id}`;
  }

module.exports = {createCirclePayCard};