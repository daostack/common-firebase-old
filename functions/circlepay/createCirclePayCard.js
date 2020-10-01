const { Utils } = require('../util/util');
const {createCard} = require('./circlepay');

const createCirclePayCard = async (req) => {
	let result = 'Card already exists in CirclePay.';
	const {idToken, ...cardData} = req.body;
	cardData.metadata.ipAddress = '10.0.0.12' // use public-ip library for this?
	const uid = await Utils.verifyId(idToken);
	const userData = await Utils.getUserById(uid);
	const userRef = Utils.getUserRef(uid);
	const createdCard = await createCard(cardData);
	
	if (!userData.circleCardId) {
		userRef.update({circleCardId: createdCard.data.id});
		result = 'CirclePay card created.'
	}

	return `${result} circleCardId --> ${userData.circleCardId}`;
}

module.exports = {createCirclePayCard};