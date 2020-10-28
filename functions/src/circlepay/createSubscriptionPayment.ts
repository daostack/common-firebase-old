import admin from 'firebase-admin';
import axios from 'axios';
import { v4 as uuid } from 'uuid';

import { ICardEntity, IPaymentEntity, IUserEntity, Nullable } from '../util/types';
import { subscriptionService } from '../subscriptions/subscriptionService';
import { Collections, ErrorCodes } from '../util/constants';
import { externalRequestExecutor } from '../util';
import { CommonError } from '../util/errors';
import { circlePayApi } from '../settings';
import { Utils } from '../util/util';

import { circlePayApiOptions } from './circlepay';

const db = admin.firestore();

/**
 *
 */
export const createSubscriptionPayment = async (subscriptionId: string): Promise<IPaymentEntity> => {
  const subscription = await subscriptionService.findSubscriptionById(subscriptionId);

  const payment = await createPayment(subscription.cardId, subscription.amount);

  return payment;
};

/**
 * Creates a payment on card.
 *
 * @param cardId - the id of the card entity that we will charge (not the cardId from circle)
 * @param amount - the amount that we want to charge in USD
 */
export const createPayment = async (cardId: string, amount: number): Promise<IPaymentEntity> => {
  const card = (await db.collection(Collections.Cards)
    .doc(cardId)
    .get()).data() as Nullable<ICardEntity>;

  if (!card) {
    throw new CommonError(`
      Cannot create payment, because there is no card with id ${cardId}
    `);
  }

  const user = (await Utils.getUserById(card.userId)) as IUserEntity;

  const paymentId = uuid();

  const paymentData = {
    verification: 'none',
    idempotencyKey: paymentId,
    metadata: {
      email: user.email,
      sessionId: uuid(),
      ipAddress: '127.0.0.1'
    },
    amount: {
      amount,
      currency: 'USD'
    },
    source: {
      id: card.cardId,
      type: 'card'
    }
  }

  const { data } = await externalRequestExecutor(async () => {
    return (await axios.post(`${circlePayApi}/payments`,
      paymentData,
      circlePayApiOptions
    )).data;
  }, {
    errorCode: ErrorCodes.CirclePayError,
    userMessage: 'Call to CirclePay failed. Please try again later and if the issue persist contact us.'
  });

  //data = {
  //     "message": "Payment was successful",
  //     "id": "55609bdc-2b20-4962-8640-d69c6df46f7c",
  //     "type": "payment",
  //     "merchantId": "fd8417cb-34c0-4a56-9d52-d4245c02cd38",
  //     "merchantWalletId": "1000032538",
  //     "source": {
  //         "id": "587dcee0-7a03-4900-9c08-bd81d6e98f69",
  //         "type": "card"
  //     },
  //     "description": "Merchant Payment",
  //     "amount": {
  //         "amount": "1.00",
  //         "currency": "USD"
  //     },
  //     "status": "pending",
  //     "refunds": [],
  //     "createDate": "2020-10-28T07:26:06.324Z",
  //     "updateDate": "2020-10-28T07:26:06.324Z",
  //     "metadata": {
  //         "email": "moore3.14159@gmail.com"
  //     }
  //}


};