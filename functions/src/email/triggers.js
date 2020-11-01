const functions = require('firebase-functions');
const { updateDAOBalance } = require("../db/daoDbService");
const { minterToken } = require('../relayer/util/minterToken')
const { Utils } = require('../util/util');
const { createEvent } = require('../db/eventDbService');
const { EVENT_TYPES } = require('../event/event');


const emailClient = require('.');

exports.watchForExecutedProposals = functions.firestore
  .document('/proposals/{id}')
  .onUpdate(async (change) => {
    const proposal = change.after.data();
    const previousProposal = change.before.data();
    console.log('proposal executed', proposal)

    if (
      proposal.executed !== previousProposal.executed &&
      proposal.executed === true &&
      proposal.winningOutcome === 1 &&
      proposal.name === 'Join'
      // && data.description.preAuthId
    ) {
      console.log(
        'Proposal EXECUTED and WINNING OUTCOME IS 1 -> INITIATING PAYMENT'
      );
      const userData = await Utils.getUserById(proposal.proposerId);
      let daoData = await Utils.getCommonById(proposal.dao);
      try {
        const amount = proposal.description.funding;
        /*await Promise.all([
          emailClient.sendTemplatedEmail({
            to: userData.email,
            templateKey: "userJoinedSuccess",
            emailStubs: {
              name: userData.displayName,
              commonName: daoData.name,
              commonLink: Utils.getCommonLink(daoData.id)
            }
          }),
          emailClient.sendTemplatedEmail({
            to: 'admin',
            templateKey: 'adminPayInSuccess',
            emailStubs: {
              proposalId: proposal.id
            }
          })
        ]);*/

        // an even for APPROVED_REQUEST_TO_JOIN is also in graphql/util/triggers in watchForNewMembers
        // do we really need both?
        // in graphql triggers we look for minted reputation of members,
        // here we're looking at voted or not
        await createEvent({
          userId: proposal.proposerId,
          objectId: proposal.id,
          createdAt: new Date(),
          type: EVENT_TYPES.APPROVED_REQUEST_TO_JOIN
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
      proposal.name === "FundingRequest" &&
      proposal.executed !== previousProposal.executed &&
      proposal.winningOutcome === 1 &&
      Boolean(proposal.executed)
    ) {

      const userData = await Utils.getUserById(proposal.proposerId);
      let daoData = await Utils.getCommonById(proposal.dao);

      // Template fundingRequestAccepted (admin & user)
      // we create the same even in graphql/util/triggers in watchForNewMembers
      // we check for minted reputation
      await createEvent({
        userId: proposal.proposerId,
        objectId: proposal.id,
        createdAt: new Date(),
        type: EVENT_TYPES.APPROVED_PROPOSAL
      })

      /*await Promise.all([
        emailClient.sendTemplatedEmail({
          to: userData.email,
          templateKey: 'userFundingRequestAccepted',
          emailStubs: {
            name: userData.displayName,
            proposal: proposal.description.title
          }
        }),
        emailClient.sendTemplatedEmail({
          to: 'admin',
          templateKey: 'adminFundingRequestAccepted',
          emailStubs: {
            userId: userData.uid,
            userFullName: userData.displayName,
            userEmail: userData.email,
            commonName: daoData.name,
            commonBalance: daoData.balance,
            commonLink: Utils.getCommonLink(daoData.id),
            commonId: daoData.id,
            proposalId: proposal.id,
            paymentAmount: proposal.fundingRequest.amount,
            submittedOn: new Date(proposal.createdAt * 1000).toDateString(),
            passedOn: new Date(proposal.executedAt * 1000).toDateString(),
            log: 'No additional information available',
            paymentId: 'Not available'
          }
        })
      ])*/
    }

    return true;
  });
