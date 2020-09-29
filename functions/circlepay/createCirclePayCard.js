const { Utils } = require('../util/util');
const {createCard} = require('./circlepay');

const createCirclePayCard = async (req) => {
	console.log('createCirclePayCard.js');
	try {
		let result;
		const {idToken, ...cardData} = req.body;
		const uid = await Utils.verifyId(idToken);
		const userData = await Utils.getUserById(uid);
    	const userRef = Utils.getUserRef(uid);
    	const r = await createCard(cardData);
		//console.log('body', cardData);

		return {
			message: `CirclePay card creation status: ${
				result || 'Card already exists in CirclePay.'
			}`
		}

	} catch (error) {
		//console.log('createCirclePayCard error', error)
		throw error;
	}
}

module.exports = {createCirclePayCard};