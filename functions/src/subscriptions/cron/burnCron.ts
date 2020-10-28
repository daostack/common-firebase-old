import * as functions from 'firebase-functions';

exports.backup = functions.pubsub
  .schedule('0 22 * * *') // => every day at 22:00
  .onRun(async () => {
    console.info(`Begging membership revoking for ${new Date().getDate()}`);


    console.info(`Memberships revoked successfully`)
  });