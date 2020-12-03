import { Router } from 'express';
import { responseExecutor } from '../../util/responseExecutor';
import { createBankAccount } from './bussiness/createBankAccount';

export const addBankAccountEndpoints = (router: Router) => {
  router.post('/wires/create', async (req, res, next) => {
    await responseExecutor(async () => {
      await createBankAccount(req.body);
    }, {
      req,
      res,
      next,
      successMessage: 'Done!'
    })
  })
}