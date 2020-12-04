import { PayoutsCollection } from './index';
import { IPayoutEntity } from '../types';

interface IGetPayoutsOptions {
  proposalId: string;
}

/**
 * Returns array of payouts matching all the requirements
 *
 * @param options - The options for which to retrieve payouts
 */
export const getPayouts = async (options: IGetPayoutsOptions): Promise<IPayoutEntity[]> => {
  let payoutsQuery: any = PayoutsCollection;

  if (options.proposalId) {
    payoutsQuery = payoutsQuery.where('proposalId', '==', options.proposalId);
  }

  return (await payoutsQuery.get())
    .docs.map(x => x.data());
};