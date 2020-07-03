const functions = require('firebase-functions');

exports.watchForExecutedProposals = functions.firestore
  .document('/proposals/{id}')
  .onUpdate((change) => {
      const data = change.after.data();
      const previousData = change.before.data();
      if (data.executed !== previousData.executed && data.winningOutcome === 1) {
          console.log('YES WE DO HAVE TO TRIGGER');
      }
  });
