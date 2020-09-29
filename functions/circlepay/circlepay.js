const { env } = require('@env');
const { circlePayApi } = require('../settings');
const axios = require('axios');

const options = {
	headers: {
		accept: 'application/json',
		'Content-Type': 'application/json',
		authorization: `Bearer ${env.circlepay.apiKay}`
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
		console.log('createCard.js error message', error.response.data)
		/*
		possible errors:
		422: message: Unprocessable Entity, code: 2 -> when data is not right
		 */
		throw error;
	}
	return 'success';
}
/*
QVBJX0tFWTpmNThkOGFkYmEyMWE5Y2FlMzI4MzkxYjJjNGVlNWFmYjphMGNiN2UyYTUwYzEzNzNmNTVjNjg5ODYxZDdmZTIxZQ
 */
module.exports = {
	createCard
}