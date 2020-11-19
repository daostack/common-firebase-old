import * as functions from 'firebase-functions';

import { commonApp, commonRouter } from '../util';
import { runtimeOptions } from '../constants';
import { responseExecutor } from '../util/responseExecutor';

import { createCommon } from './business';

const router = commonRouter();

router.post('/create', async (req, res, next) => {
  await responseExecutor(
    async () => {
      return await createCommon({
        ...req.body,
        userId: req.user.uid
      });
    }, {
      req,
      res,
      next,
      successMessage: 'Common created successfully'
    });
});

// router.post('/remove', async (req, res, next) => {
//   await responseExecutor(
//     async () => {
//       return await removeCommonMember(await commonDb.getCommon(req.query.commonId as string), req.query.userId as string);
//     }, {
//       req,
//       res,
//       next,
//       successMessage: 'Common created successfully'
//     });
// });


export const commonsApp = functions
  .runWith(runtimeOptions)
  .https.onRequest(commonApp(router));