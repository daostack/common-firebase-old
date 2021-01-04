import { ArgumentError, NotFoundError } from '../../../util/errors';

import { BankAccountCollection } from './index';
import { IBankAccountEntity } from '../types';
import { circleClient } from '../../client';
import { updateBankAccountInDatabase } from './updateBankAccount';

/**
 * Gets bankAccount by id
 *
 * @param bankAccountId - The ID of the bankAccount, that you want to find
 *
 * @throws { ArgumentError } - If the bankAccountId param is with falsy value
 * @throws { NotFoundError } - If the bankAccount is not found
 *
 * @returns - The found bankAccount
 */
export const getBankAccount = async (bankAccountId: string): Promise<IBankAccountEntity> => {
  if(!bankAccountId) {
    throw new ArgumentError('bankAccountId', bankAccountId);
  }

  const bankAccount = (await BankAccountCollection
    .doc(bankAccountId)
    .get()).data();

  if(!bankAccount) {
    throw new NotFoundError(bankAccountId, 'bankAccount');
  }

  // Update the bank account description if needed
  if (!bankAccount.description) {
    const circleBankAccount = await circleClient.getBankAccount(bankAccount.circleId);

    bankAccount.description = circleBankAccount.data.description;

    await updateBankAccountInDatabase(bankAccount);
  }

  return bankAccount;
}