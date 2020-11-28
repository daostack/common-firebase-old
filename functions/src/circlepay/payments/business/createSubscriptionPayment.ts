import { ISubscriptionPayment } from '../types';
import { NotImplementedError } from '../../../util/errors';
import * as yup from 'yup';
import { validate } from '../../../util/validate';
import { subscriptionDb } from '../../../subscriptions/database';
import { createEvent } from '../../../util/db/eventDbService';
import { EVENT_TYPES } from '../../../event/event';

const createSubscriptionPaymentValidationSchema = yup.object({
  subscriptionId: yup.string()
    .uuid()
    .required(),

  ipAddress: yup.string()
    .required(),

  sessionId: yup.string()
    .required()
});


export const createSubscriptionPayment = async (payload: yup.InferType<typeof createSubscriptionPaymentValidationSchema>): Promise<ISubscriptionPayment> => {
  // Validate the data
  await validate(payload, createSubscriptionPaymentValidationSchema);

  // Find the subscription
  const subscription = await subscriptionDb.get(payload.subscriptionId);

  // Create event
  // await createEvent({
  //   userId: subscription.userId,
  //   objectId: result.payment.id,
  //   type: EVENT_TYPES.PAYMENT_CREATED
  // });

  throw new NotImplementedError();
}