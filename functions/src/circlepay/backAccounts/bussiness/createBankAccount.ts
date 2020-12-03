import * as yup from 'yup';
import iban from 'ibantools';
import { billingDetailsValidationSchema } from '../../../util/schemas';
import { IBankAccountEntity } from '../types';
import { NotImplementedError } from '../../../util/errors';
import { validate } from '../../../util/validate';

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


  throw new NotImplementedError();
};