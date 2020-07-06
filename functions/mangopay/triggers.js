const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { payToDAOStackWallet } = require('../mangopay/mangopay');

exports.watchForExecutedProposals = functions.firestore
  .document('/proposals/{id}')
  .onUpdate(async (change) => {
      const data = change.after.data();
      const previousData = change.before.data();
      if (data.executed !== previousData.executed && data.winningOutcome === 1) {
          console.log('YES WE DO HAVE TO TRIGGER, AND WILL DO IT');
            const userData = await admin.firestore().collection('users').where("safeAddress", '==', data.proposerId).get().then(doc => { return doc.data() });
            payToDAOStackWallet({preAuthId: data.preAuthId, Amount: data.joinAndQuit.funding, userData })
      }
  });
