import * as functions from 'firebase-functions';

exports.backup = functions.pubsub
  .schedule('0 12 * * *') // => every day at 12:00
  .onRun(async () => {

  });