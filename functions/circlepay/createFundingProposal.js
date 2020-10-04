const { Utils } = require('../util/util');
const { db } = require('../settings.js');
const { updateProposalList } = require('../db/cardDbService');

const createFundingProposal = async (req) => {
	let result = 'Proposal already exists.';
	const {idToken, proposalId} = req.body;
	const uid = await Utils.verifyId(idToken);
	const cardData = await Utils.getCardByUserId(uid);
	if (!cardData.proposals.includes(proposalId)) {
		cardData.proposals.push(proposalId);
		await updateProposalList(cardData.id, cardData.proposals)
		result = 'Proposal created.';
	}
	return `${result} proposalId --> ${proposalId}`;
}

module.exports = {createFundingProposal};