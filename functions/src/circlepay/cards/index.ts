import { Router } from 'express';
import { responseExecutor } from '../../util/responseExecutor';
import { createCard } from './business/createCard';

export const addCardEndpoints = (router: Router): void => {
  router.post('/create-card', async (req, res, next) => {
    await responseExecutor(
      async () => (await createCard({
        ...req.body,
        ipAddress: '127.0.0.1', // @todo Strange. There is no Ip to be find in the request object. Make it be :D
        ownerId: req.user.uid,
        sessionId: req.requestId
      })),
      {
        req,
        res,
        next,
        successMessage: `CirclePay card created successfully!`
      });
  });
};