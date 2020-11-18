import * as functions from 'firebase-functions';

import { commonApp, commonRouter } from '../util/commonApp';
import { responseExecutor } from '../util/responseExecutor';
import { runtimeOptions } from '../util/constants';
import { CommonError } from '../util/errors';
import { Utils } from '../util/util';
import { cancelSubscription, findSubscriptionById } from './business';
import { CancellationReason } from './business/cancelSubscription';

const router = commonRouter();

router.post('/cancel', async (req, res, next) => {
  await responseExecutor(async () => {
    const {subscriptionId} = req.query;

    // @todo Refactor this into a better way
    const userId = await Utils.verifyId(req.body.idToken);

    if (!subscriptionId) {
      throw new CommonError('The subscription id is required, but not provided!');
    }

    const subscription = await findSubscriptionById(subscriptionId as string);

    if (subscription.userId !== userId) {
      throw new CommonError(`
        Cannot cancel subscription that is not yours
      `);
    }

    await cancelSubscription(subscription, CancellationReason.CanceledByUser);
  }, {
    req,
    res,
    next,
    successMessage: `Subscription successfully canceled`
  });
});

export const subscriptionsApp = functions
  .runWith(runtimeOptions)
  .https.onRequest(commonApp(router));