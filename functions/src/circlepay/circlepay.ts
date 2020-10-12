import { env } from '@env';
import { circlePayApi } from '../settings';
import axios from 'axios';

const options = {
	headers: {
		accept: 'application/json',
		'Content-Type': 'application/json',
		authorization: `Bearer ${env.circlepay.apiKey}`
	},
};

export interface ICardData {
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
  metadata: {
    email: string,
    ipAddress: string,
    sessionId: string,
  },
  keyId: string,
  encryptedData: string,
  proposalId: string,
  idempotencyKey: string,
}

export const createCard = async (cardData: ICardData) : Promise<any> => {
  const response = await axios.post(`${circlePayApi}/cards`,
		cardData,
		options
	);
	return response.data;
}

export const encryption = async () : Promise<any> => {
	const response = await axios.get(`${circlePayApi}/encryption/public`, options);
	return response.data;
}

interface IPayment {
  idempotencyKey: string,
  metadata: {
    email: string, 
    sessionId: string,
    ipAddress: string,
  },
  amount: {
    amount: string,
    currency: string,
  },
  verification: string,
  source: {
    id: string,
    type: string
  },
}

export const createAPayment = async (paymentData: IPayment) : Promise<any> => {
	const response = await axios.post(`${circlePayApi}/payments`,
		paymentData,
		options
	);
	return response;
}

export const getPayment = async(paymentId: string) : Promise<any> => {
  const response = await axios.get(`${circlePayApi}/payments/${paymentId}`, options);
  return response;
}






