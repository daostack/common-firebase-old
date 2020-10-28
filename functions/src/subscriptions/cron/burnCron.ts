import * as functions from 'firebase-functions';

exports.backup = functions.pubsub
  .schedule('0 22 * * *') // => every day at 22:00
  .onRun(async () => {
    console.info(`Begging membership revoking for ${new Date().getDate()}`);

    // @todo Revoke memberships

    console.info(`Memberships revoked successfully`)
  });