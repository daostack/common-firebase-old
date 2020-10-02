const functions = require('firebase-functions');
const { Utils } = require('../util/util');

// not tested yet
exports.watchForExecutedProposals = functions.firestore
	.document('/proposal/{id}')
  .onUpdate(async (change) => {
    const data = change.after.data();
    const previousData = change.before.data();

    if (data.executed !== previousData.executed
      && data.executed === true
      && data.winningOutcome === 1) {

      console.log(
        'Proposal EXECUTED and WINNING OUTCOME IS 1 -> INITIATING PAYMENT'
      );

        const cardId = await Utils.getCardByProposalId(data.id);
        /*
        data needed for payment
        idempotencyKey // (also in frontend) use commonId for generating this? consider uuid-by-string,
        metadata: {
          email of user // get by userId (from proposal data.proposer)
          sessionId
          ipAddress
        }
        amount: {
          amount
          currency
        }
        verification: cvv || none
        source: {
          id // cardId
          type: card
        }
         */
        }
    }
  });