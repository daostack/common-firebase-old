import admin from 'firebase-admin';
import axios from 'axios';
import { v4 as uuid } from 'uuid';

import {
  CirclePaymentStatus,
  ICardEntity,
  IPaymentEntity,
  ISubscriptionEntity,
  IUserEntity,
  Nullable
} from '../util/types';
import { subscriptionService } from '../subscriptions/subscriptionService';
import { Collections, ErrorCodes } from '../util/constants';
import { createEvent } from '../db/eventDbService';
import { externalRequestExecutor } from '../util';
import { CommonError } from '../util/errors';
import { EVENT_TYPES } from '../event/event';
import { circlePayApi } from '../settings';
import { Utils } from '../util/util';

import { circlePayApiOptions } from './circlepay';

const db = admin.firestore();

interface ICirclePaymentResponse {
  data: ICirclePaymentResponseData;
}

interface ICirclePaymentResponseData {
  id: string;

  source: {
    id: string;
    type: string;
  }

  amount: {
    amount: string;
    currency: string;
  }

  status: CirclePaymentStatus;

  createDate: Date;
  updateDate: Date;

  refunds: any[];
}

/**
 * Creates a payment for subscription and saves it.
 *
 * @param subscriptionId - The id of the subscription that you want to charge
 *
 * @throws { CommonError } - If there is pending payment
 *
 * @returns - the created payment
 */
export const createSubscriptionPayment = async (subscription: ISubscriptionEntity): Promise<IPaymentEntity> => {
  // Do not create more payments if there are any pending
  // ones. This may happen, but should not
  if (subscription.payments.some(payment => payment.paymentStatus === 'pending')) {
    throw new CommonError(`
      Trying to create payment for subscription (${subscription.id}), but 
      there are pending payments on that subscription!
    `);
  }

  const circleResponse = await makePayment(subscription.cardId, subscription.amount);
  const result = await saveSubscriptionPayment(subscription, circleResponse);

  await createEvent({
    userId: subscription.userId,
    objectId: result.payment.id,
    createdAt: new Date(),
    type: EVENT_TYPES.PAYMENT_CREATED
  });

  return result.payment;
};

/**
 * Creates a payment on card. This only charges the card in circle and does not create payment record!
 *
 * @param cardId - the id of the card entity that we will charge (not the cardId from circle)
 * @param amount - the amount that we want to charge in USD
 *
 * @throws { CommonError } - if there is no card found for the provided card ID
 * @throws { CommonError } - if the request to circle fails
 *
 * @returns - The response from circle
 */
const makePayment = async (cardId: string, amount: number): Promise<ICirclePaymentResponseData> => {
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
  };

  const {data} = await externalRequestExecutor<ICirclePaymentResponse>(async () => {
    return (await axios.post<ICirclePaymentResponse>(`${circlePayApi}/payments`,
      paymentData,
      circlePayApiOptions
    )).data;
  }, {
    errorCode: ErrorCodes.CirclePayError,
    userMessage: 'Call to CirclePay failed. Please try again later and if the issue persist contact us.'
  });


  return data;
};

/**
 *  Used for creating new payment and linking them to subscription or updating the status of existing one
 *
 * @param subscription - The subscription that the payment will (or already is) linked to
 * @param circlePayment - The response from circle
 *
 * @returns - The created (or updated) payment and subscription entities
 */
export const saveSubscriptionPayment = async (subscription: ISubscriptionEntity, circlePayment: ICirclePaymentResponseData): Promise<{
  payment: IPaymentEntity,
  subscription: ISubscriptionEntity
}> => {
  const payment: IPaymentEntity = {
    id: circlePayment.id,
    source: circlePayment.source,
    amount: circlePayment.amount,
    status: circlePayment.status,
    refunds: circlePayment.refunds,
    createDate: circlePayment.createDate,
    updateDate: circlePayment.updateDate,

    subscriptionId: subscription.id,

    type: 'SubscriptionPayment'
  };

  const subscriptionPayments = (subscription.payments || [])
    .filter(x => x.paymentId !== payment.id);

  subscriptionPayments
    .push({
      paymentId: payment.id,
      paymentStatus: payment.status
    });

  subscription = {
    ...subscription,
    payments: subscriptionPayments
  };

  // Update (or create) the payment and subscription
  await db.collection(Collections.Payments)
    .doc(payment.id)
    .set(payment);

  // await db.collection(Collections.Subscriptions)
  //   .doc(subscription.id)
  //   .set(subscription);
  await subscriptionService.updateSubscription(subscription);

  return {
    payment,
    subscription
  };
};