import * as functions from 'firebase-functions';

import { responseExecutor } from '../util/responseExecutor';
import { commonApp, commonRouter } from '../util/commonApp';

import { createCirclePayCard, assignCard } from './createCirclePayCard';
import { createPayment } from './createPayment';
import { encryption } from './circlepay';

const runtimeOptions = {
  timeoutSeconds: 540
};

const circlepay = commonRouter();

circlepay.post('/create-card', async (req, res) => {
  responseExecutor(
    async () => (await createCirclePayCard(req)),
    {
      req,
      res,
      successMessage: `CirclePay card created!`
    });
});

circlepay.post('/assign-card', async (req, res) => {
  await responseExecutor(
    async () => (await assignCard(req)), {
    req,
    res,
    successMessage: `CirclePay card assigned successfully!`
  });
});

circlepay.get('/encryption', async (req, res) => {
  console.log('index/encryption');
  responseExecutor(
    async () => (await encryption()),
    {
      req,
      res,
      successMessage: `PCI encryption key generated!`
    });
});

circlepay.post('/create-a-payment', async (req, res) => {
  console.log('index/create-a-payment');
  responseExecutor(
    async () => (await createPayment(req.body)),
    {
      req,
      res,
      successMessage: `Payment was successful`
    });
});

exports.circlepay = functions
  .runWith(runtimeOptions)
  .https
  .onRequest(commonApp(circlepay));
