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

const createCard = async (cardData) => {
	try {
		const response = await axios.post(`${circlePayApi}/cards`,
			cardData,
			options
		);
		console.log('response', response);
		return response.data;
	} catch (error) {
		// console.log('createCard.js---------------------------------------------', error.response);//.data)
		throw error;
	}
	return 'success';
}

const encryption = async () => {
	try {
		const response = await axios.get(`${circlePayApi}/encryption/public`, options);
		return response.data;
	} catch (error) {
		console.log('encryption error', error);
		throw error;
	}
}

module.exports = {
	createCard,
	encryption
}