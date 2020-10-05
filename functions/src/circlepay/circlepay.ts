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

// is having object enough here?
export const createCard = async (cardData: object) : Promise<any> => {
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

export const createAPayment = async (paymentData: object) : Promise<any> => {
	const response = await axios.post(`${circlePayApi}/payments`,
		paymentData,
		options
	);
	return response;
}