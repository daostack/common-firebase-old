import * as functions from 'firebase-functions';

import { commonApp, commonRouter } from '../util/commonApp';
import { responseExecutor } from '../util/responseExecutor';
import { runtimeOptions } from '../util/constants';
import { CommonError } from '../util/errors';

import { cancelSubscription } from './service/cancelSubscription';
import { getProposalById } from '../db/proposalDbService';
import { createSubscription } from './service/createSubscription';
import { IProposalEntity } from '../util/types';

const router = commonRouter();

router.post('/cancel', async (req, res, next) => {
  await responseExecutor(async () => {
    const {subscriptionId} = req.query;

    if (!subscriptionId) {
      throw new CommonError('The subscription id is required, but not provided!');
    }
    // @todo Check if the currently logged in user is the creator of the subscription

    await cancelSubscription(subscriptionId as string, 'CanceledByUser');
  }, {
    req,
    res,
    next,
    successMessage: `Subscription successfully canceled`
  });
});

router.post('/test', async (req, res) => {
  res.send(
    await createSubscription(
      (await getProposalById(req.query.proposalId)).data() as IProposalEntity
    )
  );
});

export const subscriptionsApp = functions
  .runWith(runtimeOptions)
  .https.onRequest(commonApp(router));