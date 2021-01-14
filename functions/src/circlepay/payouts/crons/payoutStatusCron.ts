import * as functions from 'firebase-functions';
import { payoutDb } from '../database';
import { updatePayoutStatus } from '../business/updatePayoutStatus';

// Update the payout statuses every 12 hours
export const payoutStatusCron = functions.pubsub
  .schedule('0 */12 * * *')
  .onRun(async () => {
    const pendingPayouts = await payoutDb.getMany({
      status: 'pending'
    });

    if (pendingPayouts && pendingPayouts.length) {
      for (const payout of pendingPayouts) {
        // eslint-disable-next-line no-await-in-loop
        await updatePayoutStatus(payout);
      }
    }
  });
