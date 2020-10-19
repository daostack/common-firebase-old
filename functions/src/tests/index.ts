import * as functions from 'firebase-functions';

import { errorHandling } from '../middleware/errorHandlingMiddleware';
import { commonApp, commonRouter } from '../util/commonApp';
import { UnsupportedVersionError } from '../util/errors';

const runtimeOptions = {
  timeoutSeconds: 540
};

const router = commonRouter()

router.get('/nonCommonError', (req) => {
  throw new UnsupportedVersionError('Hey');
});

export const tests = functions
  .runWith(runtimeOptions)
  .https.onRequest(commonApp(router));



