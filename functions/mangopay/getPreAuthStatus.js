const { env } = require('../env');
const {
  viewPreauthorization,
} = require('./mangopay');

const db = require('firebase-admin').firestore();
const emailClient = require('../email');

const getPreAuthStatus = async (req) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const { preAuthId } = req.body;
    const { Status, DebitedFunds: { Amount }, AuthorId } = await viewPreauthorization(preAuthId);
    if (Status === 'FAILED') { // this is 3d Authentitacion FAILURE
      const proposalsSnapshot = await db.collection('proposals')
        .where('description.preAuthId', '==', preAuthId)
        .get()

      const proposal = proposalsSnapshot.docs.map(doc => doc.data())[0];

      if(!proposal) {
        throw new Error("Proposal not found for preauth id " + preAuthId);
      }

      const common = (await db.collection('daos')
        .doc(proposal.dao)
        .get())
        .data();

      const requester = (await db.collection('users')
        .doc(proposal.joinAndQuit.proposedMemberId)
        .get())
        .data()

      await emailClient.sendTemplatedEmail({
        to: env.mail.adminMail,
        templateKey: "adminPreauthorizationFailed",
        emailStubs: {
          commonName: common.name,
          membershipRequestId: proposal.id, // @todo Ask if this is right
          userId: requester.uid,
          userEmail: requester.email,
          userFullName: requester.displayName,
          paymentAmount: proposal.joinAndQuit.funding,
          submittedOn: new Date(proposal.executedAt * 1000).toDateString(),
          failureReason: 'Unknown'
        }
      });

    }
    return { message: 'PreauthStatus', Status };

  } catch (error) {
    throw error; 
  }
}

 module.exports = { getPreAuthStatus };
