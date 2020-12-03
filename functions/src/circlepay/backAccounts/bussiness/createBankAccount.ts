import * as yup from 'yup';
import iban from 'ibantools';
import { v4 } from 'uuid';

import { billingDetailsValidationSchema } from '../../../util/schemas';
import { IBankAccountEntity } from '../types';
import { NotImplementedError } from '../../../util/errors';
import { validate } from '../../../util/validate';
import { getCircleHeaders } from '../../index';
import { ICircleCreateBankAccountPayload, ICircleCreateBankAccountResponse } from '../../cards/circleTypes';
import { externalRequestExecutor } from '../../../util';
import { ICircleCreateCardResponse } from '../../types';
import axios from 'axios';
import { circlePayApi } from '../../../settings';
import { ErrorCodes } from '../../../constants';

const bankAccountValidationSchema = yup.object({
  idempotencyKey: yup.string(),

  iban: yup
    .string()
    .required()
    .test({
      name: 'Validate IBAN',
      message: 'Please provide valid IBAN',
      test: (value): boolean => {
        return iban.isValidIBAN(value);
      }
    }),

  billingDetails: billingDetailsValidationSchema,
  bankAddress: billingDetailsValidationSchema
});

type createBankAccountPayload = yup.InferType<typeof bankAccountValidationSchema>;

export const createBankAccount = async (payload: createBankAccountPayload): Promise<IBankAccountEntity> => {
  // Validate the provided data
  await validate(payload, bankAccountValidationSchema);

  // Format the data for circle
  const headers = await getCircleHeaders();
  const data: ICircleCreateBankAccountPayload = {
    iban: payload.iban,
    idempotencyKey: v4(),

    bankAddress: payload.bankAddress as any,
    billingDetails: payload.billingDetails as any,
  }

  // Create the account on Circle
  const { data: response } = await externalRequestExecutor<ICircleCreateBankAccountResponse>(async () => {
    return (await axios.post<ICircleCreateBankAccountResponse>(`${circlePayApi}/banks/wires`,
      data,
      headers
    )).data;
  }, {
    errorCode: ErrorCodes.CirclePayError,
    userMessage: 'Cannot create the bank account, because it was rejected by Circle'
  });

  return response as any;
};