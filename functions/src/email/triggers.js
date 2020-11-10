const functions = require('firebase-functions');
const { updateDAOBalance } = require("../db/daoDbService");
const { minterToken } = require('../relayer/util/minterToken')
const { Utils } = require('../util/util');
const { createEvent } = require('../db/eventDbService');
const { EVENT_TYPES } = require('../event/event');
const { PROPOSAL_TYPE } = require('../util/util');


const emailClient = require('.');

exports.watchForExecutedProposals = functions.firestore
  .document('/proposals/{id}')
  .onUpdate(async (change) => {
    const proposal = change.after.data();
    const previousProposal = change.before.data();

    if (
      proposal.executed !== previousProposal.executed &&
      proposal.executed === true &&
      proposal.winningOutcome === 1 &&
      proposal.name === PROPOSAL_TYPE.Join
      // && data.description.preAuthId
    ) {
      console.log(
        'Proposal EXECUTED and WINNING OUTCOME IS 1 -> INITIATING PAYMENT'
      );
      const userData = await Utils.getUserById(proposal.proposerId);
      let daoData = await Utils.getCommonById(proposal.dao);
      try {
        const amount = proposal.description.funding;

        await createEvent({
          userId: proposal.proposerId,
          objectId: proposal.id,
          createdAt: new Date(),
          type: EVENT_TYPES.REQUEST_TO_JOIN__ACCEPTED 
        })

        console.log(`Minting ${amount} tokens to ${proposal.dao}`)
        await minterToken(proposal.dao, amount)
        await updateDAOBalance(proposal.dao);
        return change.after.ref.set(
          {
            paymentStatus: 'paid',
          },
          { merge: true }
        );

      } catch (e) {

        return change.after.ref.set({
          paymentStatus: 'failed',
        }, {
          merge: true
        });
      }
    } else if (
      proposal.executed !== previousProposal.executed &&
      proposal.executed === true &&
      proposal.winningOutcome === 0
    ) {
       // await cancelPreauthorizedPayment(data.description.preAuthId);
    }

    if (
      proposal.name === PROPOSAL_TYPE.FundingRequest &&
      proposal.votesFor > previousProposal.votesFor
    ) {

      const userData = await Utils.getUserById(proposal.proposerId);
      let daoData = await Utils.getCommonById(proposal.dao);
      await createEvent({
        userId: proposal.proposerId,
        objectId: proposal.id,
        createdAt: new Date(),
        type: EVENT_TYPES.FUNDING_REQUEST_ACCEPTED
      })
    }

    return true;
  });
