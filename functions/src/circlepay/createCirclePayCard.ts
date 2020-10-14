import { Utils } from '../util/util';
import { createCard } from './circlepay';
import { updateCard } from '../db/cardDb';
import {ethers} from 'ethers';
import { v4 } from 'uuid';

const _updateCard = async (userId: string, id: string, proposalId: string) : Promise<any> => {
	const doc = {
		id,
		userId,
		proposals: [proposalId],
		creationData: new Date(),
		payments: [],
	};
  await updateCard(id, doc);
}

// try to use ICardData from ./circlepay
interface IRequest {
  headers: {host?: string},
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
    proposalId: string,
    metadata: {
      email: string,
      ipAddress: string,
      sessionId: string,
    }
    keyId: string,
    encryptedData: string,
  }
}

export const createCirclePayCard = async (req: IRequest) : Promise<any> => {
  let result = 'Unable to create card.';
  const {idToken, ...cardData} = req.body;
  cardData.metadata.ipAddress =  '127.0.0.1';  //req.headers.host.includes('localhost') ? '127.0.0.1' : req.headers.host; //ip must be like xxx.xxx.xxx.xxx, and not a text
  cardData.metadata.sessionId = ethers.utils.id(cardData.proposalId).substring(0,50);
  cardData.idempotencyKey = v4();
  const uid = await Utils.verifyId(idToken);
  const {data} = await createCard(cardData);

  await _updateCard(uid, data.id, cardData.proposalId)
  result = 'CirclePay card created.';

  return `${result} circleCardId --> ${data.id}`;
  }

module.exports = {createCirclePayCard};