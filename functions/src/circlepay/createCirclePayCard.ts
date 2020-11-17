import { Utils } from '../util/util';
import { createCard } from './circlepay';
import { updateCard } from '../util/db/cardDb';
import { v4 } from 'uuid';
import axios from 'axios';

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
