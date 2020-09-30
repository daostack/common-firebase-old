const { Utils } = require('../util/util');
const {createCard} = require('./circlepay');

const createCirclePayCard = async (req) => {
	// console.log('createCirclePayCard.js');
	let result;
	const {idToken, ...cardData} = req.body;
	const uid = await Utils.verifyId(idToken);
	const userData = await Utils.getUserById(uid);
	const userRef = Utils.getUserRef(uid);
	
	// encryptedData is not a valid base64
	// const createdCard = await createCard(cardData);
	// console.log('body', cardData);

	return {
		message: `CirclePay card creation status: ${
			result || 'Card already exists in CirclePay.'
		}`
	}
}

module.exports = {createCirclePayCard};