const { Utils } = require('../util/util');
const { createCard } = require('./circlepay');
const { updateCard } = require('../db/cardDbService');

const _updateCard = async (userId, cardId, proposalId, id) => {
	const doc = {
		id, //should be the hash of the proposalId and cardId, TO_ASK use a hashing library? 
		userId,
		proposals: [proposalId],
		cardId,
		creationData: new Date(),
		payments: [],
	};
  await updateCard(id, doc);
}

const createCirclePayCard = async (req) => {
	let result = 'Card already exists in CirclePay.';
	const {idToken, ...cardData} = req.body;
	cardData.metadata.ipAddress = '10.0.0.12' // use public-ip library for this?
	const uid = await Utils.verifyId(idToken);
	const {data} = await createCard(cardData);
  const tempIdString = data.id + cardData.proposalId; //until making id the hash of these two strings
  const cardById = await Utils.getCardById(tempIdString);

	(!cardById)
	{
		await _updateCard(uid, data.id, cardData.proposalId, tempIdString)
		result = 'CirclePay card created.'
	}
  // if card exists, add proposal to proposalId array?

	return `${result} circleCardId --> ${tempIdString}`;
}

module.exports = {createCirclePayCard};