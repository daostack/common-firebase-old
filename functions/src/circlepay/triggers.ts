import * as functions from 'firebase-functions';
import { createPayment } from './createPayment';

// needs to be tested on local db
exports.watchForExecutedProposals = functions.firestore
	.document('/proposals/{id}')
  .onUpdate(async (change) => {
    const proposal = change.after.data();
    const previousProposal = change.before.data();
    if (proposal.executed !== previousProposal.executed
      && proposal.executed === true
      && proposal.winningOutcome === 1) {

      console.log(
        'Proposal EXECUTED and WINNING OUTCOME IS 1 -> INITIATING PAYMENT'
      );

      const funding = proposal.type === 'Join'
        ? proposal.description.funding
        : (proposal.fundingRequest.amount !== 0 // temporary check, for funding requests that have 0 funding -> fix on frontend
            ? proposal.fundingRequest.amount
            : 1);
        
        await createPayment({
          //add ip address
          proposerId: proposal.proposerId,
          proposalId: proposal.id,
          funding
        });
      }
    },
);