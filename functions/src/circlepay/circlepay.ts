const { env } = require('@env');
const { circlePayApi } = require('../settings');
const axios = require('axios');

const options = {
	headers: {
		accept: 'application/json',
		'Content-Type': 'application/json',
		authorization: `Bearer ${env.circlepay.apiKey}`
	},
};

	/*
	cardData requirements:
		idempotencyKey,
		encryptedData: {
			number //card number
			cvv
		},
		billingDetails: {
			name
			city
			country
			line1 //of address
			postalCode
		},
		expMonth,
		expYear,
		metadata: {
			email,
			sessionId,
			ipAddress
		}
	 */
export const createCard = async (cardData) => {
	const response = await axios.post(`${circlePayApi}/cards`,
		cardData,
		options
	);
	return response.data;
}

export const encryption = async () => {
	const response = await axios.get(`${circlePayApi}/encryption/public`, options);
	return response.data;
}

export const createAPayment = async (paymentData) => {
	const response = await axios.post(`${circlePayApi}/payments`,
		paymentData,
		options
	);
	return response;
}