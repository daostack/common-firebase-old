import axios from 'axios';
import * as yup from 'yup';

import { ErrorCodes } from '../../../constants';
import { circlePayApi } from '../../../settings';
import { validate } from '../../../util/validate';
import { externalRequestExecutor } from '../../../util';
import { billingDetailsValidationSchema } from '../../../util/schemas';

import { ICircleCreateCardPayload, ICircleCreateCardResponse } from '../../types';
import { getCircleHeaders } from '../../index';
import { ICardEntity } from '../types';
import { userDb } from '../../../users/database';
import { cardDb } from '../database';
import { createEvent } from '../../../util/db/eventDbService';
import { EVENT_TYPES } from '../../../event/event';

const createCardValidationSchema = yup.object({
  ownerId: yup.string()
    .required(),

  billingDetails: billingDetailsValidationSchema
    .required(),

  keyId: yup
    .string()
    .required(),

  idempotencyKey: yup
    .string()
    .required(),

  sessionId: yup
    .string()
    .required(),

  ipAddress: yup
    .string()
    .required(),

  encryptedData: yup
    .string()
    .required(),

  expMonth: yup
    .number()
    .min(1)
    .max(12)
    .required(),

  expYear: yup
    .number()
    .min(new Date().getFullYear())
    .max(new Date().getFullYear() + 50)
    .required()
});

type CreateCardPayload = yup.InferType<typeof createCardValidationSchema>;

/**
 * Creates card in the FireStore and on Circle side.
 *
 *
 *
 * @param payload
 */
export const createCard = async (payload: CreateCardPayload): Promise<ICardEntity> => {
  // Validate the passed data
  await validate(payload, createCardValidationSchema);

  // Find the creator
  const user = await userDb.get(payload.ownerId);

  // Format the data for circle
  const headers = await getCircleHeaders();
  const data: ICircleCreateCardPayload = {
    billingDetails: payload.billingDetails as any,
    encryptedData: payload.encryptedData,
    expMonth: payload.expMonth,
    expYear: payload.expYear,
    idempotencyKey: payload.idempotencyKey || payload.sessionId,
    keyId: payload.keyId,
    metadata: {
      email: user.email,
      ipAddress: payload.ipAddress,
      sessionId: payload.sessionId
    }
  };

  // circle card id and user id should be unique :<

  // Create the card on Circle
  const response = await externalRequestExecutor<ICircleCreateCardResponse>(async () => {
    return (await axios.post<ICircleCreateCardResponse>(`${circlePayApi}/cards`,
      data,
      headers
    )).data;
  }, {
    errorCode: ErrorCodes.CirclePayError,
    userMessage: 'Cannot create the card, because it was rejected by Circle'
  });

  console.log(JSON.stringify(response));

  // If the card was created successfully save it
  const card = await cardDb.add({
    ownerId: user.id,
    circleCardId: response.id,
    metadata: {
      billingDetails: data.billingDetails,
      digits: response.last4,
      network: response.network
    }
  });

  // Create event
  await createEvent({
    type: EVENT_TYPES.
  })

  // Return the created card
  return card;
};