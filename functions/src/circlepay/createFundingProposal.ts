import { Utils } from '../util/util';
import { updateCard } from '../db/cardDb';

interface IRequest {
	body: {
		idToken: string,
		proposalId: string,
	}
}

export const createFundingProposal = async (req: IRequest) : Promise<any> => {
	let result = 'Proposal already exists.';
	const {idToken, proposalId} = req.body;
	const uid = await Utils.verifyId(idToken);
	const cardData = await Utils.getCardByUserId(uid);
	if (!cardData.proposals.includes(proposalId)) {
		cardData.proposals.push(proposalId);
		await updateCard(cardData.id, cardData)
		result = 'Proposal created.';
	}
	return `${result} proposalId --> ${proposalId}`;
}