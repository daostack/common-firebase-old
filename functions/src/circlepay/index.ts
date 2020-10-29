import * as functions from 'firebase-functions';
import request from 'request';

import { responseExecutor } from '../util/responseExecutor';
import { commonApp, commonRouter } from '../util/commonApp';

import { createCirclePayCard, assignCard } from './createCirclePayCard';
import { createPaymentWeb } from './createPaymentWeb';
import { circlePayApiOptions, encryption } from './circlepay';
import { externalRequestExecutor } from '../util';
import axios from 'axios';
import { circlePayApi } from '../settings';
import { ErrorCodes } from '../util/constants';
import { createSubscriptionPayment } from './createSubscriptionPayment';
import { CommonError } from '../util/errors';
import { handleNotification } from './handleNotification';
import { ICircleNotification } from '../util/types';

const runtimeOptions = {
  timeoutSeconds: 540
};

const validator = /^arn:aws:sns:.*:908968368384:(sandbox|prod)_platform-notifications-topic$/;
const circlepay = commonRouter();

circlepay.post('/create-card', async (req, res, next) => {
  await responseExecutor(
    async () => (await createCirclePayCard(req)),
    {
      req,
      res,
      next,
      successMessage: `CirclePay card created!`
    });
});

circlepay.post('/assign-card', async (req, res, next) => {
  await responseExecutor(
    async () => (await assignCard(req)), {
      req,
      res,
      next,
      successMessage: `CirclePay card assigned successfully!`
    });
});

circlepay.get('/encryption', async (req, res, next) => {
  console.log('index/encryption');
  await responseExecutor(
    async () => (await encryption()),
    {
      req,
      res,
      next,
      successMessage: `PCI encryption key generated!`
    });
});

circlepay.post('/create-a-payment', async (req, res, next) => {
  console.log('index/create-a-payment');
  await responseExecutor(
    async () => (await createPaymentWeb(req.body)),
    {
      req,
      res,
      next,
      successMessage: `Payment was successful`
    });
});

circlepay.post('/test/subscription', async (req, res, next) => {
  await responseExecutor(
    async () => (await createSubscriptionPayment(req.query.subscriptionId as string)),
    {
      req,
      res,
      next,
      successMessage: `Payment was successful`
    });
});

circlepay.post('/notification/ping', async (req, res, next) => {
  console.info('Received notification from Circle');

  await responseExecutor(async () => {
    const envelope = JSON.parse(req.body);

    if (envelope.Type === 'SubscriptionConfirmation') {
      console.info('Trying to confirm subscription!', envelope.SubscribeURL);

      request(envelope.SubscribeURL, (err) => {
        if (err) {
          throw new CommonError(
            'Something wrong happened verifying the request',
            null, {
              error: err,
              errorString: JSON.stringify(err)
            }
          );
        }

        console.info('Successfully subscribed to the notifications!');
      });
    } else if (envelope.Type === 'Notification') {
      await handleNotification(JSON.parse(envelope.Message) as ICircleNotification);
    } else {
      throw new CommonError(`Unsupported type: ${envelope.Type}`, null, {
        envelope,
        envelopeString: JSON.stringify(envelope)
      });
    }

    console.info('Successfully handled notification');
  }, {
    req,
    res,
    next,
    successMessage: 'Successfully handled notification'
  });
});

circlepay.post('/notification/register', async (req, res, next) => {
  await responseExecutor(async () => {


    await externalRequestExecutor(async () => {
      return (await axios.post(`${circlePayApi}/notifications/subscriptions`, {
          endpoint: 'https://8351633dc3db.ngrok.io/common-staging-50741/us-central1/circlepay/notification/ping'
        }, circlePayApiOptions
      ));
    }, {
      errorCode: ErrorCodes.CirclePayError,
      userMessage: 'Call to CirclePay failed. Please try again later and if the issue persist contact us.'
    });
  }, {
    req,
    res,
    next,
    successMessage: 'Endpoint registered!'
  });
});

export const circlepayApp = functions
  .runWith(runtimeOptions)
  .https.onRequest(commonApp(circlepay));
