import * as functions from 'firebase-functions';
import request from 'request';
import axios from 'axios';

import { commonApp, commonRouter, externalRequestExecutor } from '../util';
import { ICircleNotification } from '../util/types';
import { responseExecutor } from '../util/responseExecutor';


import { testIP } from './createCirclePayCard';
import { getCirclePayOptions } from './circlepay';
import { CommonError } from '../util/errors';
import { handleNotification } from './notifications/bussiness/handleNotification';
import { subscribeToNotifications } from './notifications/bussiness/subscribeToNotifications';
import { circlePayApi, getSecret } from '../settings';
import { createCard } from './cards/business/createCard';
import { ErrorCodes } from '../constants';

const runtimeOptions = {
  timeoutSeconds: 540
};

// @todo Rework this
const CIRCLEPAY_APIKEY = 'CIRCLEPAY_APIKEY';
export const getCircleHeaders = async () => (
  getSecret(CIRCLEPAY_APIKEY).then((apiKey) => (
    {
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
  )
);


const circlepay = commonRouter();

// @todo I don't like the URL. Change it to create/card (also in the app, that's why it is more work)
circlepay.post('/create-card', async (req, res, next) => {
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


circlepay.get('/encryption', async (req, res, next) => {
  await responseExecutor(
    async () => {
      const options = await getCirclePayOptions();
      const response = await externalRequestExecutor(async () => {
        return await axios.get(`${circlePayApi}/encryption/public`, options);
      }, {
        errorCode: ErrorCodes.CirclePayError,
        userMessage: 'Call to CirclePay failed. Please try again later and if the issue persist contact us.'
      });

      return response.data;
    },
    {
      req,
      res,
      next,
      successMessage: `PCI encryption key generated!`
    });
});

circlepay.get('/testIP', async (req, res, next) => {
  await responseExecutor(
    async () => (await testIP()),
    {
      req,
      res,
      next,
      successMessage: `Test Ip generated`
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
          throw new CommonError('Something wrong happened verifying the request', {
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
      throw new CommonError(`Unsupported type: ${envelope.Type}`, {
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
    return await subscribeToNotifications();
  }, {
    req,
    res,
    next,
    successMessage: 'Endpoints registered!'
  });
});

export const circlepayApp = functions
  .runWith(runtimeOptions)
  .https.onRequest(commonApp(circlepay));
