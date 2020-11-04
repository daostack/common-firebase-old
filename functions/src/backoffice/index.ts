import * as functions from 'firebase-functions';

import { commonApp, commonRouter } from '../util/commonApp';
import { responseExecutor } from '../util/responseExecutor';
import { getPayout } from './backoffice';



const runtimeOptions = {
  timeoutSeconds: 540 // Maximum time 9 mins
};

const backofficeRouter = commonRouter();

backofficeRouter.get('/payout', async (req, res, next) => {
  await responseExecutor(
    async () => {
      return await getPayout();
    }, {
      req,
      res,
      next,
      successMessage: `Fetch PAYOUT succesfully!`
    }
  );
});

export const backofficeApp = functions
  .runWith(runtimeOptions)
  .https.onRequest(commonApp(backofficeRouter));