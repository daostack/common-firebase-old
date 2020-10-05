import { Utils } from '../util/util';
import { createCard } from './circlepay';
const { updateCard } = require('../db/cardDbService');
const { updateProposalList } = require('../db/cardDbService');
const ethers = require('ethers');

const _updateCard = async (userId, cardId, proposalId, id) => {
	const doc = {
		id,
		userId,
		proposals: [proposalId],
		cardId,
		creationData: new Date(),
		payments: [],
	};
  	await updateCard(id, doc);
}

export const createCirclePayCard = async (req) => {
	let result = 'Card already exists in CirclePay.';
	const {idToken, ...cardData} = req.body;
	cardData.metadata.ipAddress = req.headers.host; //this returns localhost at this point
	cardData.metadata.sessionId = ethers.utils.id(cardData.proposalId).substring(0,50);
	const uid = await Utils.verifyId(idToken);
	const {data} = await createCard(cardData);
	const id = ethers.utils.id(cardData.metadata.email);
  	const cardById = await Utils.getCardById(id);
	
	if(!cardById)
	{
		await _updateCard(uid, data.id, cardData.proposalId, id)
		result = 'CirclePay card created.'
	}/* else {
		update card with new requestToJoin proposal
	}*/
  // if card exists, add proposal to list of proposal

	return `${result} circleCardId --> ${id}`;
}

module.exports = {createCirclePayCard};