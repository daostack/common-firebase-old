const functions = require('firebase-functions');
import { createPayment } from './createPayment';

// needs to be tested on local db
exports.watchForExecutedProposals = functions.firestore
	.document('/proposals/{id}')
  .onUpdate(async (change) => {
    const proposal = change.after.data();
    const previousProposal = change.before.data();
    console.log('currProposal===========\n', proposal)
    if (proposal.executed !== previousProposal.executed
      && proposal.executed === true
      && proposal.winningOutcome === 1) {

      console.log(
        'Proposal EXECUTED and WINNING OUTCOME IS 1 -> INITIATING PAYMENT'
      );

        const data = await createPayment({
          proposerId: proposal.proposerId,
          funding: proposal.description.funding,
        });

        console.log('data', data)

        // update database with response payment
      }
    },
);