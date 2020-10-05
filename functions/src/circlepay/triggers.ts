const functions = require('firebase-functions');
const { Utils } = require('../util/util');
import { createPayment } from './createPayment';

// tested but without adding payment to db yet
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

        // update database with response payment
      }
    },
);