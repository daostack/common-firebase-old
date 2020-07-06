const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { payToDAOStackWallet, cancelPreauthorizedPayment } = require('../mangopay/mangopay');

exports.watchForExecutedProposals = functions.firestore
  .document('/proposals/{id}')
  .onUpdate(async (change) => {
      const data = change.after.data();
      const previousData = change.before.data();
      if (data.executed !== previousData.executed && data.winningOutcome === 1) {
          console.log('Proposal EXECUTED and WINNING OUTCOME IS 1 -> INITIATING PAYMENT');
            const userData = await admin.firestore().collection('users').doc(data.proposerId).get().then(doc => { return doc.data() });
            const {Status} = payToDAOStackWallet({preAuthId: data.preAuthId, Amount: data.joinAndQuit.funding, userData });
            return change.after.ref.set({
              paymentStatus: Status
            }, {merge: true});
      } else if (data.executed !== previousData.executed && data.winningOutcome === 0) {
          cancelPreauthorizedPayment(data.preAuthId);
      }
  });
