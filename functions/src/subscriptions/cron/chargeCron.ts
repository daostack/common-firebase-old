import * as functions from 'firebase-functions';
import { chargeSubscriptions } from '../service/chargeSubscriptions';

exports.backup = functions.pubsub
  .schedule('0 12 * * *') // => every day at 12:00
  .onRun(async () => {
    console.info(`Begging subscription charging for ${new Date().getDate()}`);

    await chargeSubscriptions();

    console.info(`Subscriptions charged successfully`)
  });