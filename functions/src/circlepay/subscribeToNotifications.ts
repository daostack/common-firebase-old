import axios from 'axios';

import { env } from '../env';
import { circlePayApi } from '../settings';
import { externalRequestExecutor } from '../util';
import { circlePayApiOptions } from './circlepay';
import { ErrorCodes } from '../util/constants';
import { IUserEntity } from '../util/types';

export const subscribeToNotifications = async (): Promise<void> => {
  const currentSubscriptions = await externalRequestExecutor<{
    data: {
      id: string;
      endpoint: string;
      subscriptionDetails: {
        url: string;
        status: string;
      }[]
    }[];
  }>(async () => {
    return (await axios.get(`${circlePayApi}/notifications/subscriptions`, circlePayApiOptions)).data;
  }, {
    errorCode: ErrorCodes.CirclePayError,
    userMessage: 'Call to CirclePay failed. Please try again later and if the issue persist contact us.'
  });

  // let endpoints = [
  //   env.hosts.firebase,
  //   env.hosts.local
  // ];

  let endpoints = ['https://11184351a378.ngrok.io/common-staging-50741/us-central1/circlepay/notification/ping'];

  for (const sub of currentSubscriptions.data) {
    if (endpoints.some(endpoint => endpoint === sub.endpoint)) {
      endpoints = endpoints.filter(endpoint => endpoint === sub.endpoint);
    } else {
      try {
        // eslint-disable-next-line no-await-in-loop
        await unsubscribeFromNotification(sub.id);
      } catch (e) {
        console.error(`
          Unable to unsubscribe from ${sub.id} for endpoint ${sub.endpoint}
        `, e);
      }
    }
  }

  if (endpoints.length) {
    for (const endpoint of endpoints) {
      // eslint-disable-next-line no-await-in-loop
      await subscribeEndpoint(endpoint);
    }
  }
};

const unsubscribeFromNotification = async (notificationId: string): Promise<void> => {
  await externalRequestExecutor(async () => {
    return (await axios.delete(`${circlePayApi}/notifications/${notificationId}`, circlePayApiOptions));
  }, {
    errorCode: ErrorCodes.CirclePayError,
    userMessage: 'Something bad happened while trying to unsubscribe from notification'
  });
};

const subscribeEndpoint = async (endpoint: string): Promise<void> => {
  await externalRequestExecutor(async () => {
    return (await axios.post(`${circlePayApi}/notifications/subscriptions`, {
      endpoint
    }, circlePayApiOptions));
  }, {
    errorCode: ErrorCodes.CirclePayError,
    userMessage: 'Something bad happened while trying to unsubscribe from notification'
  });
};