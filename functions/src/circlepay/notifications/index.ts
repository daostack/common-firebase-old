import { Router } from 'express';
import request from 'request';


import { responseExecutor } from '../../util/responseExecutor';
import { CommonError } from '../../util/errors';
import { handleNotification } from './bussiness/handleNotification';
import { ICircleNotification } from '../../util/types';
import { subscribeToNotifications } from './bussiness/subscribeToNotifications';

export const addNotificaitonEndpoints = (router: Router): void => {
  router.post('/notification/ping', async (req, res, next) => {
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

  router.post('/notification/register', async (req, res, next) => {
    await responseExecutor(async () => {
      return await subscribeToNotifications();
    }, {
      req,
      res,
      next,
      successMessage: 'Endpoints registered!'
    });
  });
}