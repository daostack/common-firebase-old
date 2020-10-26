import * as functions from 'firebase-functions';
import { createPaymentWeb } from './createPaymentWeb';
import { PROPOSAL_TYPE } from '../settings';

// needs to be tested on local db
exports.watchForExecutedProposals = functions.firestore
	.document('/proposals/{id}')
  .onUpdate(async (change) => {
    const proposal = change.after.data();
    const previousProposal = change.before.data();

    // Maybe not do all of this and only depend on the event
    if (proposal.executed !== previousProposal.executed
      && proposal.executed === true
      && proposal.winningOutcome === 1
      && proposal.type === PROPOSAL_TYPE.Join) {

      console.log(
        'Proposal EXECUTED and WINNING OUTCOME IS 1 -> INITIATING PAYMENT'
      );

      // @todo Create payment only if the common is of one-payment contribution
        await createPaymentWeb({
          ipAddress: '127.0.0.1', //@question use public-ip lib here?? 
          proposerId: proposal.proposerId,
          proposalId: proposal.id,
          funding: proposal.description.funding
        });
      }
    }
);