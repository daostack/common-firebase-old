import * as functions from 'firebase-functions';
import axios from 'axios';

import { commonApp, commonRouter, externalRequestExecutor } from '../util';
import { responseExecutor } from '../util/responseExecutor';
import { circlePayApi, getSecret } from '../settings';
import { ErrorCodes } from '../constants';

import { addCardEndpoints } from './cards';
import { addBankAccountEndpoints } from './backAccounts';
import { addNotificaitonEndpoints } from './notifications';

const runtimeOptions = {
  timeoutSeconds: 540
};

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

addCardEndpoints(circlepay);
addBankAccountEndpoints(circlepay);
addNotificaitonEndpoints(circlepay);

circlepay.get('/encryption', async (req, res, next) => {
  await responseExecutor(
    async () => {
      const options = await getCircleHeaders();
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
    async () => {
      const response = await axios.get('https://api.ipify.org?format=json');
      return {
        ip: response.data
      };
    }, {
      req,
      res,
      next,
      successMessage: `Test Ip generated`
    });
});

export const circlepayApp = functions
  .runWith(runtimeOptions)
  .https.onRequest(commonApp(circlepay));
